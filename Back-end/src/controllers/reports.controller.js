// src/controllers/reports.controller.js
const prisma = require("../lib/prisma");

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//       1. تقرير المخزون
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const getStockReport = async (req, res, next) => {
  try {
    const { category } = req.query;

    // كل المنتجات مع الفاريانتس
    const products = await prisma.product.findMany({
      where: {
        ...(category && { category }),
      },
      include: {
        variants: true,
      },
      orderBy: { category: "asc" },
    });

    // احسب إجماليات لكل منتج
    const stockData = products.map((product) => {
      const totalStock = product.variants.reduce(
        (sum, v) => sum + v.stockQuantity,
        0,
      );
      const totalValue = product.variants.reduce(
        (sum, v) => sum + v.stockQuantity * Number(v.purchasePrice),
        0,
      );
      const totalSellingValue = product.variants.reduce(
        (sum, v) => sum + v.stockQuantity * Number(v.sellingPrice),
        0,
      );

      return {
        id: product.id,
        modelNumber: product.modelNumber,
        name: product.name,
        category: product.category,
        totalStock,
        totalPurchaseValue: totalValue, // قيمة المخزون بسعر الشراء
        totalSellingValue, // قيمة المخزون بسعر البيع
        potentialProfit: totalSellingValue - totalValue, // الربح المتوقع
        variants: product.variants.map((v) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          type: v.type,
          purchasePrice: v.purchasePrice,
          sellingPrice: v.sellingPrice,
          stockQuantity: v.stockQuantity,
          minStockAlert: v.minStockAlert,
          isLowStock: v.stockQuantity <= v.minStockAlert, // ← تنبيه
        })),
      };
    });

    // إجماليات كاملة
    const summary = {
      totalProducts: products.length,
      totalVariants: products.reduce((sum, p) => sum + p.variants.length, 0),
      totalItems: stockData.reduce((sum, p) => sum + p.totalStock, 0),
      totalPurchaseValue: stockData.reduce(
        (sum, p) => sum + p.totalPurchaseValue,
        0,
      ),
      totalSellingValue: stockData.reduce(
        (sum, p) => sum + p.totalSellingValue,
        0,
      ),
      totalPotentialProfit: stockData.reduce(
        (sum, p) => sum + p.potentialProfit,
        0,
      ),
      lowStockCount: products.reduce((sum, p) => {
        return (
          sum +
          p.variants.filter((v) => v.stockQuantity <= v.minStockAlert).length
        );
      }, 0),
    };

    res.json({
      success: true,
      data: { summary, products: stockData },
    });
  } catch (err) {
    next(err);
  }
};

// ─── منتجات تحت الحد الأدنى ───
const getLowStockReport = async (req, res, next) => {
  try {
    const lowStock = await prisma.$queryRaw`
      SELECT 
        pv.id         AS "variantId",
        pv.size,
        pv.color,
        pv.type,
        pv.stock_quantity  AS "stockQuantity",
        pv.min_stock_alert AS "minStockAlert",
        pv.purchase_price  AS "purchasePrice",
        pv.selling_price   AS "sellingPrice",
        p.id          AS "productId",
        p.model_number AS "modelNumber",
        p.name,
        p.category
      FROM product_variants pv
      JOIN products p ON p.id = pv.product_id
      WHERE pv.stock_quantity <= pv.min_stock_alert
      ORDER BY pv.stock_quantity ASC
    `;

    res.json({
      success: true,
      data: {
        count: lowStock.length,
        items: lowStock,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//       2. تقرير الديون
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── ديون الموردين ───
const getSupplierDebtsReport = async (req, res, next) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { totalDebt: { gt: 0 } },
      include: {
        purchaseInvoices: {
          where: { remaining: { gt: 0 } },
          orderBy: { invoiceDate: "asc" },
          select: {
            id: true,
            invoiceNo: true,
            invoiceDate: true,
            totalAmount: true,
            paidAmount: true,
            remaining: true,
            paymentType: true,
          },
        },
      },
      orderBy: { totalDebt: "desc" },
    });

    const summary = {
      totalSuppliers: suppliers.length,
      totalDebt: suppliers.reduce((sum, s) => sum + Number(s.totalDebt), 0),
    };

    res.json({
      success: true,
      data: { summary, suppliers },
    });
  } catch (err) {
    next(err);
  }
};

// ─── ديون العملاء ───
const getCustomerDebtsReport = async (req, res, next) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { totalDebt: { gt: 0 } },
      include: {
        salesInvoices: {
          where: { remaining: { gt: 0 } },
          orderBy: { invoiceDate: "asc" },
          select: {
            id: true,
            invoiceNo: true,
            invoiceDate: true,
            totalAmount: true,
            paidAmount: true,
            remaining: true,
            paymentType: true,
          },
        },
      },
      orderBy: { totalDebt: "desc" },
    });

    const summary = {
      totalCustomers: customers.length,
      totalDebt: customers.reduce((sum, c) => sum + Number(c.totalDebt), 0),
    };

    res.json({
      success: true,
      data: { summary, customers },
    });
  } catch (err) {
    next(err);
  }
};

// ─── ملخص الديون (موردين + عملاء معاً) ───
const getDebtsReport = async (req, res, next) => {
  try {
    const [supplierDebts, customerDebts] = await Promise.all([
      prisma.supplier.aggregate({
        _sum: { totalDebt: true },
        _count: { id: true },
        where: { totalDebt: { gt: 0 } },
      }),
      prisma.customer.aggregate({
        _sum: { totalDebt: true },
        _count: { id: true },
        where: { totalDebt: { gt: 0 } },
      }),
    ]);

    res.json({
      success: true,
      data: {
        // ما علينا دفعه للموردين
        suppliersDebt: {
          total: supplierDebts._sum.totalDebt || 0,
          count: supplierDebts._count.id,
        },
        // ما على العملاء دفعه لينا
        customersDebt: {
          total: customerDebts._sum.totalDebt || 0,
          count: customerDebts._count.id,
        },
        // الصافي = اللي هناخده - اللي هندفعه
        netBalance:
          Number(customerDebts._sum.totalDebt || 0) -
          Number(supplierDebts._sum.totalDebt || 0),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//       3. تقرير الأرباح
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const getProfitReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;

    // لو مفيش تاريخ، هناخد الشهر الحالي
    const startDate = from
      ? new Date(from)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const endDate = to ? new Date(to) : new Date();

    // جلب كل فواتير البيع في الفترة دي
    const salesInvoices = await prisma.salesInvoice.findMany({
      where: {
        invoiceDate: { gte: startDate, lte: endDate },
      },
      include: {
        items: {
          include: {
            variant: {
              select: {
                purchasePrice: true,
                sellingPrice: true,
                product: {
                  select: { name: true, modelNumber: true, category: true },
                },
              },
            },
          },
        },
      },
    });

    // احسب الربح من كل فاتورة
    const invoicesProfit = salesInvoices.map((invoice) => {
      const revenue = Number(invoice.totalAmount); // إيراد البيع
      const discount = Number(invoice.discount);

      // تكلفة البضاعة المباعة (COGS)
      const cogs = invoice.items.reduce((sum, item) => {
        return sum + item.quantity * Number(item.variant.purchasePrice);
      }, 0);

      const grossProfit = revenue - cogs; // الربح الإجمالي

      return {
        invoiceId: invoice.id,
        invoiceNo: invoice.invoiceNo,
        invoiceDate: invoice.invoiceDate,
        revenue,
        discount,
        cogs,
        grossProfit,
      };
    });

    // ─── إجماليات الفترة ───
    const totalRevenue = invoicesProfit.reduce((sum, i) => sum + i.revenue, 0);
    const totalCogs = invoicesProfit.reduce((sum, i) => sum + i.cogs, 0);
    const totalDiscount = invoicesProfit.reduce(
      (sum, i) => sum + i.discount,
      0,
    );
    const totalGrossProfit = totalRevenue - totalCogs;
    const profitMargin =
      totalRevenue > 0
        ? ((totalGrossProfit / totalRevenue) * 100).toFixed(2)
        : 0;

    // ─── تقرير حسب الفئة ───
    const categoryProfit = {};

    salesInvoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        const category = item.variant.product.category;
        const revenue = item.quantity * Number(item.unitPrice);
        const cogs = item.quantity * Number(item.variant.purchasePrice);

        if (!categoryProfit[category]) {
          categoryProfit[category] = {
            revenue: 0,
            cogs: 0,
            profit: 0,
            quantity: 0,
          };
        }

        categoryProfit[category].revenue += revenue;
        categoryProfit[category].cogs += cogs;
        categoryProfit[category].profit += revenue - cogs;
        categoryProfit[category].quantity += item.quantity;
      });
    });

    // ─── أكتر منتج ربحاً ───
    const productProfit = {};

    salesInvoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        const key = item.variant.product.modelNumber;
        const revenue = item.quantity * Number(item.unitPrice);
        const cogs = item.quantity * Number(item.variant.purchasePrice);

        if (!productProfit[key]) {
          productProfit[key] = {
            modelNumber: key,
            name: item.variant.product.name,
            category: item.variant.product.category,
            revenue: 0,
            cogs: 0,
            profit: 0,
            quantity: 0,
          };
        }

        productProfit[key].revenue += revenue;
        productProfit[key].cogs += cogs;
        productProfit[key].profit += revenue - cogs;
        productProfit[key].quantity += item.quantity;
      });
    });

    // رتّب المنتجات من الأعلى ربحاً للأقل
    const topProducts = Object.values(productProfit)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        period: { from: startDate, to: endDate },

        // ─── الملخص العام ───
        summary: {
          totalRevenue, // إجمالي الإيراد
          totalCogs, // إجمالي تكلفة البضاعة
          totalDiscount, // إجمالي الخصومات
          totalGrossProfit, // إجمالي الربح
          profitMargin: `${profitMargin}%`, // نسبة الربح
          invoicesCount: salesInvoices.length,
        },

        // ─── حسب الفئة ───
        byCategory: Object.entries(categoryProfit).map(([category, data]) => ({
          category,
          ...data,
          profitMargin:
            data.revenue > 0
              ? `${((data.profit / data.revenue) * 100).toFixed(2)}%`
              : "0%",
        })),

        // ─── أكتر 10 منتجات ربحاً ───
        topProducts,

        // ─── تفاصيل الفواتير ───
        invoices: invoicesProfit,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//       4. الداشبورد (الرئيسية)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const getDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));

    const [
      totalProducts,
      lowStockCount,
      supplierDebt,
      customerDebt,
      todaySales,
      monthSales,
      todayPurchases,
      recentSales,
      recentPurchases,
    ] = await Promise.all([
      // إجمالي المنتجات
      prisma.productVariant.count(),

      // منتجات تحت الحد
      prisma.$queryRaw`
        SELECT COUNT(*) FROM product_variants
        WHERE stock_quantity <= min_stock_alert
      `,

      // ديون الموردين
      prisma.supplier.aggregate({
        _sum: { totalDebt: true },
      }),

      // ديون العملاء
      prisma.customer.aggregate({
        _sum: { totalDebt: true },
      }),

      // مبيعات اليوم
      prisma.salesInvoice.aggregate({
        _sum: { totalAmount: true },
        _count: { id: true },
        where: { invoiceDate: { gte: startOfDay } },
      }),

      // مبيعات الشهر
      prisma.salesInvoice.aggregate({
        _sum: { totalAmount: true },
        _count: { id: true },
        where: { invoiceDate: { gte: startOfMonth } },
      }),

      // مشتريات اليوم
      prisma.purchaseInvoice.aggregate({
        _sum: { totalAmount: true },
        _count: { id: true },
        where: { invoiceDate: { gte: startOfDay } },
      }),

      // آخر 5 فواتير بيع
      prisma.salesInvoice.findMany({
        take: 5,
        orderBy: { invoiceDate: "desc" },
        include: {
          customer: { select: { name: true } },
        },
      }),

      // آخر 5 فواتير شراء
      prisma.purchaseInvoice.findMany({
        take: 5,
        orderBy: { invoiceDate: "desc" },
        include: {
          supplier: { select: { name: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        // ─── بطاقات الرئيسية ───
        cards: {
          totalProducts,
          lowStockCount: Number(lowStockCount[0].count),
          supplierDebt: supplierDebt._sum.totalDebt || 0,
          customerDebt: customerDebt._sum.totalDebt || 0,

          todaySales: {
            amount: todaySales._sum.totalAmount || 0,
            count: todaySales._count.id,
          },
          monthSales: {
            amount: monthSales._sum.totalAmount || 0,
            count: monthSales._count.id,
          },
          todayPurchases: {
            amount: todayPurchases._sum.totalAmount || 0,
            count: todayPurchases._count.id,
          },
        },

        // ─── آخر العمليات ───
        recentActivity: {
          sales: recentSales,
          purchases: recentPurchases,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStockReport,
  getLowStockReport,
  getSupplierDebtsReport,
  getCustomerDebtsReport,
  getDebtsReport,
  getProfitReport,
  getDashboard,
};

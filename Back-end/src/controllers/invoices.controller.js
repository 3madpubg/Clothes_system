const prisma = require("../lib/prisma");

// ─── بيانات فاتورة بيع للطباعة ───
const getSaleInvoicePrint = async (req, res, next) => {
  try {
    const invoice = await prisma.salesInvoice.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        customer: true,
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: { name: true, modelNumber: true, category: true },
                },
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "الفاتورة مش موجودة" });
    }

    // تنسيق البيانات للطباعة
    const printData = {
      shopName: "محل الملابس", // ← هتجيبه من الـ settings
      invoiceNo: invoice.invoiceNo,
      date: invoice.invoiceDate,
      customer: invoice.customer?.name || "عميل نقدي",
      phone: invoice.customer?.phone || "",
      items: invoice.items.map((item) => ({
        name: item.variant.product.name,
        model: item.variant.product.modelNumber,
        size: item.variant.size,
        color: item.variant.color,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })),
      subtotal: Number(invoice.totalAmount) + Number(invoice.discount),
      discount: Number(invoice.discount),
      total: Number(invoice.totalAmount),
      paid: Number(invoice.paidAmount),
      remaining: Number(invoice.remaining),
      paymentType: invoice.paymentType,
      status: invoice.status,
    };

    res.json({ success: true, data: printData });
  } catch (err) {
    next(err);
  }
};

// ─── بيانات فاتورة شراء للطباعة ───
const getPurchaseInvoicePrint = async (req, res, next) => {
  try {
    const invoice = await prisma.purchaseInvoice.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        supplier: true,
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: { name: true, modelNumber: true },
                },
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "الفاتورة مش موجودة" });
    }

    const printData = {
      shopName: "محل الملابس",
      invoiceNo: invoice.invoiceNo,
      date: invoice.invoiceDate,
      supplier: invoice.supplier?.name || "مورد نقدي",
      phone: invoice.supplier?.phone || "",
      items: invoice.items.map((item) => ({
        name: item.variant.product.name,
        model: item.variant.product.modelNumber,
        size: item.variant.size,
        color: item.variant.color,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })),
      total: Number(invoice.totalAmount),
      paid: Number(invoice.paidAmount),
      remaining: Number(invoice.remaining),
      paymentType: invoice.paymentType,
    };

    res.json({ success: true, data: printData });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSaleInvoicePrint, getPurchaseInvoicePrint };

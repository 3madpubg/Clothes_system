const prisma = require("../lib/prisma");

// ─── جلب كل فواتير الشراء ───
const getAllPurchases = async (req, res, next) => {
  try {
    const { supplierId, from, to } = req.query;

    const purchases = await prisma.purchaseInvoice.findMany({
      where: {
        ...(supplierId && { supplierId: parseInt(supplierId) }),
        ...(from &&
          to && {
            invoiceDate: { gte: new Date(from), lte: new Date(to) },
          }),
      },
      include: {
        supplier: { select: { id: true, name: true } },
        items: {
          include: {
            variant: {
              include: {
                product: { select: { name: true, modelNumber: true } },
              },
            },
          },
        },
      },
      orderBy: { invoiceDate: "desc" },
    });

    res.json({ success: true, data: purchases });
  } catch (err) {
    next(err);
  }
};

// ─── إنشاء فاتورة شراء ───
const createPurchase = async (req, res, next) => {
  try {
    const { supplierId, invoiceDate, paymentType, paidAmount, notes, items } =
      req.body;

    const normalizedSupplierId =
      supplierId === "" || supplierId === null || supplierId === undefined
        ? null
        : Number(supplierId);

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "يجب إضافة بند واحد على الأقل في فاتورة الشراء",
      });
    }

    if (normalizedSupplierId !== null && Number.isNaN(normalizedSupplierId)) {
      return res.status(400).json({
        success: false,
        message: "المورد المحدد غير صالح",
      });
    }

    if (paymentType === "CREDIT" && !normalizedSupplierId) {
      return res.status(400).json({
        success: false,
        message: "يجب اختيار مورد عند الدفع الآجل",
      });
    }

    if (normalizedSupplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: normalizedSupplierId },
        select: { id: true },
      });

      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: "المورد غير موجود",
        });
      }
    }

    // items شكلها:
    // [{ modelNumber, name, category, size, color, type, quantity, unitPrice, sellingPrice }]

    // احسب الإجمالي
    const totalAmount = items.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);

    const paid = paidAmount || (paymentType === "CASH" ? totalAmount : 0);
    const remaining = totalAmount - paid;

    // كل ده في Transaction واحدة عشان لو فيه أي error يرجع كل حاجة
    const result = await prisma.$transaction(async (tx) => {
      // 1. إنشاء الفاتورة
      const invoiceData = {
        invoiceNo: await generateInvoiceNo(tx, "PUR"),
        invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        totalAmount,
        paidAmount: paid,
        remaining,
        paymentType,
        notes,
        ...(normalizedSupplierId ? { supplierId: normalizedSupplierId } : {}),
      };

      const invoice = await tx.purchaseInvoice.create({
        data: invoiceData,
      });

      // 2. معالجة كل بند في الفاتورة
      for (const item of items) {
        // دور على المنتج برقم الموديل
        let product = await tx.product.findUnique({
          where: { modelNumber: item.modelNumber },
        });

        // لو مش موجود، اعمله
        if (!product) {
          product = await tx.product.create({
            data: {
              modelNumber: item.modelNumber,
              name: item.name,
              category: item.category,
            },
          });
        }

        // دور على الفاريانت
        let variant = await tx.productVariant.findUnique({
          where: {
            productId_size_color_type: {
              productId: product.id,
              size: item.size,
              color: item.color,
              type: item.type,
            },
          },
        });

        // لو مش موجود، اعمله
        if (!variant) {
          variant = await tx.productVariant.create({
            data: {
              productId: product.id,
              size: item.size,
              color: item.color,
              type: item.type,
              purchasePrice: item.unitPrice,
              sellingPrice: item.sellingPrice || item.unitPrice * 2,
            },
          });
        }

        // 3. إضافة البند للفاتورة
        await tx.purchaseInvoiceItem.create({
          data: {
            invoiceId: invoice.id,
            variantId: variant.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          },
        });

        // 4. زود الـ stock
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }

      // 5. حدّث ديون المورد
      if (normalizedSupplierId) {
        await tx.supplier.update({
          where: { id: normalizedSupplierId },
          data: { totalDebt: { increment: remaining } },
        });
      }

      // 6. لو دفع جزء، سجل الدفعة
      if (paid > 0 && normalizedSupplierId) {
        await tx.supplierPayment.create({
          data: {
            supplierId: normalizedSupplierId,
            invoiceId: invoice.id,
            amount: paid,
            notes: "دفعة عند إنشاء الفاتورة",
          },
        });
      }

      return invoice;
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// ─── جلب فاتورة واحدة ───
const getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await prisma.purchaseInvoice.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        supplier: true,
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
        payments: true,
      },
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "الفاتورة غير موجودة",
      });
    }

    res.json({ success: true, data: purchase });
  } catch (err) {
    next(err);
  }
};

// ─── Helper: توليد رقم فاتورة ───
async function generateInvoiceNo(tx, prefix) {
  const count = await tx.purchaseInvoice.count();
  const number = String(count + 1).padStart(5, "0");
  return `${prefix}-${number}`; // PUR-00001
}

module.exports = { getAllPurchases, createPurchase, getPurchaseById };

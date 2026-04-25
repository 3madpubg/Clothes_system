const prisma = require("../lib/prisma");

const getAllSales = async (req, res, next) => {
  try {
    const { customerId, from, to } = req.query;

    const sales = await prisma.salesInvoice.findMany({
      where: {
        ...(customerId && { customerId: parseInt(customerId) }),
        ...(from &&
          to && {
            invoiceDate: { gte: new Date(from), lte: new Date(to) },
          }),
      },
      include: {
        customer: { select: { id: true, name: true } },
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

    res.json({ success: true, data: sales });
  } catch (err) {
    next(err);
  }
};

const createSale = async (req, res, next) => {
  try {
    const {
      customerId,
      invoiceDate,
      paymentType,
      paidAmount,
      discount,
      notes,
      items,
    } = req.body;

    // items: [{ variantId, quantity, unitPrice }]

    // تحقق من الـ stock قبل أي حاجة
    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });

      if (!variant) {
        return res.status(404).json({
          success: false,
          message: `المنتج غير موجود`,
        });
      }

      if (variant.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `الكمية غير كافية في المخزون - ${variant.product.name} (${variant.size} - ${variant.color}) - المتاح: ${variant.stockQuantity}`,
        });
      }
    }

    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const totalAmount = subtotal - (discount || 0);
    const paid = paidAmount || (paymentType === "CASH" ? totalAmount : 0);
    const remaining = totalAmount - paid;

    const result = await prisma.$transaction(async (tx) => {
      // 1. إنشاء الفاتورة
      const invoice = await tx.salesInvoice.create({
        data: {
          invoiceNo: await generateSalesNo(tx),
          customerId: customerId || null,
          invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
          totalAmount,
          discount: discount || 0,
          paidAmount: paid,
          remaining,
          paymentType,
          notes,
        },
      });

      // 2. إضافة البنود وخصم الـ stock
      for (const item of items) {
        await tx.salesInvoiceItem.create({
          data: {
            invoiceId: invoice.id,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          },
        });

        // اخصم من الـ stock
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      // 3. حدّث ديون العميل لو آجل
      if (customerId && remaining > 0) {
        await tx.customer.update({
          where: { id: customerId },
          data: { totalDebt: { increment: remaining } },
        });
      }

      // 4. سجل الدفعة لو دفع
      if (paid > 0 && customerId) {
        await tx.customerPayment.create({
          data: {
            customerId,
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

const getSaleById = async (req, res, next) => {
  try {
    const sale = await prisma.salesInvoice.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        customer: true,
        items: {
          include: {
            variant: { include: { product: true } },
          },
        },
        payments: true,
      },
    });

    if (!sale) {
      return res
        .status(404)
        .json({ success: false, message: "الفاتورة غير موجودة" });
    }

    res.json({ success: true, data: sale });
  } catch (err) {
    next(err);
  }
};

async function generateSalesNo(tx) {
  const count = await tx.salesInvoice.count();
  return `SAL-${String(count + 1).padStart(5, "0")}`;
}

module.exports = { getAllSales, createSale, getSaleById };

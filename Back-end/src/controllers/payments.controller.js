const prisma = require("../lib/prisma");

// ─── دفع للمورد ───
const paySupplier = async (req, res, next) => {
  try {
    const { supplierId, invoiceId, amount, notes } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. سجل الدفعة
      const payment = await tx.supplierPayment.create({
        data: { supplierId, invoiceId, amount, notes },
      });

      // 2. حدّث الفاتورة
      await tx.purchaseInvoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: { increment: amount },
          remaining: { decrement: amount },
        },
      });

      // 3. حدّث إجمالي الديون
      await tx.supplier.update({
        where: { id: supplierId },
        data: { totalDebt: { decrement: amount } },
      });

      return payment;
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// ─── استلام من العميل ───
const receiveFromCustomer = async (req, res, next) => {
  try {
    const { customerId, invoiceId, amount, notes } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. سجل الدفعة
      const payment = await tx.customerPayment.create({
        data: { customerId, invoiceId, amount, notes },
      });

      // 2. حدّث الفاتورة
      await tx.salesInvoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: { increment: amount },
          remaining: { decrement: amount },
        },
      });

      // 3. حدّث إجمالي ديون العميل
      await tx.customer.update({
        where: { id: customerId },
        data: { totalDebt: { decrement: amount } },
      });

      return payment;
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { paySupplier, receiveFromCustomer };

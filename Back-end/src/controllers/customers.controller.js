const prisma = require("../lib/prisma");

const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: customers });
  } catch (err) {
    next(err);
  }
};

const getCustomerById = async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        salesInvoices: { orderBy: { invoiceDate: "desc" } },
        payments: { orderBy: { paymentDate: "desc" } },
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "العميل غير موجود",
      });
    }

    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const customer = await prisma.customer.create({
      data: { name, phone, address },
    });
    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const customer = await prisma.customer.update({
      where: { id: parseInt(req.params.id) },
      data: { name, phone, address },
    });
    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const customerId = parseInt(req.params.id);

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        _count: {
          select: {
            salesInvoices: true,
            payments: true,
          },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "العميل غير موجود",
      });
    }

    if (
      customer._count.salesInvoices > 0 ||
      customer._count.payments > 0 ||
      Number(customer.totalDebt || 0) > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "لا يمكن حذف العميل لأنه مرتبط بفواتير أو مدفوعات. يمكنك تعديل بياناته بدل الحذف.",
      });
    }

    await prisma.customer.delete({ where: { id: customerId } });

    res.json({ success: true, data: { id: customerId } });
  } catch (err) {
    next(err);
  }
};

const getCustomerDebts = async (req, res, next) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { totalDebt: { gt: 0 } },
      orderBy: { totalDebt: "desc" },
    });
    res.json({ success: true, data: customers });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerDebts,
};

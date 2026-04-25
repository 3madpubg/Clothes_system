const prisma = require("../lib/prisma");

// ─── جلب كل الموردين ───
const getAllSuppliers = async (req, res, next) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: suppliers });
  } catch (err) {
    next(err);
  }
};

// ─── جلب مورد واحد مع فواتيره ───
const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        purchaseInvoices: {
          orderBy: { invoiceDate: "desc" },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "المورد غير موجود",
      });
    }

    res.json({ success: true, data: supplier });
  } catch (err) {
    next(err);
  }
};

const deleteSupplier = async (req, res, next) => {
  try {
    const supplierId = parseInt(req.params.id);

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        _count: {
          select: {
            purchaseInvoices: true,
            payments: true,
          },
        },
      },
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "المورد غير موجود",
      });
    }

    if (
      supplier._count.purchaseInvoices > 0 ||
      supplier._count.payments > 0 ||
      Number(supplier.totalDebt || 0) > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "لا يمكن حذف المورد لأنه مرتبط بفواتير أو مدفوعات. يمكنك تعديل بياناته بدل الحذف.",
      });
    }

    await prisma.supplier.delete({ where: { id: supplierId } });

    res.json({ success: true, data: { id: supplierId } });
  } catch (err) {
    next(err);
  }
};

// ─── إضافة مورد ───
const createSupplier = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    const supplier = await prisma.supplier.create({
      data: { name, phone, address },
    });

    res.status(201).json({ success: true, data: supplier });
  } catch (err) {
    next(err);
  }
};

// ─── تعديل مورد ───
const updateSupplier = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    const supplier = await prisma.supplier.update({
      where: { id: parseInt(req.params.id) },
      data: { name, phone, address },
    });

    res.json({ success: true, data: supplier });
  } catch (err) {
    next(err);
  }
};

// ─── ديون الموردين ───
const getSupplierDebts = async (req, res, next) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { totalDebt: { gt: 0 } },
      orderBy: { totalDebt: "desc" },
    });

    res.json({ success: true, data: suppliers });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierDebts,
};

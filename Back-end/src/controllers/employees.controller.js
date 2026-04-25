const prisma = require("../lib/prisma");

// ─── جلب كل الموظفين ───
const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      include: {
        // جلب السلف غير المخصومة
        advances: {
          where: { isDeducted: false },
          select: { amount: true, month: true, year: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // احسب إجمالي السلف لكل موظف
    const data = employees.map((emp) => ({
      ...emp,
      totalPendingAdvances: emp.advances.reduce(
        (sum, a) => sum + Number(a.amount),
        0,
      ),
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ─── إضافة موظف ───
const createEmployee = async (req, res, next) => {
  try {
    const { name, phone, nationalId, jobTitle, baseSalary, hireDate, notes } =
      req.body;

    const employee = await prisma.employee.create({
      data: {
        name,
        phone,
        nationalId,
        jobTitle,
        baseSalary: Number(baseSalary),
        hireDate: new Date(hireDate),
        notes,
      },
    });

    res.status(201).json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

// ─── تعديل موظف ───
const updateEmployee = async (req, res, next) => {
  try {
    const { name, phone, jobTitle, baseSalary, notes } = req.body;

    const employee = await prisma.employee.update({
      where: { id: Number(req.params.id) },
      data: { name, phone, jobTitle, baseSalary: Number(baseSalary), notes },
    });

    res.json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

// ─── إنهاء خدمة موظف ───
const deactivateEmployee = async (req, res, next) => {
  try {
    const employee = await prisma.employee.update({
      where: { id: Number(req.params.id) },
      data: { isActive: false },
    });
    res.json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
};

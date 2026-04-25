const prisma = require("../lib/prisma");

// ─── توليد مرتبات شهر معين ───
const generateMonthlySalaries = async (req, res, next) => {
  try {
    const { month, year } = req.body;

    // جلب كل الموظفين النشطين
    const employees = await prisma.employee.findMany({
      where: { isActive: true },
    });

    const results = [];

    for (const emp of employees) {
      // تحقق لو المرتب ده موجود خلاص
      const existing = await prisma.monthlySalary.findUnique({
        where: {
          employeeId_month_year: {
            employeeId: emp.id,
            month: Number(month),
            year: Number(year),
          },
        },
      });

      if (existing) {
        results.push({ employee: emp.name, status: "موجود بالفعل" });
        continue;
      }

      // جمع السلف اللي هتتخصم من المرتب ده
      const advances = await prisma.employeeAdvance.findMany({
        where: {
          employeeId: emp.id,
          month: Number(month),
          year: Number(year),
          isDeducted: false,
        },
      });

      const totalAdvances = advances.reduce(
        (sum, a) => sum + Number(a.amount),
        0,
      );

      const baseSalary = Number(emp.baseSalary);
      const netSalary = baseSalary - totalAdvances;

      // إنشاء المرتب
      const salary = await prisma.monthlySalary.create({
        data: {
          employeeId: emp.id,
          month: Number(month),
          year: Number(year),
          baseSalary,
          advances: totalAdvances,
          netSalary,
          status: "PENDING",
        },
      });

      // تعليم السلف كـ مخصومة
      await prisma.employeeAdvance.updateMany({
        where: {
          employeeId: emp.id,
          month: Number(month),
          year: Number(year),
          isDeducted: false,
        },
        data: { isDeducted: true },
      });

      results.push({
        employee: emp.name,
        baseSalary,
        advances: totalAdvances,
        netSalary,
        status: "تم الإنشاء",
      });
    }

    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};

// ─── جلب مرتبات شهر معين ───
const getMonthlySalaries = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const salaries = await prisma.monthlySalary.findMany({
      where: {
        month: Number(month),
        year: Number(year),
      },
      include: {
        employee: {
          select: { name: true, jobTitle: true },
        },
      },
      orderBy: { employee: { name: "asc" } },
    });

    const summary = {
      totalBaseSalaries: salaries.reduce((s, r) => s + Number(r.baseSalary), 0),
      totalAdvances: salaries.reduce((s, r) => s + Number(r.advances), 0),
      totalBonus: salaries.reduce((s, r) => s + Number(r.bonus), 0),
      totalPenalties: salaries.reduce((s, r) => s + Number(r.penalties), 0),
      totalNet: salaries.reduce((s, r) => s + Number(r.netSalary), 0),
      pendingCount: salaries.filter((r) => r.status === "PENDING").length,
      paidCount: salaries.filter((r) => r.status === "PAID").length,
    };

    res.json({ success: true, data: { summary, salaries } });
  } catch (err) {
    next(err);
  }
};

// ─── تعديل مرتب (إضافة بونص أو جزاء) ───
const updateSalary = async (req, res, next) => {
  try {
    const { bonus, overtimePay, absenceDays, penalties, notes } = req.body;
    const salary = await prisma.monthlySalary.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!salary) {
      return res
        .status(404)
        .json({ success: false, message: "المرتب مش موجود" });
    }

    // احسب خصم الغياب (يوم غياب = مرتب يومي)
    const dailyRate = Number(salary.baseSalary) / 30;
    const absenceDeduct = (absenceDays || 0) * dailyRate;

    // احسب الصافي الجديد
    const netSalary =
      Number(salary.baseSalary) +
      Number(bonus || 0) +
      Number(overtimePay || 0) -
      Number(salary.advances) -
      absenceDeduct -
      Number(penalties || 0);

    const updated = await prisma.monthlySalary.update({
      where: { id: Number(req.params.id) },
      data: {
        bonus: Number(bonus || 0),
        overtimePay: Number(overtimePay || 0),
        absenceDays: Number(absenceDays || 0),
        absenceDeduct,
        penalties: Number(penalties || 0),
        netSalary,
        notes,
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// ─── تسجيل صرف المرتب ───
const paySalary = async (req, res, next) => {
  try {
    const salary = await prisma.monthlySalary.update({
      where: { id: Number(req.params.id) },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
      include: {
        employee: { select: { name: true } },
      },
    });

    res.json({ success: true, data: salary });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateMonthlySalaries,
  getMonthlySalaries,
  updateSalary,
  paySalary,
};

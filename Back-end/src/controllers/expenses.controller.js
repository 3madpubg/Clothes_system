const prisma = require("../lib/prisma");

// ─── جلب المصاريف ───
const getExpenses = async (req, res, next) => {
  try {
    const { from, to, categoryId } = req.query;

    const expenses = await prisma.dailyExpense.findMany({
      where: {
        ...(categoryId && { categoryId: Number(categoryId) }),
        ...(from &&
          to && {
            date: { gte: new Date(from), lte: new Date(to) },
          }),
      },
      include: {
        category: true,
        advance: {
          include: {
            employee: { select: { name: true } },
          },
        },
      },
      orderBy: { date: "desc" },
    });

    const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

    res.json({ success: true, data: { total, expenses } });
  } catch (err) {
    next(err);
  }
};

// ─── إضافة مصروف ───
const createExpense = async (req, res, next) => {
  try {
    const {
      categoryId,
      amount,
      date,
      notes,
      employeeId,
      advanceMonth,
      advanceYear,
    } = req.body;

    // جلب الـ category عشان نعرف هل دي سلفة موظف
    const category = await prisma.expenseCategory.findUnique({
      where: { id: Number(categoryId) },
    });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "النوع مش موجود" });
    }

    const result = await prisma.$transaction(async (tx) => {
      // إنشاء المصروف
      const expense = await tx.dailyExpense.create({
        data: {
          categoryId: Number(categoryId),
          amount: Number(amount),
          date: date ? new Date(date) : new Date(),
          notes,
        },
      });

      // لو سلفة موظف، اعمل EmployeeAdvance
      if (category.isAdvance && employeeId) {
        const now = new Date();
        await tx.employeeAdvance.create({
          data: {
            employeeId: Number(employeeId),
            amount: Number(amount),
            month: advanceMonth || now.getMonth() + 1,
            year: advanceYear || now.getFullYear(),
            isDeducted: false,
            notes,
            expenseId: expense.id,
          },
        });
      }

      return expense;
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const updateExpense = async (req, res, next) => {
  try {
    const expenseId = Number(req.params.id);
    const {
      categoryId,
      amount,
      date,
      notes,
      employeeId,
      advanceMonth,
      advanceYear,
    } = req.body;

    const [expense, category] = await Promise.all([
      prisma.dailyExpense.findUnique({
        where: { id: expenseId },
        include: { advance: true },
      }),
      prisma.expenseCategory.findUnique({
        where: { id: Number(categoryId) },
      }),
    ]);

    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: "المصروف غير موجود" });
    }

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "النوع مش موجود" });
    }

    if (category.isAdvance && !employeeId) {
      return res.status(400).json({
        success: false,
        message: "اختر الموظف لهذا النوع من المصروف",
      });
    }

    if (expense.advance?.isDeducted) {
      const willRemoveAdvance = !category.isAdvance;
      const willChangeEmployee =
        category.isAdvance && Number(employeeId) !== expense.advance.employeeId;

      if (willRemoveAdvance || willChangeEmployee) {
        return res.status(409).json({
          success: false,
          message:
            "لا يمكن تعديل السلفة لأنها تم خصمها بالفعل من مرتب موظف. يمكنك تعديل الملاحظات أو إنشاء مصروف جديد.",
        });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.dailyExpense.update({
        where: { id: expenseId },
        data: {
          categoryId: Number(categoryId),
          amount: Number(amount),
          date: date ? new Date(date) : expense.date,
          notes,
        },
      });

      if (category.isAdvance) {
        const advanceData = {
          employeeId: Number(employeeId),
          amount: Number(amount),
          month: Number(advanceMonth || new Date().getMonth() + 1),
          year: Number(advanceYear || new Date().getFullYear()),
          notes,
          expenseId,
        };

        if (expense.advance) {
          await tx.employeeAdvance.update({
            where: { id: expense.advance.id },
            data: advanceData,
          });
        } else {
          await tx.employeeAdvance.create({
            data: { ...advanceData, isDeducted: false },
          });
        }
      } else if (expense.advance) {
        await tx.employeeAdvance.delete({ where: { id: expense.advance.id } });
      }

      return updated;
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    const expenseId = Number(req.params.id);

    const expense = await prisma.dailyExpense.findUnique({
      where: { id: expenseId },
      include: { advance: true },
    });

    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: "المصروف غير موجود" });
    }

    if (expense.advance?.isDeducted) {
      return res.status(409).json({
        success: false,
        message:
          "لا يمكن حذف المصروف لأنه مرتبط بسلفة تم خصمها من مرتب موظف.",
      });
    }

    await prisma.$transaction(async (tx) => {
      if (expense.advance) {
        await tx.employeeAdvance.delete({ where: { id: expense.advance.id } });
      }

      await tx.dailyExpense.delete({ where: { id: expenseId } });
    });

    res.json({ success: true, data: { id: expenseId } });
  } catch (err) {
    next(err);
  }
};

// ─── تقرير المصاريف اليومية ───
const getDailyReport = async (req, res, next) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const expenses = await prisma.dailyExpense.findMany({
      where: { date: { gte: startOfDay, lte: endOfDay } },
      include: {
        category: true,
        advance: {
          include: { employee: { select: { name: true } } },
        },
      },
    });

    // تجميع حسب النوع
    const byCategory = {};
    expenses.forEach((e) => {
      const cat = e.category.name;
      if (!byCategory[cat]) byCategory[cat] = 0;
      byCategory[cat] += Number(e.amount);
    });

    res.json({
      success: true,
      data: {
        total: expenses.reduce((s, e) => s + Number(e.amount), 0),
        byCategory,
        expenses,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── أنواع المصاريف ───
const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.expenseCategory.findMany();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, isAdvance } = req.body;
    const category = await prisma.expenseCategory.create({
      data: { name, isAdvance: Boolean(isAdvance) },
    });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const categoryId = Number(req.params.id);
    const { name, isAdvance } = req.body;

    const category = await prisma.expenseCategory.findUnique({
      where: { id: categoryId },
      include: { _count: { select: { expenses: true } } },
    });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "النوع غير موجود" });
    }

    const nextIsAdvance =
      isAdvance === undefined ? category.isAdvance : Boolean(isAdvance);

    if (category._count.expenses > 0 && nextIsAdvance !== category.isAdvance) {
      return res.status(409).json({
        success: false,
        message:
          "لا يمكن تغيير نوع السلفة بعد استخدام هذا النوع في مصروفات. يمكنك تعديل الاسم فقط.",
      });
    }

    const updated = await prisma.expenseCategory.update({
      where: { id: categoryId },
      data: { name, isAdvance: nextIsAdvance },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = Number(req.params.id);

    const category = await prisma.expenseCategory.findUnique({
      where: { id: categoryId },
      include: { _count: { select: { expenses: true } } },
    });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "النوع غير موجود" });
    }

    if (category._count.expenses > 0) {
      return res.status(409).json({
        success: false,
        message:
          "لا يمكن حذف نوع المصروف لأنه مستخدم في مصروفات مسجلة. يمكنك تعديل اسمه بدل الحذف.",
      });
    }

    await prisma.expenseCategory.delete({ where: { id: categoryId } });

    res.json({ success: true, data: { id: categoryId } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getDailyReport,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

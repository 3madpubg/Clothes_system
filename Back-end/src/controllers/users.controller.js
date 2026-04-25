// src/controllers/users.controller.js
const bcrypt = require("bcrypt");
const prisma = require("../lib/prisma");

// ─── جلب كل المستخدمين ───
const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        // ❌ مش بنرجع الباسورد أبداً
      },
    });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// ─── إضافة مستخدم جديد ───
const createUser = async (req, res, next) => {
  try {
    const { name, username, password, role } = req.body;

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "كلمة المرور لازم تكون 8 حروف على الأقل",
      });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, username, password: hashed, role },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        isActive: true,
      },
    });

    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// ─── تفعيل / إيقاف مستخدم ───
const toggleUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // منع المدير من إيقاف نفسه
    if (Number(id) === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: "مش تقدر توقف حسابك أنت",
      });
    }

    const user = await prisma.user.findUnique({ where: { id: Number(id) } });

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, isActive: true },
    });

    // لو وقّفنا المستخدم، امسح كل tokens بتاعته
    if (!updated.isActive) {
      await prisma.refreshToken.deleteMany({ where: { userId: Number(id) } });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// ─── تعديل صلاحية مستخدم ───
const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // منع المدير من تعديل صلاحيته هو
    if (Number(id) === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: "مش تقدر تعدّل صلاحيتك أنت",
      });
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
      select: { id: true, name: true, role: true },
    });

    // لو اتغيرت الصلاحية، امسح الـ tokens عشان يسجّل دخول بالصلاحية الجديدة
    await prisma.refreshToken.deleteMany({ where: { userId: Number(id) } });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// ─── Reset Password ───
const resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "كلمة المرور لازم تكون 8 حروف على الأقل",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: Number(id) },
      data: { password: hashed },
    });

    await prisma.refreshToken.deleteMany({ where: { userId: Number(id) } });

    res.json({ success: true, message: "تم إعادة تعيين كلمة المرور" });
  } catch (err) {
    next(err);
  }
};

// ─── Audit Logs ───
const getAuditLogs = async (req, res, next) => {
  try {
    const { userId, action, from, to } = req.query;

    const logs = await prisma.auditLog.findMany({
      where: {
        ...(userId && { userId: Number(userId) }),
        ...(action && { action }),
        ...(from &&
          to && {
            createdAt: { gte: new Date(from), lte: new Date(to) },
          }),
      },
      include: {
        user: { select: { name: true, username: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100, // آخر 100 سجل
    });

    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  createUser,
  toggleUser,
  updateRole,
  resetPassword,
  getAuditLogs,
};

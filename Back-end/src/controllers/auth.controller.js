// src/controllers/auth.controller.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../lib/prisma");

const SALT_ROUNDS = 12;
const ACCESS_EXPIRES = "15m"; // Access token ينتهي بعد 15 دقيقة
const REFRESH_EXPIRES = "7d"; // Refresh token ينتهي بعد 7 أيام

// ─── Login ───
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 1. دور على المستخدم
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "اسم المستخدم أو كلمة المرور غلط",
        // ❌ متقولش "المستخدم مش موجود" عشان ده معلومة للهاكر
      });
    }

    // 2. تحقق إن الحساب مفعّل
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "الحساب موقوف، تواصل مع المدير",
      });
    }

    // 3. تحقق من الباسورد
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      // سجّل المحاولة الفاشلة
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "LOGIN_FAILED",
          entity: "User",
          entityId: user.id,
          ipAddress: req.ip,
        },
      });

      return res.status(401).json({
        success: false,
        message: "اسم المستخدم أو كلمة المرور غلط",
      });
    }

    // 4. ولّد Access Token
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_EXPIRES },
    );

    // 5. ولّد Refresh Token
    const refreshToken = crypto.randomBytes(64).toString("hex");

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 أيام
      },
    });

    // 6. حدّث آخر دخول
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // 7. سجّل الدخول الناجح
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN_SUCCESS",
        entity: "User",
        entityId: user.id,
        ipAddress: req.ip,
      },
    });

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Refresh Access Token ───
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "مفيش Refresh Token" });
    }

    // دور على الـ Token
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored) {
      return res
        .status(401)
        .json({ success: false, message: "Token غير صالح" });
    }

    // تحقق من التاريخ
    if (stored.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
      return res
        .status(401)
        .json({ success: false, message: "Token منتهي، سجّل دخول تاني" });
    }

    // تحقق إن الحساب لسه مفعّل
    if (!stored.user.isActive) {
      return res.status(403).json({ success: false, message: "الحساب موقوف" });
    }

    // ولّد Access Token جديد
    const accessToken = jwt.sign(
      { userId: stored.user.id, role: stored.user.role },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_EXPIRES },
    );

    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
};

// ─── Logout ───
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: "LOGOUT",
        entity: "User",
        entityId: req.user.userId,
        ipAddress: req.ip,
      },
    });

    res.json({ success: true, message: "تم تسجيل الخروج" });
  } catch (err) {
    next(err);
  }
};

// ─── تغيير الباسورد ───
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "كلمة المرور الحالية غلط",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "كلمة المرور لازم تكون 8 حروف على الأقل",
      });
    }

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    // امسح كل الـ Refresh Tokens عشان يسجّل دخول تاني
    await prisma.refreshToken.deleteMany({ where: { userId } });

    await prisma.auditLog.create({
      data: {
        userId,
        action: "CHANGE_PASSWORD",
        entity: "User",
        entityId: userId,
        ipAddress: req.ip,
      },
    });

    res.json({ success: true, message: "تم تغيير كلمة المرور" });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, refresh, logout, changePassword };

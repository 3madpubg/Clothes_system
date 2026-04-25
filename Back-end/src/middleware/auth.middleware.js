// src/middleware/auth.middleware.js
const jwt = require("jsonwebtoken");
const { hasPermission } = require("../config/permissions");

// ─── التحقق من الـ Token ───
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "مش مسجّل دخول",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "انتهت الجلسة، سجّل دخول تاني",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Token غير صالح",
    });
  }
};

// ─── التحقق من الصلاحية ───
const authorize = (permission) => {
  return (req, res, next) => {
    const { role } = req.user;

    if (!hasPermission(role, permission)) {
      return res.status(403).json({
        success: false,
        message: "مش عندك صلاحية للقيام بهذه العملية",
      });
    }

    next();
  };
};

// ─── Admin فقط ───
const adminOnly = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "المدير بس يقدر يعمل الأكشن ده",
    });
  }
  next();
};

module.exports = { authenticate, authorize, adminOnly };

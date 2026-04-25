// src/middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");

// عشان يمنع Brute Force على الـ Login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 محاولات بس
  message: {
    success: false,
    message: "محاولات كتير، استنى 15 دقيقة",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // دقيقة
  max: 100, // 100 طلب في الدقيقة
  message: {
    success: false,
    message: "طلبات كتير جداً",
  },
});

module.exports = { loginLimiter, apiLimiter };

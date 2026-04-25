// src/middleware/audit.middleware.js
const prisma = require("../lib/prisma");

// بتحط ده على أي Route عايز تسجّله
const audit = (action, entity) => {
  return async (req, res, next) => {
    // خلّي الـ Response يكمل الأول
    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      // لو العملية نجحت فقط
      if (body.success) {
        try {
          await prisma.auditLog.create({
            data: {
              userId: req.user.userId,
              action,
              entity,
              entityId: body.data?.id
                ? Number(body.data.id)
                : req.params.id
                  ? Number(req.params.id)
                  : null,
              newData: ["POST", "PUT"].includes(req.method) ? req.body : null,
              ipAddress: req.ip,
            },
          });
        } catch (e) {
          console.error("Audit log error:", e);
        }
      }
      return originalJson(body);
    };

    next();
  };
};

module.exports = { audit };

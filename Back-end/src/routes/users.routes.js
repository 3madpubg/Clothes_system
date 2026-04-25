const router = require("express").Router();
const c = require("../controllers/users.controller");
const { authenticate, adminOnly } = require("../middleware/auth.middleware");
const { audit } = require("../middleware/audit.middleware");

// كل الـ Users Routes تحتاج Admin فقط
router.use(authenticate, adminOnly);

router.get("/", c.getAllUsers);
router.post("/", audit("CREATE_USER", "User"), c.createUser);
router.patch("/:id/toggle", c.toggleUser);
router.patch("/:id/role", c.updateRole);
router.put("/:id/reset-password", c.resetPassword);
router.get("/audit-logs", c.getAuditLogs);

module.exports = router;

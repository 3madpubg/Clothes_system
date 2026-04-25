// src/routes/auth.routes.js
const router = require("express").Router();
const c = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.post("/login", c.login);
router.post("/refresh", c.refresh);
router.post("/logout", authenticate, c.logout);
router.put("/change-password", authenticate, c.changePassword);

module.exports = router;

const router = require("express").Router();
const c = require("../controllers/salaries.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

router.use(authenticate, authorize("salaries:manage"));
router.get("/", c.getMonthlySalaries);
router.post("/generate", c.generateMonthlySalaries);
router.put("/:id", c.updateSalary);
router.patch("/:id/pay", c.paySalary);

module.exports = router;

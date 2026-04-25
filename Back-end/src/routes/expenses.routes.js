const router = require("express").Router();
const c = require("../controllers/expenses.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

router.use(authenticate);
router.get("/categories", c.getCategories);
router.post("/categories", authorize("expenses:manage"), c.createCategory);
router.put("/categories/:id", authorize("expenses:manage"), c.updateCategory);
router.delete("/categories/:id", authorize("expenses:manage"), c.deleteCategory);
router.get("/", authorize("expenses:read"), c.getExpenses);
router.post("/", authorize("expenses:create"), c.createExpense);
router.get("/daily", authorize("expenses:read"), c.getDailyReport);
router.put("/:id", authorize("expenses:manage"), c.updateExpense);
router.delete("/:id", authorize("expenses:manage"), c.deleteExpense);

module.exports = router;

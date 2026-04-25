const router = require("express").Router();
const c = require("../controllers/employees.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

router.use(authenticate);
router.get("/", authorize("employees:read"), c.getAllEmployees);
router.post("/", authorize("employees:create"), c.createEmployee);
router.put("/:id", authorize("employees:update"), c.updateEmployee);
router.patch(
  "/:id/deactivate",
  authorize("employees:delete"),
  c.deactivateEmployee,
);

module.exports = router;

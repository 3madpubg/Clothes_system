const router = require("express").Router();
const c = require("../controllers/customers.controller");

router.get("/", c.getAllCustomers);
router.get("/debts", c.getCustomerDebts);
router.get("/:id", c.getCustomerById);
router.post("/", c.createCustomer);
router.put("/:id", c.updateCustomer);
router.delete("/:id", c.deleteCustomer);

module.exports = router;

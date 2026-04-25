const router = require("express").Router();
const c = require("../controllers/payments.controller");

router.post("/supplier", c.paySupplier);
router.post("/customer", c.receiveFromCustomer);

module.exports = router;

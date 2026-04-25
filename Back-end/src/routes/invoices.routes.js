const router = require("express").Router();
const c = require("../controllers/invoices.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.use(authenticate);
router.get("/sale/:id/print", c.getSaleInvoicePrint);
router.get("/purchase/:id/print", c.getPurchaseInvoicePrint);

module.exports = router;

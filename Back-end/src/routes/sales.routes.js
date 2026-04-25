const router = require("express").Router();
const c = require("../controllers/sales.controller");

router.get("/", c.getAllSales);
router.get("/:id", c.getSaleById);
router.post("/", c.createSale);

module.exports = router;

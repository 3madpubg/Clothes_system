const router = require("express").Router();
const c = require("../controllers/purchases.controller");

router.get("/", c.getAllPurchases);
router.get("/:id", c.getPurchaseById);
router.post("/", c.createPurchase);

module.exports = router;

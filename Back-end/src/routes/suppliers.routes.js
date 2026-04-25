const router = require("express").Router();
const c = require("../controllers/suppliers.controller");

router.get("/", c.getAllSuppliers);
router.get("/debts", c.getSupplierDebts);
router.get("/:id", c.getSupplierById);
router.post("/", c.createSupplier);
router.put("/:id", c.updateSupplier);
router.delete("/:id", c.deleteSupplier);

module.exports = router;

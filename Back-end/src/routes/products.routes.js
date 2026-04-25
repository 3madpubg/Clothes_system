const router = require("express").Router();
const c = require("../controllers/products.controller");

router.get("/", c.getAllProducts);
router.get("/low-stock", c.getLowStock);
router.get("/:id", c.getProductById);
router.post("/", c.createProduct);
router.put("/:id", c.updateProduct);
router.delete("/:id", c.deleteProduct);
router.post("/:id/variants", c.addVariant);
router.put("/:id/variants/:variantId", c.updateVariant);
router.delete("/:id/variants/:variantId", c.deleteVariant);

module.exports = router;

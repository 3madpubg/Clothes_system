// src/routes/reports.routes.js
const router = require("express").Router();
const c = require("../controllers/reports.controller");

// الداشبورد
router.get("/dashboard", c.getDashboard);

// المخزون
router.get("/stock", c.getStockReport);
router.get("/stock/low", c.getLowStockReport);

// الديون
router.get("/debts", c.getDebtsReport);
router.get("/debts/suppliers", c.getSupplierDebtsReport);
router.get("/debts/customers", c.getCustomerDebtsReport);

// الأرباح
router.get("/profit", c.getProfitReport);

module.exports = router;

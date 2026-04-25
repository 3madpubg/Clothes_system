const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

const productRoutes = require("./routes/products.routes");
const supplierRoutes = require("./routes/suppliers.routes");
const purchaseRoutes = require("./routes/purchases.routes");
const customerRoutes = require("./routes/customers.routes");
const salesRoutes = require("./routes/sales.routes");
const paymentRoutes = require("./routes/payments.routes");
const reportRoutes = require("./routes/reports.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/users.routes");
const employeeRoutes = require("./routes/employees.routes");
const expenseRoutes = require("./routes/expenses.routes");
const salaryRoutes = require("./routes/salaries.routes");
const invoiceRoutes = require("./routes/invoices.routes");

const app = express();
const frontendDistPath = path.resolve(__dirname, "../../Front-end/build");
const frontendIndexPath = path.join(frontendDistPath, "index.html");
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: "*", // مؤقتاً عشان نتأكد
  }),
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/salaries", salaryRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

if (fs.existsSync(frontendIndexPath)) {
  app.use(express.static(frontendDistPath));
  app.get(/^\/(?!api(?:\/|$)).*/, (req, res) => {
    res.sendFile(frontendIndexPath);
  });
}

// Error Handler
app.use(errorHandler);

module.exports = app;

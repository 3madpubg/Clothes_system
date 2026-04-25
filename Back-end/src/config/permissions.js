// src/config/permissions.js

const PERMISSIONS = {
  "employees:read": true,
  "employees:create": true,
  "employees:update": true,
  "employees:delete": true,
  "salaries:manage": true,
  "expenses:read": true,
  "expenses:create": true,
  "expenses:manage": true,
  // ── Products ──
  "products:read": true,
  "products:create": true,
  "products:update": true,
  "products:delete": true,

  // ── Suppliers ──
  "suppliers:read": true,
  "suppliers:create": true,
  "suppliers:update": true,
  "suppliers:delete": true,

  // ── Purchases ──
  "purchases:read": true,
  "purchases:create": true,

  // ── Customers ──
  "customers:read": true,
  "customers:create": true,
  "customers:update": true,
  "customers:delete": true,

  // ── Sales ──
  "sales:read": true,
  "sales:create": true,

  // ── Payments ──
  "payments:read": true,
  "payments:create": true,

  // ── Reports ──
  "reports:stock": true,
  "reports:profit": true,
  "reports:debts": true,

  // ── Users ──
  "users:read": true,
  "users:create": true,
  "users:update": true,
  "users:delete": true,
};

const ROLE_PERMISSIONS = {
  ADMIN: Object.keys(PERMISSIONS), // كل الصلاحيات

  MANAGER: [
    "employees:read",
    "employees:create",
    "employees:update",
    "salaries:manage",
    "expenses:read",
    "expenses:create",
    "expenses:manage",
    "products:read",
    "products:create",
    "products:update",
    "suppliers:read",
    "suppliers:create",
    "suppliers:update",
    "purchases:read",
    "purchases:create",
    "customers:read",
    "customers:create",
    "customers:update",
    "sales:read",
    "sales:create",
    "payments:read",
    "payments:create",
    "reports:stock",
    "reports:profit",
    "reports:debts",
    // ❌ بدون delete و users
  ],

  CASHIER: [
    "expenses:create",
    "customers:read",
    "customers:create",
    "sales:read",
    "sales:create",
    "payments:read",
    "payments:create",
    "products:read",
    // ❌ بدون شراء أو تقارير مالية
  ],

  STOCKIST: [
    "products:read",
    "products:create",
    "products:update",
    "suppliers:read",
    "purchases:read",
    "purchases:create",
    "reports:stock",
    // ❌ بدون بيع أو تقارير مالية
  ],
};

const hasPermission = (role, permission) => {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

module.exports = { ROLE_PERMISSIONS, hasPermission };

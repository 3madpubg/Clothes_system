import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Products = React.lazy(() => import('./views/shop/Products'))
const Suppliers = React.lazy(() => import('./views/shop/Suppliers'))
const Customers = React.lazy(() => import('./views/shop/Customers'))
const Purchases = React.lazy(() => import('./views/shop/Purchases'))
const Sales = React.lazy(() => import('./views/shop/Sales'))
const InvoiceDetails = React.lazy(() => import('./views/shop/InvoiceDetails'))
const Payments = React.lazy(() => import('./views/shop/Payments'))
const Employees = React.lazy(() => import('./views/shop/Employees'))
const Expenses = React.lazy(() => import('./views/shop/Expenses'))
const Salaries = React.lazy(() => import('./views/shop/Salaries'))
const Users = React.lazy(() => import('./views/shop/Users'))
const Reports = React.lazy(() => import('./views/shop/Reports'))

export const routes = [
  { path: '/', exact: true, name: 'الرئيسية' },
  { path: '/dashboard', name: 'لوحة التحكم', element: Dashboard },
  { path: '/products', name: 'المنتجات', element: Products },
  { path: '/suppliers', name: 'الموردون', element: Suppliers },
  { path: '/customers', name: 'العملاء', element: Customers },
  { path: '/purchases', name: 'المشتريات', element: Purchases },
  { path: '/purchases/:id', name: 'تفاصيل فاتورة الشراء', element: InvoiceDetails },
  { path: '/sales', name: 'المبيعات', element: Sales },
  { path: '/sales/:id', name: 'تفاصيل فاتورة البيع', element: InvoiceDetails },
  { path: '/payments', name: 'المدفوعات', element: Payments },
  { path: '/employees', name: 'الموظفون', element: Employees },
  { path: '/expenses', name: 'المصروفات', element: Expenses },
  { path: '/salaries', name: 'المرتبات', element: Salaries },
  { path: '/users', name: 'المستخدمون', element: Users },
  { path: '/reports', name: 'التقارير', element: Reports },
]

export default routes

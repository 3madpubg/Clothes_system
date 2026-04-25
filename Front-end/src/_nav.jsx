import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilCash,
  cilChartPie,
  cilDescription,
  cilGroup,
  cilMoney,
  cilNotes,
  cilPeople,
  cilPuzzle,
  cilShieldAlt,
  cilSpeedometer,
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'لوحة التحكم',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'نظام المحل',
  },
  {
    component: CNavItem,
    name: 'المنتجات',
    to: '/products',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'الموردون',
    to: '/suppliers',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'العملاء',
    to: '/customers',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'المشتريات',
    to: '/purchases',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'المبيعات',
    to: '/sales',
    icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'المدفوعات',
    to: '/payments',
    icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'الإدارة',
  },
  {
    component: CNavItem,
    name: 'الموظفون',
    to: '/employees',
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'المصروفات',
    to: '/expenses',
    icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'المرتبات',
    to: '/salaries',
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'المستخدمون',
    to: '/users',
    icon: <CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'التقارير',
    to: '/reports',
    icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
  },
]

export default _nav

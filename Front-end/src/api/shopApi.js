const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const AUTH_STORAGE_KEY = 'shop-system-auth'

const buildQuery = (params = {}) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export const getAuthState = () => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY) || 'null')
  } catch {
    return null
  }
}

export const setAuthState = (auth) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
  window.dispatchEvent(new Event('shop-auth-change'))
}

export const clearAuthState = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY)
  window.dispatchEvent(new Event('shop-auth-change'))
}

const refreshAccessToken = async () => {
  const auth = getAuthState()

  if (!auth?.refreshToken) {
    clearAuthState()
    return null
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: auth.refreshToken }),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.success === false || !payload?.data?.accessToken) {
    clearAuthState()
    return null
  }

  const nextAuth = {
    ...auth,
    accessToken: payload.data.accessToken,
  }

  setAuthState(nextAuth)
  return nextAuth.accessToken
}

const request = async (path, options = {}, canRefresh = true) => {
  const auth = getAuthState()
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(auth?.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const payload = await response.json().catch(() => null)

  if (
    response.status === 401 &&
    payload?.code === 'TOKEN_EXPIRED' &&
    canRefresh &&
    auth?.refreshToken
  ) {
    const nextToken = await refreshAccessToken()

    if (nextToken) {
      return request(path, options, false)
    }
  }

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`)
  }

  return payload?.data ?? payload
}

const post = (path, body) =>
  request(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })

const put = (path, body) =>
  request(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  })

const patch = (path, body = {}) =>
  request(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })

const del = (path) =>
  request(path, {
    method: 'DELETE',
  })

export const shopApi = {
  getAuth: getAuthState,
  setAuth: setAuthState,
  clearAuth: clearAuthState,
  login: async (body) => {
    const auth = await post('/auth/login', body)
    setAuthState(auth)
    return auth
  },
  logout: async () => {
    const auth = getAuthState()

    try {
      if (auth?.refreshToken) {
        await post('/auth/logout', { refreshToken: auth.refreshToken })
      }
    } finally {
      clearAuthState()
    }
  },
  changePassword: (body) => put('/auth/change-password', body),

  users: () => request('/users'),
  createUser: (body) => post('/users', body),
  toggleUser: (id) => patch(`/users/${id}/toggle`),
  updateUserRole: (id, body) => patch(`/users/${id}/role`, body),
  resetUserPassword: (id, body) => put(`/users/${id}/reset-password`, body),
  auditLogs: (params) => request(`/users/audit-logs${buildQuery(params)}`),

  dashboard: () => request('/reports/dashboard'),
  stockReport: (params) => request(`/reports/stock${buildQuery(params)}`),
  lowStockReport: () => request('/reports/stock/low'),
  debtsReport: () => request('/reports/debts'),
  supplierDebtsReport: () => request('/reports/debts/suppliers'),
  customerDebtsReport: () => request('/reports/debts/customers'),
  profitReport: (params) => request(`/reports/profit${buildQuery(params)}`),

  products: (params) => request(`/products${buildQuery(params)}`),
  product: (id) => request(`/products/${id}`),
  createProduct: (body) => post('/products', body),
  updateProduct: (id, body) => put(`/products/${id}`, body),
  deleteProduct: (id) => del(`/products/${id}`),
  addVariant: (id, body) => post(`/products/${id}/variants`, body),
  updateVariant: (productId, variantId, body) =>
    put(`/products/${productId}/variants/${variantId}`, body),
  deleteVariant: (productId, variantId) => del(`/products/${productId}/variants/${variantId}`),

  suppliers: () => request('/suppliers'),
  supplier: (id) => request(`/suppliers/${id}`),
  createSupplier: (body) => post('/suppliers', body),
  updateSupplier: (id, body) => put(`/suppliers/${id}`, body),
  deleteSupplier: (id) => del(`/suppliers/${id}`),

  customers: () => request('/customers'),
  customer: (id) => request(`/customers/${id}`),
  createCustomer: (body) => post('/customers', body),
  updateCustomer: (id, body) => put(`/customers/${id}`, body),
  deleteCustomer: (id) => del(`/customers/${id}`),

  purchases: (params) => request(`/purchases${buildQuery(params)}`),
  purchase: (id) => request(`/purchases/${id}`),
  createPurchase: (body) => post('/purchases', body),

  sales: (params) => request(`/sales${buildQuery(params)}`),
  sale: (id) => request(`/sales/${id}`),
  createSale: (body) => post('/sales', body),

  paySupplier: (body) => post('/payments/supplier', body),
  receiveFromCustomer: (body) => post('/payments/customer', body),

  employees: () => request('/employees'),
  createEmployee: (body) => post('/employees', body),
  updateEmployee: (id, body) => put(`/employees/${id}`, body),
  deactivateEmployee: (id) => patch(`/employees/${id}/deactivate`),

  expenseCategories: () => request('/expenses/categories'),
  createExpenseCategory: (body) => post('/expenses/categories', body),
  updateExpenseCategory: (id, body) => put(`/expenses/categories/${id}`, body),
  deleteExpenseCategory: (id) => del(`/expenses/categories/${id}`),
  expenses: (params) => request(`/expenses${buildQuery(params)}`),
  createExpense: (body) => post('/expenses', body),
  updateExpense: (id, body) => put(`/expenses/${id}`, body),
  deleteExpense: (id) => del(`/expenses/${id}`),
  dailyExpenses: (params) => request(`/expenses/daily${buildQuery(params)}`),

  salaries: (params) => request(`/salaries${buildQuery(params)}`),
  generateSalaries: (body) => post('/salaries/generate', body),
  updateSalary: (id, body) => put(`/salaries/${id}`, body),
  paySalary: (id) => patch(`/salaries/${id}/pay`),

  saleInvoicePrint: (id) => request(`/invoices/sale/${id}/print`),
  purchaseInvoicePrint: (id) => request(`/invoices/purchase/${id}/print`),
}

export default shopApi

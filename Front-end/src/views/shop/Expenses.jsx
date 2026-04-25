import React, { useEffect, useMemo, useState } from 'react'
import {
  CBadge,
  CButton,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'

import { shopApi } from 'src/api/shopApi'
import {
  ApiAlert,
  EmptyState,
  LoadingCard,
  PageHeader,
  SectionCard,
  SubmitButton,
} from 'src/views/shop/components'
import { formatDate, formatMoney, formatNumber, getErrorMessage, toNumber } from './utils'

const today = () => new Date().toISOString().slice(0, 10)
const monthStart = () => {
  const date = new Date()
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10)
}

const emptyExpense = {
  categoryId: '',
  amount: '',
  date: today(),
  notes: '',
  employeeId: '',
  advanceMonth: new Date().getMonth() + 1,
  advanceYear: new Date().getFullYear(),
}

const emptyCategory = {
  name: '',
  isAdvance: false,
}

const Expenses = () => {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [employees, setEmployees] = useState([])
  const [total, setTotal] = useState(0)
  const [dailyReport, setDailyReport] = useState(null)
  const [filters, setFilters] = useState({ from: monthStart(), to: today(), categoryId: '' })
  const [expenseForm, setExpenseForm] = useState(emptyExpense)
  const [expenseEditForm, setExpenseEditForm] = useState(emptyExpense)
  const [categoryForm, setCategoryForm] = useState(emptyCategory)
  const [categoryEditForm, setCategoryEditForm] = useState(emptyCategory)
  const [editingExpense, setEditingExpense] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadExpenses = async (params = filters) => {
    setLoading(true)
    setError('')

    try {
      const [expenseData, categoryData, employeeData, dailyData] = await Promise.all([
        shopApi.expenses(params),
        shopApi.expenseCategories(),
        shopApi.employees(),
        shopApi.dailyExpenses({ date: today() }),
      ])

      setExpenses(expenseData.expenses || [])
      setTotal(expenseData.total || 0)
      setCategories(categoryData)
      setEmployees(employeeData)
      setDailyReport(dailyData)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadExpenses, 0)
    return () => window.clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedCategory = categories.find(
    (category) => String(category.id) === String(expenseForm.categoryId),
  )
  const selectedEditCategory = categories.find(
    (category) => String(category.id) === String(expenseEditForm.categoryId),
  )

  const summary = useMemo(
    () => ({
      count: expenses.length,
      total,
      today: dailyReport?.total || 0,
      categories: categories.length,
    }),
    [categories.length, dailyReport?.total, expenses.length, total],
  )

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const handleExpenseChange = (event) => {
    const { name, value } = event.target
    setExpenseForm((current) => ({ ...current, [name]: value }))
  }

  const handleExpenseEditChange = (event) => {
    const { name, value } = event.target
    setExpenseEditForm((current) => ({ ...current, [name]: value }))
  }

  const handleCategoryChange = (event) => {
    const { name, type, checked, value } = event.target
    setCategoryForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleCategoryEditChange = (event) => {
    const { name, type, checked, value } = event.target
    setCategoryEditForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const applyFilters = (event) => {
    event.preventDefault()
    loadExpenses(filters)
  }

  const buildExpensePayload = (payload) => ({
    ...payload,
    categoryId: toNumber(payload.categoryId),
    amount: toNumber(payload.amount),
    employeeId: payload.employeeId ? toNumber(payload.employeeId) : undefined,
    advanceMonth: payload.advanceMonth ? toNumber(payload.advanceMonth) : undefined,
    advanceYear: payload.advanceYear ? toNumber(payload.advanceYear) : undefined,
  })

  const createExpense = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.createExpense(buildExpensePayload(expenseForm))
      setExpenseForm(emptyExpense)
      setSuccess('تم تسجيل المصروف بنجاح.')
      await loadExpenses(filters)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const createCategory = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.createExpenseCategory(categoryForm)
      setCategoryForm(emptyCategory)
      setSuccess('تم إضافة نوع المصروف.')
      await loadExpenses(filters)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const openExpenseEditModal = (expense) => {
    const advance = expense.advance

    setEditingExpense(expense)
    setExpenseEditForm({
      categoryId: expense.categoryId || expense.category?.id || '',
      amount: expense.amount ?? '',
      date: expense.date ? expense.date.slice(0, 10) : today(),
      notes: expense.notes || '',
      employeeId: advance?.employeeId || '',
      advanceMonth: advance?.month || new Date().getMonth() + 1,
      advanceYear: advance?.year || new Date().getFullYear(),
    })
  }

  const updateExpense = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.updateExpense(editingExpense.id, buildExpensePayload(expenseEditForm))
      setEditingExpense(null)
      setExpenseEditForm(emptyExpense)
      setSuccess('تم تعديل المصروف.')
      await loadExpenses(filters)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const deleteExpense = async (expense) => {
    const confirmed = window.confirm(`هل تريد حذف مصروف "${expense.category?.name || ''}"؟`)

    if (!confirmed) {
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.deleteExpense(expense.id)
      setSuccess('تم حذف المصروف.')
      await loadExpenses(filters)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const openCategoryEditModal = (category) => {
    setEditingCategory(category)
    setCategoryEditForm({
      name: category.name || '',
      isAdvance: Boolean(category.isAdvance),
    })
  }

  const updateCategory = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.updateExpenseCategory(editingCategory.id, categoryEditForm)
      setEditingCategory(null)
      setCategoryEditForm(emptyCategory)
      setSuccess('تم تعديل نوع المصروف.')
      await loadExpenses(filters)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const deleteCategory = async (category) => {
    const confirmed = window.confirm(`هل تريد حذف نوع المصروف "${category.name}"؟`)

    if (!confirmed) {
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.deleteExpenseCategory(category.id)
      setSuccess('تم حذف نوع المصروف.')
      await loadExpenses(filters)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading && categories.length === 0 && expenses.length === 0) {
    return <LoadingCard label="جاري تحميل المصروفات..." />
  }

  return (
    <>
      <PageHeader title="المصروفات" subtitle="تسجيل المصروفات اليومية وسلف الموظفين." />

      <ApiAlert
        error={error}
        success={success}
        onClose={() => {
          setError('')
          setSuccess('')
        }}
      />

      <CRow className="mb-4" xs={{ gutter: 4 }}>
        <CCol sm={6} xl={3}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">مصروفات الفترة</div>
            <div className="fs-3 fw-semibold">{formatNumber(summary.count)}</div>
          </SectionCard>
        </CCol>
        <CCol sm={6} xl={3}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">إجمالي الفترة</div>
            <div className="fs-5 fw-semibold">{formatMoney(summary.total)}</div>
          </SectionCard>
        </CCol>
        <CCol sm={6} xl={3}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">مصروفات اليوم</div>
            <div className="fs-5 fw-semibold">{formatMoney(summary.today)}</div>
          </SectionCard>
        </CCol>
        <CCol sm={6} xl={3}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">أنواع المصروفات</div>
            <div className="fs-3 fw-semibold">{formatNumber(summary.categories)}</div>
          </SectionCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol xl={8}>
          <SectionCard title="تسجيل مصروف">
            <CForm onSubmit={createExpense}>
              <CRow className="g-3">
                <CCol md={4}>
                  <CFormLabel htmlFor="expenseCategory">نوع المصروف</CFormLabel>
                  <CFormSelect
                    id="expenseCategory"
                    name="categoryId"
                    value={expenseForm.categoryId}
                    onChange={handleExpenseChange}
                    required
                  >
                    <option value="">اختر النوع</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="expenseAmount">المبلغ</CFormLabel>
                  <CFormInput
                    id="expenseAmount"
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={handleExpenseChange}
                    required
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="expenseDate">التاريخ</CFormLabel>
                  <CFormInput
                    id="expenseDate"
                    name="date"
                    type="date"
                    value={expenseForm.date}
                    onChange={handleExpenseChange}
                  />
                </CCol>

                {selectedCategory?.isAdvance ? (
                  <>
                    <CCol md={4}>
                      <CFormLabel htmlFor="expenseEmployee">الموظف</CFormLabel>
                      <CFormSelect
                        id="expenseEmployee"
                        name="employeeId"
                        value={expenseForm.employeeId}
                        onChange={handleExpenseChange}
                        required
                      >
                        <option value="">اختر الموظف</option>
                        {employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol md={4}>
                      <CFormLabel htmlFor="advanceMonth">شهر الخصم</CFormLabel>
                      <CFormInput
                        id="advanceMonth"
                        name="advanceMonth"
                        type="number"
                        min="1"
                        max="12"
                        value={expenseForm.advanceMonth}
                        onChange={handleExpenseChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormLabel htmlFor="advanceYear">سنة الخصم</CFormLabel>
                      <CFormInput
                        id="advanceYear"
                        name="advanceYear"
                        type="number"
                        min="2020"
                        value={expenseForm.advanceYear}
                        onChange={handleExpenseChange}
                      />
                    </CCol>
                  </>
                ) : null}

                <CCol xs={12}>
                  <CFormLabel htmlFor="expenseNotes">ملاحظات</CFormLabel>
                  <CFormTextarea
                    id="expenseNotes"
                    name="notes"
                    rows={2}
                    value={expenseForm.notes}
                    onChange={handleExpenseChange}
                  />
                </CCol>
                <CCol xs={12}>
                  <SubmitButton color="primary" type="submit" saving={saving}>
                    تسجيل المصروف
                  </SubmitButton>
                </CCol>
              </CRow>
            </CForm>
          </SectionCard>
        </CCol>

        <CCol xl={4}>
          <SectionCard title="إضافة نوع مصروف">
            <CForm onSubmit={createCategory}>
              <CRow className="g-3">
                <CCol xs={12}>
                  <CFormLabel htmlFor="categoryName">اسم النوع</CFormLabel>
                  <CFormInput
                    id="categoryName"
                    name="name"
                    value={categoryForm.name}
                    onChange={handleCategoryChange}
                    required
                  />
                </CCol>
                <CCol xs={12}>
                  <CFormCheck
                    id="categoryIsAdvance"
                    name="isAdvance"
                    label="هذا النوع يمثل سلفة موظف"
                    checked={categoryForm.isAdvance}
                    onChange={handleCategoryChange}
                  />
                </CCol>
                <CCol xs={12}>
                  <SubmitButton color="secondary" variant="outline" type="submit" saving={saving}>
                    إضافة النوع
                  </SubmitButton>
                </CCol>
              </CRow>
            </CForm>

            <div className="mt-4">
              <div className="fw-semibold mb-2">أنواع المصروفات</div>
              {categories.length === 0 ? (
                <EmptyState title="لا توجد أنواع مصروفات" />
              ) : (
                <div className="d-flex flex-column gap-2">
                  {categories.map((category) => (
                    <div key={category.id} className="border rounded p-2 d-flex flex-column gap-2">
                      <div className="d-flex justify-content-between gap-2">
                        <div className="fw-semibold">{category.name}</div>
                        {category.isAdvance ? <CBadge color="warning">سلفة</CBadge> : null}
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        <CButton
                          size="sm"
                          color="info"
                          variant="outline"
                          className="d-inline-flex align-items-center gap-2"
                          onClick={() => openCategoryEditModal(category)}
                        >
                          <CIcon icon={cilPencil} />
                          تعديل
                        </CButton>
                        <CButton
                          size="sm"
                          color="danger"
                          variant="outline"
                          className="d-inline-flex align-items-center gap-2"
                          disabled={saving}
                          onClick={() => deleteCategory(category)}
                        >
                          <CIcon icon={cilTrash} />
                          حذف
                        </CButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>
        </CCol>
      </CRow>

      <SectionCard title="سجل المصروفات">
        <CForm className="mb-3" onSubmit={applyFilters}>
          <CRow className="g-3 align-items-end">
            <CCol md={3}>
              <CFormLabel htmlFor="expenseFrom">من</CFormLabel>
              <CFormInput
                id="expenseFrom"
                name="from"
                type="date"
                value={filters.from}
                onChange={handleFilterChange}
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel htmlFor="expenseTo">إلى</CFormLabel>
              <CFormInput
                id="expenseTo"
                name="to"
                type="date"
                value={filters.to}
                onChange={handleFilterChange}
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel htmlFor="filterCategory">النوع</CFormLabel>
              <CFormSelect
                id="filterCategory"
                name="categoryId"
                value={filters.categoryId}
                onChange={handleFilterChange}
              >
                <option value="">كل الأنواع</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CButton color="primary" type="submit" disabled={loading}>
                عرض
              </CButton>
            </CCol>
          </CRow>
        </CForm>

        {expenses.length === 0 ? (
          <EmptyState title="لا توجد مصروفات" />
        ) : (
          <CTable align="middle" responsive hover className="mb-0">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>النوع</CTableHeaderCell>
                <CTableHeaderCell>التاريخ</CTableHeaderCell>
                <CTableHeaderCell>تفاصيل</CTableHeaderCell>
                <CTableHeaderCell className="text-end">المبلغ</CTableHeaderCell>
                <CTableHeaderCell className="text-end">الإجراء</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {expenses.map((expense) => (
                <CTableRow key={expense.id}>
                  <CTableDataCell>
                    <div className="fw-semibold">{expense.category?.name}</div>
                    {expense.category?.isAdvance ? <CBadge color="warning">سلفة</CBadge> : null}
                  </CTableDataCell>
                  <CTableDataCell>{formatDate(expense.date)}</CTableDataCell>
                  <CTableDataCell>
                    {expense.advance?.employee?.name ? (
                      <div className="small text-body-secondary">
                        سلفة: {expense.advance.employee.name}
                      </div>
                    ) : null}
                    <div>{expense.notes || '-'}</div>
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    {formatMoney(expense.amount)}
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    <div className="d-flex flex-wrap justify-content-end gap-2">
                      <CButton
                        size="sm"
                        color="info"
                        variant="outline"
                        className="d-inline-flex align-items-center gap-2"
                        onClick={() => openExpenseEditModal(expense)}
                      >
                        <CIcon icon={cilPencil} />
                        تعديل
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        variant="outline"
                        className="d-inline-flex align-items-center gap-2"
                        disabled={saving}
                        onClick={() => deleteExpense(expense)}
                      >
                        <CIcon icon={cilTrash} />
                        حذف
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </SectionCard>

      <CModal visible={Boolean(editingCategory)} onClose={() => setEditingCategory(null)}>
        <CForm onSubmit={updateCategory}>
          <CModalHeader>
            <CModalTitle>تعديل نوع مصروف</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow className="g-3">
              <CCol xs={12}>
                <CFormLabel htmlFor="editCategoryName">اسم النوع</CFormLabel>
                <CFormInput
                  id="editCategoryName"
                  name="name"
                  value={categoryEditForm.name}
                  onChange={handleCategoryEditChange}
                  required
                />
              </CCol>
              <CCol xs={12}>
                <CFormCheck
                  id="editCategoryIsAdvance"
                  name="isAdvance"
                  label="هذا النوع يمثل سلفة موظف"
                  checked={categoryEditForm.isAdvance}
                  onChange={handleCategoryEditChange}
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={() => setEditingCategory(null)}>
              إلغاء
            </CButton>
            <SubmitButton color="primary" type="submit" saving={saving}>
              حفظ التعديل
            </SubmitButton>
          </CModalFooter>
        </CForm>
      </CModal>

      <CModal size="lg" visible={Boolean(editingExpense)} onClose={() => setEditingExpense(null)}>
        <CForm onSubmit={updateExpense}>
          <CModalHeader>
            <CModalTitle>تعديل مصروف</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow className="g-3">
              <CCol md={4}>
                <CFormLabel htmlFor="editExpenseCategory">نوع المصروف</CFormLabel>
                <CFormSelect
                  id="editExpenseCategory"
                  name="categoryId"
                  value={expenseEditForm.categoryId}
                  onChange={handleExpenseEditChange}
                  required
                >
                  <option value="">اختر النوع</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="editExpenseAmount">المبلغ</CFormLabel>
                <CFormInput
                  id="editExpenseAmount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={expenseEditForm.amount}
                  onChange={handleExpenseEditChange}
                  required
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="editExpenseDate">التاريخ</CFormLabel>
                <CFormInput
                  id="editExpenseDate"
                  name="date"
                  type="date"
                  value={expenseEditForm.date}
                  onChange={handleExpenseEditChange}
                />
              </CCol>

              {selectedEditCategory?.isAdvance ? (
                <>
                  <CCol md={4}>
                    <CFormLabel htmlFor="editExpenseEmployee">الموظف</CFormLabel>
                    <CFormSelect
                      id="editExpenseEmployee"
                      name="employeeId"
                      value={expenseEditForm.employeeId}
                      onChange={handleExpenseEditChange}
                      required
                    >
                      <option value="">اختر الموظف</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel htmlFor="editAdvanceMonth">شهر الخصم</CFormLabel>
                    <CFormInput
                      id="editAdvanceMonth"
                      name="advanceMonth"
                      type="number"
                      min="1"
                      max="12"
                      value={expenseEditForm.advanceMonth}
                      onChange={handleExpenseEditChange}
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel htmlFor="editAdvanceYear">سنة الخصم</CFormLabel>
                    <CFormInput
                      id="editAdvanceYear"
                      name="advanceYear"
                      type="number"
                      min="2020"
                      value={expenseEditForm.advanceYear}
                      onChange={handleExpenseEditChange}
                    />
                  </CCol>
                </>
              ) : null}

              <CCol xs={12}>
                <CFormLabel htmlFor="editExpenseNotes">ملاحظات</CFormLabel>
                <CFormTextarea
                  id="editExpenseNotes"
                  name="notes"
                  rows={3}
                  value={expenseEditForm.notes}
                  onChange={handleExpenseEditChange}
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={() => setEditingExpense(null)}>
              إلغاء
            </CButton>
            <SubmitButton color="primary" type="submit" saving={saving}>
              حفظ التعديل
            </SubmitButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </>
  )
}

export default Expenses

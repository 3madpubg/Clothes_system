import React, { useEffect, useMemo, useState } from 'react'
import {
  CBadge,
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
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

const emptyEmployee = {
  name: '',
  phone: '',
  nationalId: '',
  jobTitle: '',
  baseSalary: '',
  hireDate: today(),
  notes: '',
}

const Employees = () => {
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState(emptyEmployee)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [editForm, setEditForm] = useState(emptyEmployee)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadEmployees = async () => {
    setLoading(true)
    setError('')

    try {
      setEmployees(await shopApi.employees())
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadEmployees, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const summary = useMemo(
    () => ({
      count: employees.length,
      payroll: employees.reduce((sum, employee) => sum + Number(employee.baseSalary || 0), 0),
      advances: employees.reduce(
        (sum, employee) => sum + Number(employee.totalPendingAdvances || 0),
        0,
      ),
      withAdvances: employees.filter((employee) => Number(employee.totalPendingAdvances || 0) > 0)
        .length,
    }),
    [employees],
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((current) => ({ ...current, [name]: value }))
  }

  const createEmployee = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.createEmployee({
        ...form,
        baseSalary: toNumber(form.baseSalary),
      })
      setForm(emptyEmployee)
      setSuccess('تم إضافة الموظف بنجاح.')
      await loadEmployees()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const openEditModal = (employee) => {
    setEditingEmployee(employee)
    setEditForm({
      name: employee.name || '',
      phone: employee.phone || '',
      nationalId: employee.nationalId || '',
      jobTitle: employee.jobTitle || '',
      baseSalary: employee.baseSalary ?? '',
      hireDate: employee.hireDate ? employee.hireDate.slice(0, 10) : today(),
      notes: employee.notes || '',
    })
  }

  const updateEmployee = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.updateEmployee(editingEmployee.id, {
        name: editForm.name,
        phone: editForm.phone,
        jobTitle: editForm.jobTitle,
        baseSalary: toNumber(editForm.baseSalary),
        notes: editForm.notes,
      })
      setEditingEmployee(null)
      setEditForm(emptyEmployee)
      setSuccess('تم تعديل بيانات الموظف.')
      await loadEmployees()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const deactivateEmployee = async (employee) => {
    const confirmed = window.confirm(`هل تريد إنهاء خدمة "${employee.name}"؟`)

    if (!confirmed) {
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.deactivateEmployee(employee.id)
      setSuccess('تم إنهاء خدمة الموظف.')
      await loadEmployees()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading && employees.length === 0) {
    return <LoadingCard label="جاري تحميل الموظفين..." />
  }

  return (
    <>
      <PageHeader title="الموظفون" subtitle="إدارة بيانات الموظفين والرواتب الأساسية والسلف." />

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
            <div className="text-body-secondary small">الموظفون</div>
            <div className="fs-3 fw-semibold">{formatNumber(summary.count)}</div>
          </SectionCard>
        </CCol>
        <CCol sm={6} xl={3}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">إجمالي الرواتب الأساسية</div>
            <div className="fs-5 fw-semibold">{formatMoney(summary.payroll)}</div>
          </SectionCard>
        </CCol>
        <CCol sm={6} xl={3}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">إجمالي السلف المفتوحة</div>
            <div className="fs-5 fw-semibold">{formatMoney(summary.advances)}</div>
          </SectionCard>
        </CCol>
        <CCol sm={6} xl={3}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">لديهم سلف</div>
            <div className="fs-3 fw-semibold">{formatNumber(summary.withAdvances)}</div>
          </SectionCard>
        </CCol>
      </CRow>

      <SectionCard title="إضافة موظف">
        <CForm onSubmit={createEmployee}>
          <CRow className="g-3">
            <CCol md={3}>
              <CFormLabel htmlFor="employeeName">الاسم</CFormLabel>
              <CFormInput
                id="employeeName"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel htmlFor="employeePhone">الهاتف</CFormLabel>
              <CFormInput
                id="employeePhone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel htmlFor="employeeNationalId">الرقم القومي</CFormLabel>
              <CFormInput
                id="employeeNationalId"
                name="nationalId"
                value={form.nationalId}
                onChange={handleChange}
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel htmlFor="employeeJobTitle">الوظيفة</CFormLabel>
              <CFormInput
                id="employeeJobTitle"
                name="jobTitle"
                value={form.jobTitle}
                onChange={handleChange}
                required
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel htmlFor="employeeBaseSalary">الراتب الأساسي</CFormLabel>
              <CFormInput
                id="employeeBaseSalary"
                name="baseSalary"
                type="number"
                min="0"
                step="0.01"
                value={form.baseSalary}
                onChange={handleChange}
                required
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel htmlFor="employeeHireDate">تاريخ التعيين</CFormLabel>
              <CFormInput
                id="employeeHireDate"
                name="hireDate"
                type="date"
                value={form.hireDate}
                onChange={handleChange}
                required
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel htmlFor="employeeNotes">ملاحظات</CFormLabel>
              <CFormInput
                id="employeeNotes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
              />
            </CCol>
            <CCol md={2} className="d-flex align-items-end">
              <SubmitButton color="primary" type="submit" saving={saving}>
                إضافة موظف
              </SubmitButton>
            </CCol>
          </CRow>
        </CForm>
      </SectionCard>

      <SectionCard title="قائمة الموظفين">
        {employees.length === 0 ? (
          <EmptyState title="لا يوجد موظفون" text="أضف الموظفين حتى تظهر الرواتب والسلف." />
        ) : (
          <CTable align="middle" responsive hover className="mb-0">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>الموظف</CTableHeaderCell>
                <CTableHeaderCell>الوظيفة</CTableHeaderCell>
                <CTableHeaderCell>تاريخ التعيين</CTableHeaderCell>
                <CTableHeaderCell className="text-end">الراتب</CTableHeaderCell>
                <CTableHeaderCell className="text-end">السلف المفتوحة</CTableHeaderCell>
                <CTableHeaderCell className="text-end">الإجراء</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {employees.map((employee) => (
                <CTableRow key={employee.id}>
                  <CTableDataCell>
                    <div className="fw-semibold">{employee.name}</div>
                    <div className="small text-body-secondary">{employee.phone || '-'}</div>
                  </CTableDataCell>
                  <CTableDataCell>{employee.jobTitle}</CTableDataCell>
                  <CTableDataCell>{formatDate(employee.hireDate)}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    {formatMoney(employee.baseSalary)}
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    <CBadge
                      color={Number(employee.totalPendingAdvances || 0) > 0 ? 'warning' : 'success'}
                    >
                      {formatMoney(employee.totalPendingAdvances)}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    <div className="d-flex flex-wrap justify-content-end gap-2">
                      <CButton
                        size="sm"
                        color="info"
                        variant="outline"
                        onClick={() => openEditModal(employee)}
                      >
                        تعديل
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        variant="outline"
                        disabled={saving}
                        onClick={() => deactivateEmployee(employee)}
                      >
                        إنهاء الخدمة
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </SectionCard>

      <CModal visible={Boolean(editingEmployee)} onClose={() => setEditingEmployee(null)}>
        <CForm onSubmit={updateEmployee}>
          <CModalHeader>
            <CModalTitle>تعديل موظف</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel htmlFor="editEmployeeName">الاسم</CFormLabel>
                <CFormInput
                  id="editEmployeeName"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="editEmployeePhone">الهاتف</CFormLabel>
                <CFormInput
                  id="editEmployeePhone"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="editEmployeeJobTitle">الوظيفة</CFormLabel>
                <CFormInput
                  id="editEmployeeJobTitle"
                  name="jobTitle"
                  value={editForm.jobTitle}
                  onChange={handleEditChange}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="editEmployeeBaseSalary">الراتب الأساسي</CFormLabel>
                <CFormInput
                  id="editEmployeeBaseSalary"
                  name="baseSalary"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.baseSalary}
                  onChange={handleEditChange}
                  required
                />
              </CCol>
              <CCol xs={12}>
                <CFormLabel htmlFor="editEmployeeNotes">ملاحظات</CFormLabel>
                <CFormTextarea
                  id="editEmployeeNotes"
                  name="notes"
                  rows={3}
                  value={editForm.notes}
                  onChange={handleEditChange}
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={() => setEditingEmployee(null)}>
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

export default Employees

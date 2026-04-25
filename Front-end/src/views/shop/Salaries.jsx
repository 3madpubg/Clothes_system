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

const now = new Date()
const initialPeriod = {
  month: now.getMonth() + 1,
  year: now.getFullYear(),
}

const emptySalaryEdit = {
  bonus: 0,
  overtimePay: 0,
  absenceDays: 0,
  penalties: 0,
  notes: '',
}

const Salaries = () => {
  const [period, setPeriod] = useState(initialPeriod)
  const [summary, setSummary] = useState({})
  const [salaries, setSalaries] = useState([])
  const [editingSalary, setEditingSalary] = useState(null)
  const [editForm, setEditForm] = useState(emptySalaryEdit)
  const [generationResults, setGenerationResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadSalaries = async (params = period) => {
    setLoading(true)
    setError('')

    try {
      const data = await shopApi.salaries(params)
      setSummary(data.summary || {})
      setSalaries(data.salaries || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadSalaries, 0)
    return () => window.clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const calculatedSummary = useMemo(
    () => ({
      totalBaseSalaries: summary.totalBaseSalaries || 0,
      totalAdvances: summary.totalAdvances || 0,
      totalNet: summary.totalNet || 0,
      pendingCount: summary.pendingCount || 0,
      paidCount: summary.paidCount || 0,
    }),
    [summary],
  )

  const handlePeriodChange = (event) => {
    const { name, value } = event.target
    setPeriod((current) => ({ ...current, [name]: value }))
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((current) => ({ ...current, [name]: value }))
  }

  const applyPeriod = (event) => {
    event.preventDefault()
    loadSalaries(period)
  }

  const generateSalaries = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    setGenerationResults([])

    try {
      const data = await shopApi.generateSalaries({
        month: toNumber(period.month),
        year: toNumber(period.year),
      })
      setGenerationResults(data)
      setSuccess('تم توليد مرتبات الشهر.')
      await loadSalaries(period)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const openEditModal = (salary) => {
    setEditingSalary(salary)
    setEditForm({
      bonus: salary.bonus ?? 0,
      overtimePay: salary.overtimePay ?? 0,
      absenceDays: salary.absenceDays ?? 0,
      penalties: salary.penalties ?? 0,
      notes: salary.notes || '',
    })
  }

  const updateSalary = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.updateSalary(editingSalary.id, {
        bonus: toNumber(editForm.bonus),
        overtimePay: toNumber(editForm.overtimePay),
        absenceDays: toNumber(editForm.absenceDays),
        penalties: toNumber(editForm.penalties),
        notes: editForm.notes,
      })
      setEditingSalary(null)
      setEditForm(emptySalaryEdit)
      setSuccess('تم تعديل المرتب.')
      await loadSalaries(period)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const paySalary = async (salary) => {
    const confirmed = window.confirm(`تأكيد صرف مرتب "${salary.employee?.name}"؟`)

    if (!confirmed) {
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.paySalary(salary.id)
      setSuccess('تم تسجيل صرف المرتب.')
      await loadSalaries(period)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading && salaries.length === 0) {
    return <LoadingCard label="جاري تحميل المرتبات..." />
  }

  return (
    <>
      <PageHeader title="المرتبات" subtitle="توليد مرتبات الشهر وتعديل الإضافات والخصومات." />

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
            <div className="text-body-secondary small">إجمالي الأساسي</div>
            <div className="fs-5 fw-semibold">
              {formatMoney(calculatedSummary.totalBaseSalaries)}
            </div>
          </SectionCard>
        </CCol>
        <CCol sm={6} xl={3}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">السلف المخصومة</div>
            <div className="fs-5 fw-semibold">{formatMoney(calculatedSummary.totalAdvances)}</div>
          </SectionCard>
        </CCol>
        <CCol sm={6} xl={3}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">صافي المرتبات</div>
            <div className="fs-5 fw-semibold">{formatMoney(calculatedSummary.totalNet)}</div>
          </SectionCard>
        </CCol>
        <CCol sm={6} xl={3}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">قيد الانتظار / مدفوعة</div>
            <div className="fs-5 fw-semibold">
              {formatNumber(calculatedSummary.pendingCount)} /{' '}
              {formatNumber(calculatedSummary.paidCount)}
            </div>
          </SectionCard>
        </CCol>
      </CRow>

      <SectionCard title="فترة المرتبات">
        <CForm onSubmit={applyPeriod}>
          <CRow className="g-3 align-items-end">
            <CCol md={3}>
              <CFormLabel htmlFor="salaryMonth">الشهر</CFormLabel>
              <CFormInput
                id="salaryMonth"
                name="month"
                type="number"
                min="1"
                max="12"
                value={period.month}
                onChange={handlePeriodChange}
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel htmlFor="salaryYear">السنة</CFormLabel>
              <CFormInput
                id="salaryYear"
                name="year"
                type="number"
                min="2020"
                value={period.year}
                onChange={handlePeriodChange}
              />
            </CCol>
            <CCol md={3}>
              <CButton color="secondary" variant="outline" type="submit" disabled={loading}>
                عرض المرتبات
              </CButton>
            </CCol>
            <CCol md={3}>
              <CButton color="primary" type="button" disabled={saving} onClick={generateSalaries}>
                توليد مرتبات الشهر
              </CButton>
            </CCol>
          </CRow>
        </CForm>

        {generationResults.length ? (
          <div className="mt-3">
            {generationResults.slice(0, 5).map((result) => (
              <CBadge
                color="secondary"
                className="ms-2 mb-2"
                key={`${result.employee}-${result.status}`}
              >
                {result.employee}: {result.status}
              </CBadge>
            ))}
          </div>
        ) : null}
      </SectionCard>

      <SectionCard title="مرتبات الشهر">
        {salaries.length === 0 ? (
          <EmptyState title="لا توجد مرتبات" text="اختر الفترة ثم اضغط توليد مرتبات الشهر." />
        ) : (
          <CTable align="middle" responsive hover className="mb-0">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>الموظف</CTableHeaderCell>
                <CTableHeaderCell className="text-end">الأساسي</CTableHeaderCell>
                <CTableHeaderCell className="text-end">إضافات</CTableHeaderCell>
                <CTableHeaderCell className="text-end">خصومات</CTableHeaderCell>
                <CTableHeaderCell className="text-end">الصافي</CTableHeaderCell>
                <CTableHeaderCell>الحالة</CTableHeaderCell>
                <CTableHeaderCell className="text-end">الإجراء</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {salaries.map((salary) => {
                const additions = Number(salary.bonus || 0) + Number(salary.overtimePay || 0)
                const deductions =
                  Number(salary.advances || 0) +
                  Number(salary.absenceDeduct || 0) +
                  Number(salary.penalties || 0)

                return (
                  <CTableRow key={salary.id}>
                    <CTableDataCell>
                      <div className="fw-semibold">{salary.employee?.name}</div>
                      <div className="small text-body-secondary">{salary.employee?.jobTitle}</div>
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      {formatMoney(salary.baseSalary)}
                    </CTableDataCell>
                    <CTableDataCell className="text-end">{formatMoney(additions)}</CTableDataCell>
                    <CTableDataCell className="text-end">{formatMoney(deductions)}</CTableDataCell>
                    <CTableDataCell className="text-end">
                      {formatMoney(salary.netSalary)}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={salary.status === 'PAID' ? 'success' : 'warning'}>
                        {salary.status === 'PAID' ? 'مدفوع' : 'قيد الانتظار'}
                      </CBadge>
                      {salary.paidAt ? (
                        <div className="small text-body-secondary mt-1">
                          {formatDate(salary.paidAt)}
                        </div>
                      ) : null}
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <div className="d-flex flex-wrap justify-content-end gap-2">
                        <CButton
                          size="sm"
                          color="info"
                          variant="outline"
                          onClick={() => openEditModal(salary)}
                        >
                          تعديل
                        </CButton>
                        <CButton
                          size="sm"
                          color="success"
                          variant="outline"
                          disabled={saving || salary.status === 'PAID'}
                          onClick={() => paySalary(salary)}
                        >
                          صرف
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                )
              })}
            </CTableBody>
          </CTable>
        )}
      </SectionCard>

      <CModal visible={Boolean(editingSalary)} onClose={() => setEditingSalary(null)}>
        <CForm onSubmit={updateSalary}>
          <CModalHeader>
            <CModalTitle>تعديل مرتب {editingSalary?.employee?.name}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel htmlFor="salaryBonus">بونص</CFormLabel>
                <CFormInput
                  id="salaryBonus"
                  name="bonus"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.bonus}
                  onChange={handleEditChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="salaryOvertime">أوفر تايم</CFormLabel>
                <CFormInput
                  id="salaryOvertime"
                  name="overtimePay"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.overtimePay}
                  onChange={handleEditChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="salaryAbsence">أيام الغياب</CFormLabel>
                <CFormInput
                  id="salaryAbsence"
                  name="absenceDays"
                  type="number"
                  min="0"
                  value={editForm.absenceDays}
                  onChange={handleEditChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="salaryPenalties">جزاءات</CFormLabel>
                <CFormInput
                  id="salaryPenalties"
                  name="penalties"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.penalties}
                  onChange={handleEditChange}
                />
              </CCol>
              <CCol xs={12}>
                <CFormLabel htmlFor="salaryNotes">ملاحظات</CFormLabel>
                <CFormTextarea
                  id="salaryNotes"
                  name="notes"
                  rows={3}
                  value={editForm.notes}
                  onChange={handleEditChange}
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={() => setEditingSalary(null)}>
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

export default Salaries

import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CBadge,
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
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
import { formatDate, formatMoney, formatNumber, getErrorMessage } from 'src/views/shop/utils'

const emptyCustomer = {
  name: '',
  phone: '',
  address: '',
}

const Customers = () => {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [form, setForm] = useState(emptyCustomer)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [editForm, setEditForm] = useState(emptyCustomer)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadCustomers = async () => {
    setLoading(true)
    setError('')

    try {
      setCustomers(await shopApi.customers())
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadCustomers, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const summary = useMemo(
    () => ({
      count: customers.length,
      debt: customers.reduce((sum, customer) => sum + Number(customer.totalDebt || 0), 0),
      withDebt: customers.filter((customer) => Number(customer.totalDebt || 0) > 0).length,
    }),
    [customers],
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((current) => ({ ...current, [name]: value }))
  }

  const createCustomer = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.createCustomer(form)
      setForm(emptyCustomer)
      setSuccess('تم إنشاء العميل بنجاح.')
      await loadCustomers()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const openDetail = async (customer) => {
    setError('')

    try {
      setDetail(await shopApi.customer(customer.id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const openEditModal = (customer) => {
    setEditingCustomer(customer)
    setEditForm({
      name: customer.name || '',
      phone: customer.phone || '',
      address: customer.address || '',
    })
  }

  const updateCustomer = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.updateCustomer(editingCustomer.id, editForm)
      setEditingCustomer(null)
      setEditForm(emptyCustomer)
      setSuccess('تم تعديل بيانات العميل.')
      await loadCustomers()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const deleteCustomer = async (customer) => {
    const confirmed = window.confirm(`هل تريد حذف العميل "${customer.name}"؟`)

    if (!confirmed) {
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.deleteCustomer(customer.id)
      setDetail(null)
      setSuccess('تم حذف العميل.')
      await loadCustomers()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const openInvoice = (invoiceId) => {
    setDetail(null)
    navigate(`/sales/${invoiceId}`)
  }

  const handleInvoiceKeyDown = (event, invoiceId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openInvoice(invoiceId)
    }
  }

  if (loading && customers.length === 0) {
    return <LoadingCard label="جاري تحميل العملاء..." />
  }

  return (
    <>
      <PageHeader title="العملاء" subtitle="إدارة العملاء وفواتير البيع والمبالغ المستحقة." />

      <ApiAlert
        error={error}
        success={success}
        onClose={() => {
          setError('')
          setSuccess('')
        }}
      />

      <CRow className="mb-4" xs={{ gutter: 4 }}>
        <CCol md={4}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">العملاء</div>
            <div className="fs-3 fw-semibold">{formatNumber(summary.count)}</div>
          </SectionCard>
        </CCol>
        <CCol md={4}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">لديهم مديونية</div>
            <div className="fs-3 fw-semibold">{formatNumber(summary.withDebt)}</div>
          </SectionCard>
        </CCol>
        <CCol md={4}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">إجمالي المستحقات</div>
            <div className="fs-4 fw-semibold">{formatMoney(summary.debt)}</div>
          </SectionCard>
        </CCol>
      </CRow>

      <SectionCard title="إضافة عميل">
        <CForm onSubmit={createCustomer}>
          <CRow className="g-3">
            <CCol md={4}>
              <CFormLabel htmlFor="customerName">الاسم</CFormLabel>
              <CFormInput
                id="customerName"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel htmlFor="customerPhone">الهاتف</CFormLabel>
              <CFormInput
                id="customerPhone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel htmlFor="customerAddress">العنوان</CFormLabel>
              <CFormInput
                id="customerAddress"
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </CCol>
            <CCol md={2} className="d-flex align-items-end">
              <SubmitButton color="primary" type="submit" saving={saving}>
                إضافة
              </SubmitButton>
            </CCol>
          </CRow>
        </CForm>
      </SectionCard>

      <SectionCard title="قائمة العملاء">
        {customers.length === 0 ? (
          <EmptyState title="لا يوجد عملاء" text="أضف عميلا قبل تسجيل مبيعات آجلة." />
        ) : (
          <CTable align="middle" responsive hover className="mb-0">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>الاسم</CTableHeaderCell>
                <CTableHeaderCell>الهاتف</CTableHeaderCell>
                <CTableHeaderCell>العنوان</CTableHeaderCell>
                <CTableHeaderCell className="text-end">المستحق</CTableHeaderCell>
                <CTableHeaderCell className="text-end">الإجراء</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {customers.map((customer) => (
                <CTableRow key={customer.id}>
                  <CTableDataCell className="fw-semibold">{customer.name}</CTableDataCell>
                  <CTableDataCell>{customer.phone || '-'}</CTableDataCell>
                  <CTableDataCell>{customer.address || '-'}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    <CBadge color={Number(customer.totalDebt || 0) > 0 ? 'warning' : 'success'}>
                      {formatMoney(customer.totalDebt)}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    <div className="d-flex flex-wrap justify-content-end gap-2">
                      <CButton
                        size="sm"
                        color="primary"
                        variant="outline"
                        onClick={() => openDetail(customer)}
                      >
                        عرض
                      </CButton>
                      <CButton
                        size="sm"
                        color="info"
                        variant="outline"
                        className="d-inline-flex align-items-center gap-2"
                        onClick={() => openEditModal(customer)}
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
                        onClick={() => deleteCustomer(customer)}
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

      <CModal visible={Boolean(editingCustomer)} onClose={() => setEditingCustomer(null)}>
        <CForm onSubmit={updateCustomer}>
          <CModalHeader>
            <CModalTitle>تعديل عميل</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel htmlFor="editCustomerName">الاسم</CFormLabel>
                <CFormInput
                  id="editCustomerName"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="editCustomerPhone">الهاتف</CFormLabel>
                <CFormInput
                  id="editCustomerPhone"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                />
              </CCol>
              <CCol xs={12}>
                <CFormLabel htmlFor="editCustomerAddress">العنوان</CFormLabel>
                <CFormInput
                  id="editCustomerAddress"
                  name="address"
                  value={editForm.address}
                  onChange={handleEditChange}
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={() => setEditingCustomer(null)}>
              إلغاء
            </CButton>
            <SubmitButton color="primary" type="submit" saving={saving}>
              حفظ التعديل
            </SubmitButton>
          </CModalFooter>
        </CForm>
      </CModal>

      <CModal size="lg" visible={Boolean(detail)} onClose={() => setDetail(null)}>
        <CModalHeader>
          <CModalTitle>{detail?.name}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="mb-3">
            <CCol md={4}>
              <div className="text-body-secondary small">الهاتف</div>
              <div className="fw-semibold">{detail?.phone || '-'}</div>
            </CCol>
            <CCol md={4}>
              <div className="text-body-secondary small">العنوان</div>
              <div className="fw-semibold">{detail?.address || '-'}</div>
            </CCol>
            <CCol md={4}>
              <div className="text-body-secondary small">المستحق</div>
              <div className="fw-semibold">{formatMoney(detail?.totalDebt)}</div>
            </CCol>
          </CRow>

          <h6>فواتير البيع</h6>
          <CTable small responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>الفاتورة</CTableHeaderCell>
                <CTableHeaderCell>التاريخ</CTableHeaderCell>
                <CTableHeaderCell className="text-end">الإجمالي</CTableHeaderCell>
                <CTableHeaderCell className="text-end">المتبقي</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {(detail?.salesInvoices || []).map((invoice) => (
                <CTableRow
                  key={invoice.id}
                  className="shop-clickable-row"
                  role="button"
                  tabIndex={0}
                  onClick={() => openInvoice(invoice.id)}
                  onKeyDown={(event) => handleInvoiceKeyDown(event, invoice.id)}
                >
                  <CTableDataCell>{invoice.invoiceNo}</CTableDataCell>
                  <CTableDataCell>{formatDate(invoice.invoiceDate)}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    {formatMoney(invoice.totalAmount)}
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    {formatMoney(invoice.remaining)}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          <h6 className="mt-4">المدفوعات</h6>
          <CTable small responsive className="mb-0">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>التاريخ</CTableHeaderCell>
                <CTableHeaderCell className="text-end">المبلغ</CTableHeaderCell>
                <CTableHeaderCell>ملاحظات</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {(detail?.payments || []).map((payment) => (
                <CTableRow key={payment.id}>
                  <CTableDataCell>{formatDate(payment.paymentDate)}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    {formatMoney(payment.amount)}
                  </CTableDataCell>
                  <CTableDataCell>{payment.notes || '-'}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setDetail(null)}>
            إغلاق
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Customers

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

const emptySupplier = {
  name: '',
  phone: '',
  address: '',
}

const Suppliers = () => {
  const navigate = useNavigate()
  const [suppliers, setSuppliers] = useState([])
  const [form, setForm] = useState(emptySupplier)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [editForm, setEditForm] = useState(emptySupplier)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadSuppliers = async () => {
    setLoading(true)
    setError('')

    try {
      setSuppliers(await shopApi.suppliers())
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadSuppliers, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const summary = useMemo(
    () => ({
      count: suppliers.length,
      debt: suppliers.reduce((sum, supplier) => sum + Number(supplier.totalDebt || 0), 0),
      withDebt: suppliers.filter((supplier) => Number(supplier.totalDebt || 0) > 0).length,
    }),
    [suppliers],
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((current) => ({ ...current, [name]: value }))
  }

  const createSupplier = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.createSupplier(form)
      setForm(emptySupplier)
      setSuccess('تم إنشاء المورد بنجاح.')
      await loadSuppliers()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const openDetail = async (supplier) => {
    setError('')

    try {
      setDetail(await shopApi.supplier(supplier.id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier)
    setEditForm({
      name: supplier.name || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
    })
  }

  const updateSupplier = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.updateSupplier(editingSupplier.id, editForm)
      setEditingSupplier(null)
      setEditForm(emptySupplier)
      setSuccess('تم تعديل بيانات المورد.')
      await loadSuppliers()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const deleteSupplier = async (supplier) => {
    const confirmed = window.confirm(`هل تريد حذف المورد "${supplier.name}"؟`)

    if (!confirmed) {
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.deleteSupplier(supplier.id)
      setDetail(null)
      setSuccess('تم حذف المورد.')
      await loadSuppliers()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const openInvoice = (invoiceId) => {
    setDetail(null)
    navigate(`/purchases/${invoiceId}`)
  }

  const handleInvoiceKeyDown = (event, invoiceId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openInvoice(invoiceId)
    }
  }

  if (loading && suppliers.length === 0) {
    return <LoadingCard label="جاري تحميل الموردين..." />
  }

  return (
    <>
      <PageHeader
        title="الموردون"
        subtitle="متابعة الموردين وفواتير الشراء والمديونيات المستحقة."
      />

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
            <div className="text-body-secondary small">الموردون</div>
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
            <div className="text-body-secondary small">إجمالي ديون الموردين</div>
            <div className="fs-4 fw-semibold">{formatMoney(summary.debt)}</div>
          </SectionCard>
        </CCol>
      </CRow>

      <SectionCard title="إضافة مورد">
        <CForm onSubmit={createSupplier}>
          <CRow className="g-3">
            <CCol md={4}>
              <CFormLabel htmlFor="supplierName">الاسم</CFormLabel>
              <CFormInput
                id="supplierName"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel htmlFor="supplierPhone">الهاتف</CFormLabel>
              <CFormInput
                id="supplierPhone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel htmlFor="supplierAddress">العنوان</CFormLabel>
              <CFormInput
                id="supplierAddress"
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

      <SectionCard title="قائمة الموردين">
        {suppliers.length === 0 ? (
          <EmptyState title="لا يوجد موردون" text="أضف موردا قبل تسجيل مشتريات آجلة." />
        ) : (
          <CTable align="middle" responsive hover className="mb-0">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>الاسم</CTableHeaderCell>
                <CTableHeaderCell>الهاتف</CTableHeaderCell>
                <CTableHeaderCell>العنوان</CTableHeaderCell>
                <CTableHeaderCell className="text-end">المديونية</CTableHeaderCell>
                <CTableHeaderCell className="text-end">الإجراء</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {suppliers.map((supplier) => (
                <CTableRow key={supplier.id}>
                  <CTableDataCell className="fw-semibold">{supplier.name}</CTableDataCell>
                  <CTableDataCell>{supplier.phone || '-'}</CTableDataCell>
                  <CTableDataCell>{supplier.address || '-'}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    <CBadge color={Number(supplier.totalDebt || 0) > 0 ? 'warning' : 'success'}>
                      {formatMoney(supplier.totalDebt)}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    <div className="d-flex flex-wrap justify-content-end gap-2">
                      <CButton
                        size="sm"
                        color="primary"
                        variant="outline"
                        onClick={() => openDetail(supplier)}
                      >
                        عرض
                      </CButton>
                      <CButton
                        size="sm"
                        color="info"
                        variant="outline"
                        className="d-inline-flex align-items-center gap-2"
                        onClick={() => openEditModal(supplier)}
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
                        onClick={() => deleteSupplier(supplier)}
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

      <CModal visible={Boolean(editingSupplier)} onClose={() => setEditingSupplier(null)}>
        <CForm onSubmit={updateSupplier}>
          <CModalHeader>
            <CModalTitle>تعديل مورد</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel htmlFor="editSupplierName">الاسم</CFormLabel>
                <CFormInput
                  id="editSupplierName"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="editSupplierPhone">الهاتف</CFormLabel>
                <CFormInput
                  id="editSupplierPhone"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                />
              </CCol>
              <CCol xs={12}>
                <CFormLabel htmlFor="editSupplierAddress">العنوان</CFormLabel>
                <CFormInput
                  id="editSupplierAddress"
                  name="address"
                  value={editForm.address}
                  onChange={handleEditChange}
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={() => setEditingSupplier(null)}>
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
              <div className="text-body-secondary small">المديونية</div>
              <div className="fw-semibold">{formatMoney(detail?.totalDebt)}</div>
            </CCol>
          </CRow>

          <h6>فواتير الشراء</h6>
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
              {(detail?.purchaseInvoices || []).map((invoice) => (
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

export default Suppliers

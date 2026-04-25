import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
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
import {
  formatDate,
  formatMoney,
  formatNumber,
  getErrorMessage,
  toNumber,
} from 'src/views/shop/utils'

const emptyPayment = {
  partyId: '',
  invoiceId: '',
  amount: '',
  notes: '',
}

const Payments = () => {
  const navigate = useNavigate()
  const [suppliers, setSuppliers] = useState([])
  const [customers, setCustomers] = useState([])
  const [purchases, setPurchases] = useState([])
  const [sales, setSales] = useState([])
  const [supplierPayment, setSupplierPayment] = useState(emptyPayment)
  const [customerPayment, setCustomerPayment] = useState(emptyPayment)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadPaymentsData = async () => {
    setLoading(true)
    setError('')

    try {
      const [supplierData, customerData, purchaseData, saleData] = await Promise.all([
        shopApi.suppliers(),
        shopApi.customers(),
        shopApi.purchases(),
        shopApi.sales(),
      ])

      setSuppliers(supplierData)
      setCustomers(customerData)
      setPurchases(purchaseData)
      setSales(saleData)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadPaymentsData, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const supplierInvoices = useMemo(
    () =>
      purchases.filter(
        (purchase) =>
          Number(purchase.remaining || 0) > 0 &&
          purchase.supplierId &&
          (!supplierPayment.partyId ||
            Number(purchase.supplierId) === toNumber(supplierPayment.partyId)),
      ),
    [purchases, supplierPayment.partyId],
  )

  const customerInvoices = useMemo(
    () =>
      sales.filter(
        (sale) =>
          Number(sale.remaining || 0) > 0 &&
          sale.customerId &&
          (!customerPayment.partyId ||
            Number(sale.customerId) === toNumber(customerPayment.partyId)),
      ),
    [sales, customerPayment.partyId],
  )

  const summary = useMemo(
    () => ({
      supplierDebt: suppliers.reduce((sum, supplier) => sum + Number(supplier.totalDebt || 0), 0),
      customerDebt: customers.reduce((sum, customer) => sum + Number(customer.totalDebt || 0), 0),
      supplierInvoices: purchases.filter((purchase) => Number(purchase.remaining || 0) > 0).length,
      customerInvoices: sales.filter((sale) => Number(sale.remaining || 0) > 0).length,
    }),
    [customers, purchases, sales, suppliers],
  )

  const handleSupplierChange = (event) => {
    const { name, value } = event.target
    setSupplierPayment((current) => ({ ...current, [name]: value }))
  }

  const handleCustomerChange = (event) => {
    const { name, value } = event.target
    setCustomerPayment((current) => ({ ...current, [name]: value }))
  }

  const selectSupplierInvoice = (event) => {
    const invoiceId = event.target.value
    const invoice = purchases.find((purchase) => String(purchase.id) === invoiceId)

    setSupplierPayment((current) => ({
      ...current,
      invoiceId,
      partyId: invoice?.supplierId ? String(invoice.supplierId) : current.partyId,
      amount: invoice ? String(invoice.remaining) : current.amount,
    }))
  }

  const selectCustomerInvoice = (event) => {
    const invoiceId = event.target.value
    const invoice = sales.find((sale) => String(sale.id) === invoiceId)

    setCustomerPayment((current) => ({
      ...current,
      invoiceId,
      partyId: invoice?.customerId ? String(invoice.customerId) : current.partyId,
      amount: invoice ? String(invoice.remaining) : current.amount,
    }))
  }

  const openInvoice = (type, invoiceId) => {
    navigate(`/${type}/${invoiceId}`)
  }

  const handleInvoiceKeyDown = (event, type, invoiceId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openInvoice(type, invoiceId)
    }
  }

  const paySupplier = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.paySupplier({
        supplierId: toNumber(supplierPayment.partyId),
        invoiceId: toNumber(supplierPayment.invoiceId),
        amount: toNumber(supplierPayment.amount),
        notes: supplierPayment.notes,
      })
      setSupplierPayment(emptyPayment)
      setSuccess('تم تسجيل دفعة المورد بنجاح.')
      await loadPaymentsData()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const receiveFromCustomer = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await shopApi.receiveFromCustomer({
        customerId: toNumber(customerPayment.partyId),
        invoiceId: toNumber(customerPayment.invoiceId),
        amount: toNumber(customerPayment.amount),
        notes: customerPayment.notes,
      })
      setCustomerPayment(emptyPayment)
      setSuccess('تم تسجيل تحصيل العميل بنجاح.')
      await loadPaymentsData()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading && suppliers.length === 0 && customers.length === 0) {
    return <LoadingCard label="جاري تحميل بيانات المدفوعات..." />
  }

  return (
    <>
      <PageHeader
        title="المدفوعات"
        subtitle="تسجيل مدفوعات الموردين وتحصيلات العملاء على الفواتير."
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
        <CCol md={3}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">ديون الموردين</div>
            <div className="fs-5 fw-semibold">{formatMoney(summary.supplierDebt)}</div>
          </SectionCard>
        </CCol>
        <CCol md={3}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">مستحقات العملاء</div>
            <div className="fs-5 fw-semibold">{formatMoney(summary.customerDebt)}</div>
          </SectionCard>
        </CCol>
        <CCol md={3}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">مشتريات مفتوحة</div>
            <div className="fs-3 fw-semibold">{formatNumber(summary.supplierInvoices)}</div>
          </SectionCard>
        </CCol>
        <CCol md={3}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">مبيعات مفتوحة</div>
            <div className="fs-3 fw-semibold">{formatNumber(summary.customerInvoices)}</div>
          </SectionCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol lg={6}>
          <SectionCard title="دفع لمورد">
            <CForm onSubmit={paySupplier}>
              <CRow className="g-3">
                <CCol xs={12}>
                  <CFormLabel htmlFor="supplierPaymentParty">المورد</CFormLabel>
                  <CFormSelect
                    id="supplierPaymentParty"
                    name="partyId"
                    value={supplierPayment.partyId}
                    onChange={handleSupplierChange}
                    required
                  >
                    <option value="">اختر المورد</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name} - {formatMoney(supplier.totalDebt)}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol xs={12}>
                  <CFormLabel htmlFor="supplierPaymentInvoice">الفاتورة</CFormLabel>
                  <CFormSelect
                    id="supplierPaymentInvoice"
                    value={supplierPayment.invoiceId}
                    onChange={selectSupplierInvoice}
                    required
                  >
                    <option value="">اختر الفاتورة</option>
                    {supplierInvoices.map((invoice) => (
                      <option key={invoice.id} value={invoice.id}>
                        {invoice.invoiceNo} - {formatMoney(invoice.remaining)}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="supplierPaymentAmount">المبلغ</CFormLabel>
                  <CFormInput
                    id="supplierPaymentAmount"
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={supplierPayment.amount}
                    onChange={handleSupplierChange}
                    required
                  />
                </CCol>
                <CCol xs={12}>
                  <CFormLabel htmlFor="supplierPaymentNotes">ملاحظات</CFormLabel>
                  <CFormTextarea
                    id="supplierPaymentNotes"
                    name="notes"
                    rows={2}
                    value={supplierPayment.notes}
                    onChange={handleSupplierChange}
                  />
                </CCol>
                <CCol xs={12}>
                  <SubmitButton color="primary" type="submit" saving={saving}>
                    تسجيل دفعة المورد
                  </SubmitButton>
                </CCol>
              </CRow>
            </CForm>
          </SectionCard>
        </CCol>

        <CCol lg={6}>
          <SectionCard title="تحصيل من عميل">
            <CForm onSubmit={receiveFromCustomer}>
              <CRow className="g-3">
                <CCol xs={12}>
                  <CFormLabel htmlFor="customerPaymentParty">العميل</CFormLabel>
                  <CFormSelect
                    id="customerPaymentParty"
                    name="partyId"
                    value={customerPayment.partyId}
                    onChange={handleCustomerChange}
                    required
                  >
                    <option value="">اختر العميل</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {formatMoney(customer.totalDebt)}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol xs={12}>
                  <CFormLabel htmlFor="customerPaymentInvoice">الفاتورة</CFormLabel>
                  <CFormSelect
                    id="customerPaymentInvoice"
                    value={customerPayment.invoiceId}
                    onChange={selectCustomerInvoice}
                    required
                  >
                    <option value="">اختر الفاتورة</option>
                    {customerInvoices.map((invoice) => (
                      <option key={invoice.id} value={invoice.id}>
                        {invoice.invoiceNo} - {formatMoney(invoice.remaining)}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="customerPaymentAmount">المبلغ</CFormLabel>
                  <CFormInput
                    id="customerPaymentAmount"
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={customerPayment.amount}
                    onChange={handleCustomerChange}
                    required
                  />
                </CCol>
                <CCol xs={12}>
                  <CFormLabel htmlFor="customerPaymentNotes">ملاحظات</CFormLabel>
                  <CFormTextarea
                    id="customerPaymentNotes"
                    name="notes"
                    rows={2}
                    value={customerPayment.notes}
                    onChange={handleCustomerChange}
                  />
                </CCol>
                <CCol xs={12}>
                  <SubmitButton color="primary" type="submit" saving={saving}>
                    تسجيل تحصيل العميل
                  </SubmitButton>
                </CCol>
              </CRow>
            </CForm>
          </SectionCard>
        </CCol>
      </CRow>

      <SectionCard title="الفواتير المفتوحة">
        {supplierInvoices.length === 0 && customerInvoices.length === 0 ? (
          <EmptyState
            title="لا توجد فواتير مفتوحة"
            text="الفواتير الآجلة ذات المبلغ المتبقي ستظهر هنا."
          />
        ) : (
          <CTable align="middle" responsive hover className="mb-0">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>النوع</CTableHeaderCell>
                <CTableHeaderCell>الفاتورة</CTableHeaderCell>
                <CTableHeaderCell>الطرف</CTableHeaderCell>
                <CTableHeaderCell>التاريخ</CTableHeaderCell>
                <CTableHeaderCell className="text-end">المتبقي</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {purchases
                .filter((invoice) => Number(invoice.remaining || 0) > 0 && invoice.supplierId)
                .map((invoice) => (
                  <CTableRow
                    key={`purchase-${invoice.id}`}
                    className="shop-clickable-row"
                    role="button"
                    tabIndex={0}
                    onClick={() => openInvoice('purchases', invoice.id)}
                    onKeyDown={(event) => handleInvoiceKeyDown(event, 'purchases', invoice.id)}
                  >
                    <CTableDataCell>مستحق الدفع</CTableDataCell>
                    <CTableDataCell className="fw-semibold">{invoice.invoiceNo}</CTableDataCell>
                    <CTableDataCell>{invoice.supplier?.name}</CTableDataCell>
                    <CTableDataCell>{formatDate(invoice.invoiceDate)}</CTableDataCell>
                    <CTableDataCell className="text-end">
                      {formatMoney(invoice.remaining)}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              {sales
                .filter((invoice) => Number(invoice.remaining || 0) > 0 && invoice.customerId)
                .map((invoice) => (
                  <CTableRow
                    key={`sale-${invoice.id}`}
                    className="shop-clickable-row"
                    role="button"
                    tabIndex={0}
                    onClick={() => openInvoice('sales', invoice.id)}
                    onKeyDown={(event) => handleInvoiceKeyDown(event, 'sales', invoice.id)}
                  >
                    <CTableDataCell>مستحق التحصيل</CTableDataCell>
                    <CTableDataCell className="fw-semibold">{invoice.invoiceNo}</CTableDataCell>
                    <CTableDataCell>{invoice.customer?.name}</CTableDataCell>
                    <CTableDataCell>{formatDate(invoice.invoiceDate)}</CTableDataCell>
                    <CTableDataCell className="text-end">
                      {formatMoney(invoice.remaining)}
                    </CTableDataCell>
                  </CTableRow>
                ))}
            </CTableBody>
          </CTable>
        )}
      </SectionCard>
    </>
  )
}

export default Payments

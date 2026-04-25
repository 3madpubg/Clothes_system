import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CBadge,
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
  flattenVariants,
  formatDate,
  formatMoney,
  formatNumber,
  getErrorMessage,
  toNumber,
} from 'src/views/shop/utils'

const today = () => new Date().toISOString().slice(0, 10)

const emptySale = {
  customerId: '',
  invoiceDate: today(),
  paymentType: 'CASH',
  paidAmount: '',
  discount: '',
  notes: '',
}

const emptyItem = {
  variantId: '',
  quantity: 1,
  unitPrice: '',
}

const Sales = () => {
  const navigate = useNavigate()
  const [sales, setSales] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptySale)
  const [itemDraft, setItemDraft] = useState(emptyItem)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadSales = async () => {
    setLoading(true)
    setError('')

    try {
      const [saleData, customerData, productData] = await Promise.all([
        shopApi.sales(),
        shopApi.customers(),
        shopApi.products(),
      ])

      setSales(saleData)
      setCustomers(customerData)
      setProducts(productData)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadSales, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const variants = useMemo(() => flattenVariants(products), [products])

  const summary = useMemo(
    () => ({
      count: sales.length,
      total: sales.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0),
      remaining: sales.reduce((sum, sale) => sum + Number(sale.remaining || 0), 0),
    }),
    [sales],
  )

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
        0,
      ),
    [items],
  )
  const total = Math.max(subtotal - toNumber(form.discount), 0)

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleItemChange = (event) => {
    const { name, value } = event.target

    if (name === 'variantId') {
      const variant = variants.find((candidate) => String(candidate.id) === value)
      setItemDraft((current) => ({
        ...current,
        variantId: value,
        unitPrice: variant ? String(variant.sellingPrice) : '',
      }))
      return
    }

    setItemDraft((current) => ({ ...current, [name]: value }))
  }

  const addItem = () => {
    setError('')
    const variant = variants.find(
      (candidate) => String(candidate.id) === String(itemDraft.variantId),
    )

    if (!variant) {
      setError('اختر نوعا من المخزون قبل إضافة بند البيع.')
      return
    }

    const quantity = toNumber(itemDraft.quantity, 1)

    if (quantity > Number(variant.stockQuantity || 0)) {
      setError(`المتاح فقط ${variant.stockQuantity} قطعة من ${variant.label}.`)
      return
    }

    setItems((current) => [
      ...current,
      {
        localId: Date.now(),
        variantId: variant.id,
        quantity,
        unitPrice: toNumber(itemDraft.unitPrice),
        label: variant.label,
        stockQuantity: variant.stockQuantity,
      },
    ])
    setItemDraft(emptyItem)
  }

  const removeItem = (localId) => {
    setItems((current) => current.filter((item) => item.localId !== localId))
  }

  const openInvoice = (invoiceId) => {
    navigate(`/sales/${invoiceId}`)
  }

  const handleInvoiceKeyDown = (event, invoiceId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openInvoice(invoiceId)
    }
  }

  const createSale = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      if (items.length === 0) {
        throw new Error('أضف بند بيع واحد على الأقل.')
      }

      if (form.paymentType === 'CREDIT' && !form.customerId) {
        throw new Error('اختر عميلا عند البيع الآجل.')
      }

      await shopApi.createSale({
        customerId: form.customerId ? toNumber(form.customerId) : null,
        invoiceDate: form.invoiceDate,
        paymentType: form.paymentType,
        paidAmount: form.paidAmount === '' ? undefined : toNumber(form.paidAmount),
        discount: toNumber(form.discount),
        notes: form.notes,
        items: items.map(({ localId, label, stockQuantity, ...item }) => item),
      })

      setForm(emptySale)
      setItems([])
      setItemDraft(emptyItem)
      setSuccess('تم إنشاء فاتورة البيع وخصم الكمية من المخزون.')
      await loadSales()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading && sales.length === 0) {
    return <LoadingCard label="جاري تحميل فواتير البيع..." />
  }

  return (
    <>
      <PageHeader title="المبيعات" subtitle="إنشاء فواتير البيع وخصم المخزون ومتابعة المستحقات." />

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
            <div className="text-body-secondary small">فواتير البيع</div>
            <div className="fs-3 fw-semibold">{formatNumber(summary.count)}</div>
          </SectionCard>
        </CCol>
        <CCol md={4}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">قيمة المبيعات</div>
            <div className="fs-4 fw-semibold">{formatMoney(summary.total)}</div>
          </SectionCard>
        </CCol>
        <CCol md={4}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">المتبقي للتحصيل</div>
            <div className="fs-4 fw-semibold">{formatMoney(summary.remaining)}</div>
          </SectionCard>
        </CCol>
      </CRow>

      <SectionCard title="فاتورة بيع جديدة">
        <CForm onSubmit={createSale}>
          <CRow className="g-3">
            <CCol md={3}>
              <CFormLabel htmlFor="customerId">العميل</CFormLabel>
              <CFormSelect
                id="customerId"
                name="customerId"
                value={form.customerId}
                onChange={handleFormChange}
              >
                <option value="">عميل نقدي</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CFormLabel htmlFor="invoiceDate">تاريخ الفاتورة</CFormLabel>
              <CFormInput
                id="invoiceDate"
                name="invoiceDate"
                type="date"
                value={form.invoiceDate}
                onChange={handleFormChange}
              />
            </CCol>
            <CCol md={2}>
              <CFormLabel htmlFor="paymentType">طريقة الدفع</CFormLabel>
              <CFormSelect
                id="paymentType"
                name="paymentType"
                value={form.paymentType}
                onChange={handleFormChange}
              >
                <option value="CASH">نقدي</option>
                <option value="CREDIT">آجل</option>
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormLabel htmlFor="discount">الخصم</CFormLabel>
              <CFormInput
                id="discount"
                name="discount"
                type="number"
                min="0"
                step="0.01"
                value={form.discount}
                onChange={handleFormChange}
              />
            </CCol>
            <CCol md={2}>
              <CFormLabel htmlFor="paidAmount">المبلغ المدفوع</CFormLabel>
              <CFormInput
                id="paidAmount"
                name="paidAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder={form.paymentType === 'CASH' ? formatMoney(total) : '0'}
                value={form.paidAmount}
                onChange={handleFormChange}
              />
            </CCol>
            <CCol xs={12}>
              <CFormLabel htmlFor="saleNotes">ملاحظات</CFormLabel>
              <CFormTextarea
                id="saleNotes"
                name="notes"
                rows={2}
                value={form.notes}
                onChange={handleFormChange}
              />
            </CCol>
          </CRow>

          <hr />

          <CRow className="g-3 align-items-end">
            <CCol md={6}>
              <CFormLabel htmlFor="variantId">النوع</CFormLabel>
              <CFormSelect
                id="variantId"
                name="variantId"
                value={itemDraft.variantId}
                onChange={handleItemChange}
              >
                <option value="">اختر النوع</option>
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.label} - {formatNumber(variant.stockQuantity)} في المخزون
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormLabel htmlFor="quantity">الكمية</CFormLabel>
              <CFormInput
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={itemDraft.quantity}
                onChange={handleItemChange}
              />
            </CCol>
            <CCol md={2}>
              <CFormLabel htmlFor="unitPrice">سعر الوحدة</CFormLabel>
              <CFormInput
                id="unitPrice"
                name="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={itemDraft.unitPrice}
                onChange={handleItemChange}
              />
            </CCol>
            <CCol md={2}>
              <CButton color="secondary" variant="outline" type="button" onClick={addItem}>
                إضافة بند
              </CButton>
            </CCol>
          </CRow>

          {items.length > 0 ? (
            <CTable responsive hover className="mt-4">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>البند</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">الكمية</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">السعر</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">الإجمالي</CTableHeaderCell>
                  <CTableHeaderCell />
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {items.map((item) => (
                  <CTableRow key={item.localId}>
                    <CTableDataCell>{item.label}</CTableDataCell>
                    <CTableDataCell className="text-end">
                      {formatNumber(item.quantity)}
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      {formatMoney(item.unitPrice)}
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      {formatMoney(Number(item.quantity) * Number(item.unitPrice))}
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton
                        color="danger"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.localId)}
                      >
                        حذف
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          ) : null}

          <div className="d-flex justify-content-between align-items-center mt-4">
            <div>
              <div className="text-body-secondary small">إجمالي الفاتورة</div>
              <div className="fs-5 fw-semibold">{formatMoney(total)}</div>
            </div>
            <SubmitButton color="primary" type="submit" saving={saving}>
              إنشاء فاتورة بيع
            </SubmitButton>
          </div>
        </CForm>
      </SectionCard>

      <SectionCard title="سجل المبيعات">
        {sales.length === 0 ? (
          <EmptyState title="لا توجد مبيعات" text="أنشئ فاتورة بيع بعد إضافة المخزون." />
        ) : (
          <CTable align="middle" responsive hover className="mb-0">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>الفاتورة</CTableHeaderCell>
                <CTableHeaderCell>العميل</CTableHeaderCell>
                <CTableHeaderCell>التاريخ</CTableHeaderCell>
                <CTableHeaderCell>الدفع</CTableHeaderCell>
                <CTableHeaderCell className="text-end">البنود</CTableHeaderCell>
                <CTableHeaderCell className="text-end">الإجمالي</CTableHeaderCell>
                <CTableHeaderCell className="text-end">المتبقي</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {sales.map((sale) => (
                <CTableRow
                  key={sale.id}
                  className="shop-clickable-row"
                  role="button"
                  tabIndex={0}
                  onClick={() => openInvoice(sale.id)}
                  onKeyDown={(event) => handleInvoiceKeyDown(event, sale.id)}
                >
                  <CTableDataCell className="fw-semibold">{sale.invoiceNo}</CTableDataCell>
                  <CTableDataCell>{sale.customer?.name || 'عميل نقدي'}</CTableDataCell>
                  <CTableDataCell>{formatDate(sale.invoiceDate)}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={sale.paymentType === 'CASH' ? 'success' : 'warning'}>
                      {sale.paymentType === 'CASH' ? 'نقدي' : 'آجل'}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    {formatNumber(sale.items?.length)}
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    {formatMoney(sale.totalAmount)}
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    {formatMoney(sale.remaining)}
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

export default Sales

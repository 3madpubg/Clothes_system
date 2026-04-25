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
  formatDate,
  formatMoney,
  formatNumber,
  getErrorMessage,
  toNumber,
} from 'src/views/shop/utils'

const today = () => new Date().toISOString().slice(0, 10)

const emptyPurchase = {
  supplierId: '',
  invoiceDate: today(),
  paymentType: 'CASH',
  paidAmount: '',
  notes: '',
}

const emptyItem = {
  modelNumber: '',
  name: '',
  category: '',
  size: '',
  color: '',
  type: '',
  quantity: 1,
  unitPrice: '',
  sellingPrice: '',
}

const Purchases = () => {
  const navigate = useNavigate()
  const [purchases, setPurchases] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [form, setForm] = useState(emptyPurchase)
  const [itemDraft, setItemDraft] = useState(emptyItem)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadPurchases = async () => {
    setLoading(true)
    setError('')

    try {
      const [purchaseData, supplierData] = await Promise.all([
        shopApi.purchases(),
        shopApi.suppliers(),
      ])
      setPurchases(purchaseData)
      setSuppliers(supplierData)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadPurchases, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const summary = useMemo(
    () => ({
      count: purchases.length,
      total: purchases.reduce((sum, purchase) => sum + Number(purchase.totalAmount || 0), 0),
      remaining: purchases.reduce((sum, purchase) => sum + Number(purchase.remaining || 0), 0),
    }),
    [purchases],
  )

  const itemsTotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
        0,
      ),
    [items],
  )

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleItemChange = (event) => {
    const { name, value } = event.target
    setItemDraft((current) => ({ ...current, [name]: value }))
  }

  const addItem = () => {
    setError('')

    if (
      !itemDraft.modelNumber ||
      !itemDraft.name ||
      !itemDraft.category ||
      !itemDraft.size ||
      !itemDraft.color ||
      !itemDraft.type ||
      !itemDraft.unitPrice
    ) {
      setError('أكمل بيانات الموديل والمنتج والنوع والسعر قبل إضافة البند.')
      return
    }

    setItems((current) => [
      ...current,
      {
        ...itemDraft,
        localId: Date.now(),
        quantity: toNumber(itemDraft.quantity, 1),
        unitPrice: toNumber(itemDraft.unitPrice),
        sellingPrice: toNumber(itemDraft.sellingPrice, toNumber(itemDraft.unitPrice) * 2),
      },
    ])
    setItemDraft((current) => ({
      ...emptyItem,
      category: current.category,
    }))
  }

  const removeItem = (localId) => {
    setItems((current) => current.filter((item) => item.localId !== localId))
  }

  const openInvoice = (invoiceId) => {
    navigate(`/purchases/${invoiceId}`)
  }

  const handleInvoiceKeyDown = (event, invoiceId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openInvoice(invoiceId)
    }
  }

  const createPurchase = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      if (items.length === 0) {
        throw new Error('أضف بند شراء واحد على الأقل.')
      }

      await shopApi.createPurchase({
        supplierId: form.supplierId ? toNumber(form.supplierId) : null,
        invoiceDate: form.invoiceDate,
        paymentType: form.paymentType,
        paidAmount: form.paidAmount === '' ? undefined : toNumber(form.paidAmount),
        notes: form.notes,
        items: items.map(({ localId, ...item }) => item),
      })

      setForm(emptyPurchase)
      setItems([])
      setItemDraft(emptyItem)
      setSuccess('تم إنشاء فاتورة الشراء وتحديث المخزون.')
      await loadPurchases()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading && purchases.length === 0) {
    return <LoadingCard label="جاري تحميل فواتير الشراء..." />
  }

  return (
    <>
      <PageHeader title="المشتريات" subtitle="إنشاء فواتير شراء وإضافة الكميات إلى المخزون." />

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
            <div className="text-body-secondary small">فواتير الشراء</div>
            <div className="fs-3 fw-semibold">{formatNumber(summary.count)}</div>
          </SectionCard>
        </CCol>
        <CCol md={4}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">قيمة المشتريات</div>
            <div className="fs-4 fw-semibold">{formatMoney(summary.total)}</div>
          </SectionCard>
        </CCol>
        <CCol md={4}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">المتبقي للدفع</div>
            <div className="fs-4 fw-semibold">{formatMoney(summary.remaining)}</div>
          </SectionCard>
        </CCol>
      </CRow>

      <SectionCard title="فاتورة شراء جديدة">
        <CForm onSubmit={createPurchase}>
          <CRow className="g-3">
            <CCol md={3}>
              <CFormLabel htmlFor="supplierId">المورد</CFormLabel>
              <CFormSelect
                id="supplierId"
                name="supplierId"
                value={form.supplierId}
                onChange={handleFormChange}
              >
                <option value="">مورد نقدي</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
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
            <CCol md={3}>
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
            <CCol md={3}>
              <CFormLabel htmlFor="paidAmount">المبلغ المدفوع</CFormLabel>
              <CFormInput
                id="paidAmount"
                name="paidAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder={form.paymentType === 'CASH' ? formatMoney(itemsTotal) : '0'}
                value={form.paidAmount}
                onChange={handleFormChange}
              />
            </CCol>

            <CCol xs={12}>
              <CFormLabel htmlFor="purchaseNotes">ملاحظات</CFormLabel>
              <CFormTextarea
                id="purchaseNotes"
                name="notes"
                rows={2}
                value={form.notes}
                onChange={handleFormChange}
              />
            </CCol>
          </CRow>

          <hr />

          <CRow className="g-3 align-items-end">
            <CCol md={2}>
              <CFormLabel htmlFor="modelNumber">الموديل</CFormLabel>
              <CFormInput
                id="modelNumber"
                name="modelNumber"
                value={itemDraft.modelNumber}
                onChange={handleItemChange}
              />
            </CCol>
            <CCol md={2}>
              <CFormLabel htmlFor="itemName">اسم المنتج</CFormLabel>
              <CFormInput
                id="itemName"
                name="name"
                value={itemDraft.name}
                onChange={handleItemChange}
              />
            </CCol>
            <CCol md={2}>
              <CFormLabel htmlFor="itemCategory">التصنيف</CFormLabel>
              <CFormInput
                id="itemCategory"
                name="category"
                value={itemDraft.category}
                onChange={handleItemChange}
              />
            </CCol>
            <CCol md={2}>
              <CFormLabel htmlFor="itemSize">المقاس</CFormLabel>
              <CFormInput
                id="itemSize"
                name="size"
                value={itemDraft.size}
                onChange={handleItemChange}
              />
            </CCol>
            <CCol md={2}>
              <CFormLabel htmlFor="itemColor">اللون</CFormLabel>
              <CFormInput
                id="itemColor"
                name="color"
                value={itemDraft.color}
                onChange={handleItemChange}
              />
            </CCol>
            <CCol md={2}>
              <CFormLabel htmlFor="itemType">النوع</CFormLabel>
              <CFormInput
                id="itemType"
                name="type"
                value={itemDraft.type}
                onChange={handleItemChange}
              />
            </CCol>
            <CCol md={2}>
              <CFormLabel htmlFor="itemQuantity">الكمية</CFormLabel>
              <CFormInput
                id="itemQuantity"
                name="quantity"
                type="number"
                min="1"
                value={itemDraft.quantity}
                onChange={handleItemChange}
              />
            </CCol>
            <CCol md={2}>
              <CFormLabel htmlFor="unitPrice">سعر الشراء</CFormLabel>
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
              <CFormLabel htmlFor="sellingPrice">سعر البيع</CFormLabel>
              <CFormInput
                id="sellingPrice"
                name="sellingPrice"
                type="number"
                min="0"
                step="0.01"
                value={itemDraft.sellingPrice}
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
                  <CTableHeaderCell>النوع</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">الكمية</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">السعر</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">الإجمالي</CTableHeaderCell>
                  <CTableHeaderCell />
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {items.map((item) => (
                  <CTableRow key={item.localId}>
                    <CTableDataCell>
                      <div className="fw-semibold">{item.modelNumber}</div>
                      <div className="small text-body-secondary">{item.name}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      {item.size} / {item.color} / {item.type}
                    </CTableDataCell>
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
              <div className="fs-5 fw-semibold">{formatMoney(itemsTotal)}</div>
            </div>
            <SubmitButton color="primary" type="submit" saving={saving}>
              إنشاء فاتورة شراء
            </SubmitButton>
          </div>
        </CForm>
      </SectionCard>

      <SectionCard title="سجل المشتريات">
        {purchases.length === 0 ? (
          <EmptyState title="لا توجد مشتريات" text="أنشئ فاتورة شراء لإضافة كميات إلى المخزون." />
        ) : (
          <CTable align="middle" responsive hover className="mb-0">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>الفاتورة</CTableHeaderCell>
                <CTableHeaderCell>المورد</CTableHeaderCell>
                <CTableHeaderCell>التاريخ</CTableHeaderCell>
                <CTableHeaderCell>الدفع</CTableHeaderCell>
                <CTableHeaderCell className="text-end">البنود</CTableHeaderCell>
                <CTableHeaderCell className="text-end">الإجمالي</CTableHeaderCell>
                <CTableHeaderCell className="text-end">المتبقي</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {purchases.map((purchase) => (
                <CTableRow
                  key={purchase.id}
                  className="shop-clickable-row"
                  role="button"
                  tabIndex={0}
                  onClick={() => openInvoice(purchase.id)}
                  onKeyDown={(event) => handleInvoiceKeyDown(event, purchase.id)}
                >
                  <CTableDataCell className="fw-semibold">{purchase.invoiceNo}</CTableDataCell>
                  <CTableDataCell>{purchase.supplier?.name || 'مورد نقدي'}</CTableDataCell>
                  <CTableDataCell>{formatDate(purchase.invoiceDate)}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={purchase.paymentType === 'CASH' ? 'success' : 'warning'}>
                      {purchase.paymentType === 'CASH' ? 'نقدي' : 'آجل'}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    {formatNumber(purchase.items?.length)}
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    {formatMoney(purchase.totalAmount)}
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    {formatMoney(purchase.remaining)}
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

export default Purchases

import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CBadge,
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CProgress,
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
} from 'src/views/shop/components'
import { formatDate, formatMoney, formatNumber, getErrorMessage } from 'src/views/shop/utils'

const monthStart = () => {
  const date = new Date()
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10)
}

const today = () => new Date().toISOString().slice(0, 10)

const Reports = () => {
  const navigate = useNavigate()
  const [stock, setStock] = useState(null)
  const [lowStock, setLowStock] = useState(null)
  const [debts, setDebts] = useState(null)
  const [supplierDebts, setSupplierDebts] = useState(null)
  const [customerDebts, setCustomerDebts] = useState(null)
  const [profit, setProfit] = useState(null)
  const [filters, setFilters] = useState({ from: monthStart(), to: today() })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReports = async (profitFilters = filters) => {
    setLoading(true)
    setError('')

    try {
      const [stockData, lowStockData, debtsData, supplierDebtData, customerDebtData, profitData] =
        await Promise.all([
          shopApi.stockReport(),
          shopApi.lowStockReport(),
          shopApi.debtsReport(),
          shopApi.supplierDebtsReport(),
          shopApi.customerDebtsReport(),
          shopApi.profitReport(profitFilters),
        ])

      setStock(stockData)
      setLowStock(lowStockData)
      setDebts(debtsData)
      setSupplierDebts(supplierDebtData)
      setCustomerDebts(customerDebtData)
      setProfit(profitData)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadReports, 0)
    return () => window.clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const applyFilters = (event) => {
    event.preventDefault()
    loadReports(filters)
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

  const stockSummary = stock?.summary || {}
  const profitSummary = profit?.summary || {}
  const debtNet = Number(debts?.netBalance || 0)
  const profitMarginValue = useMemo(() => {
    const margin = String(profitSummary.profitMargin || '0').replace('%', '')
    return Number(margin) || 0
  }, [profitSummary.profitMargin])

  if (loading && !stock) {
    return <LoadingCard label="جاري تحميل التقارير..." />
  }

  return (
    <>
      <PageHeader title="التقارير" subtitle="تقارير المخزون والمديونيات والأرباح من النظام." />

      <ApiAlert error={error} onClose={() => setError('')} />

      <SectionCard title="فترة تقرير الأرباح">
        <CForm onSubmit={applyFilters}>
          <CRow className="g-3 align-items-end">
            <CCol md={3}>
              <CFormLabel htmlFor="from">من</CFormLabel>
              <CFormInput
                id="from"
                name="from"
                type="date"
                value={filters.from}
                onChange={handleFilterChange}
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel htmlFor="to">إلى</CFormLabel>
              <CFormInput
                id="to"
                name="to"
                type="date"
                value={filters.to}
                onChange={handleFilterChange}
              />
            </CCol>
            <CCol md={3}>
              <CButton color="primary" type="submit" disabled={loading}>
                تحديث التقارير
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </SectionCard>

      <CRow className="mb-4" xs={{ gutter: 4 }}>
        <CCol md={3}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">قطع المخزون</div>
            <div className="fs-3 fw-semibold">{formatNumber(stockSummary.totalItems)}</div>
            <div className="small text-body-secondary">
              {formatNumber(stockSummary.totalVariants)} نوع
            </div>
          </SectionCard>
        </CCol>
        <CCol md={3}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">قيمة المخزون</div>
            <div className="fs-5 fw-semibold">{formatMoney(stockSummary.totalSellingValue)}</div>
            <div className="small text-body-secondary">
              التكلفة {formatMoney(stockSummary.totalPurchaseValue)}
            </div>
          </SectionCard>
        </CCol>
        <CCol md={3}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">إجمالي الربح</div>
            <div className="fs-5 fw-semibold">{formatMoney(profitSummary.totalGrossProfit)}</div>
            <CProgress className="mt-2" color="success" value={profitMarginValue} />
          </SectionCard>
        </CCol>
        <CCol md={3}>
          <SectionCard className="h-100">
            <div className="text-body-secondary small">صافي المديونيات</div>
            <div className={`fs-5 fw-semibold ${debtNet >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatMoney(debtNet)}
            </div>
            <div className="small text-body-secondary">المستحقات ناقص المدفوعات</div>
          </SectionCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol xl={6}>
          <SectionCard title="نقص المخزون">
            {lowStock?.items?.length ? (
              <CTable align="middle" responsive hover className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>المنتج</CTableHeaderCell>
                    <CTableHeaderCell>النوع</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">المخزون</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">حد التنبيه</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {lowStock.items.map((item) => (
                    <CTableRow key={item.variantId}>
                      <CTableDataCell>
                        <div className="fw-semibold">{item.modelNumber}</div>
                        <div className="small text-body-secondary">{item.name}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        {item.size} / {item.color} / {item.type}
                      </CTableDataCell>
                      <CTableDataCell className="text-end">
                        <CBadge color="warning">{formatNumber(item.stockQuantity)}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="text-end">
                        {formatNumber(item.minStockAlert)}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            ) : (
              <EmptyState title="المخزون جيد" text="لا يوجد نوع أقل من حد التنبيه المحدد." />
            )}
          </SectionCard>
        </CCol>

        <CCol xl={6}>
          <SectionCard title="أعلى المنتجات ربحا">
            {profit?.topProducts?.length ? (
              <CTable align="middle" responsive hover className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>المنتج</CTableHeaderCell>
                    <CTableHeaderCell>التصنيف</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">الكمية</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">الربح</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {profit.topProducts.map((item) => (
                    <CTableRow key={item.modelNumber}>
                      <CTableDataCell>
                        <div className="fw-semibold">{item.modelNumber}</div>
                        <div className="small text-body-secondary">{item.name}</div>
                      </CTableDataCell>
                      <CTableDataCell>{item.category}</CTableDataCell>
                      <CTableDataCell className="text-end">
                        {formatNumber(item.quantity)}
                      </CTableDataCell>
                      <CTableDataCell className="text-end">
                        {formatMoney(item.profit)}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            ) : (
              <EmptyState
                title="لا توجد بيانات أرباح"
                text="المبيعات داخل الفترة المحددة ستظهر هنا."
              />
            )}
          </SectionCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol xl={6}>
          <SectionCard title="ديون الموردين">
            {supplierDebts?.suppliers?.length ? (
              <CTable align="middle" responsive hover className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>المورد</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">المديونية</CTableHeaderCell>
                    <CTableHeaderCell>أقدم فاتورة مفتوحة</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {supplierDebts.suppliers.map((supplier) => {
                    const invoice = supplier.purchaseInvoices?.[0]

                    return (
                      <CTableRow key={supplier.id}>
                        <CTableDataCell className="fw-semibold">{supplier.name}</CTableDataCell>
                        <CTableDataCell className="text-end">
                          {formatMoney(supplier.totalDebt)}
                        </CTableDataCell>
                        <CTableDataCell>
                          {invoice ? (
                            <span
                              className="shop-invoice-link"
                              role="button"
                              tabIndex={0}
                              onClick={() => openInvoice('purchases', invoice.id)}
                              onKeyDown={(event) =>
                                handleInvoiceKeyDown(event, 'purchases', invoice.id)
                              }
                            >
                              {invoice.invoiceNo} ({formatDate(invoice.invoiceDate)})
                            </span>
                          ) : (
                            '-'
                          )}
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            ) : (
              <EmptyState title="لا توجد ديون موردين" />
            )}
          </SectionCard>
        </CCol>

        <CCol xl={6}>
          <SectionCard title="ديون العملاء">
            {customerDebts?.customers?.length ? (
              <CTable align="middle" responsive hover className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>العميل</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">المستحق</CTableHeaderCell>
                    <CTableHeaderCell>أقدم فاتورة مفتوحة</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {customerDebts.customers.map((customer) => {
                    const invoice = customer.salesInvoices?.[0]

                    return (
                      <CTableRow key={customer.id}>
                        <CTableDataCell className="fw-semibold">{customer.name}</CTableDataCell>
                        <CTableDataCell className="text-end">
                          {formatMoney(customer.totalDebt)}
                        </CTableDataCell>
                        <CTableDataCell>
                          {invoice ? (
                            <span
                              className="shop-invoice-link"
                              role="button"
                              tabIndex={0}
                              onClick={() => openInvoice('sales', invoice.id)}
                              onKeyDown={(event) =>
                                handleInvoiceKeyDown(event, 'sales', invoice.id)
                              }
                            >
                              {invoice.invoiceNo} ({formatDate(invoice.invoiceDate)})
                            </span>
                          ) : (
                            '-'
                          )}
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            ) : (
              <EmptyState title="لا توجد ديون عملاء" />
            )}
          </SectionCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Reports

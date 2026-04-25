import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CWidgetStatsA,
} from '@coreui/react'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilReload } from '@coreui/icons'

import { shopApi } from 'src/api/shopApi'
import { ApiAlert, LoadingCard, PageHeader } from 'src/views/shop/components'
import { formatDate, formatMoney, formatNumber, getErrorMessage } from 'src/views/shop/utils'

const cardChartOptions = {
  plugins: {
    legend: {
      display: false,
    },
  },
  maintainAspectRatio: false,
  scales: {
    x: {
      border: {
        display: false,
      },
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      display: false,
      grid: {
        display: false,
      },
      ticks: {
        display: false,
      },
    },
  },
  elements: {
    line: {
      borderWidth: 2,
      tension: 0.4,
    },
    point: {
      radius: 3,
      hitRadius: 10,
      hoverRadius: 4,
    },
  },
}

const normalizeChartValue = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const buildCardSeries = (values, fallback = 0) => {
  const normalized = values.map(normalizeChartValue).filter((value) => value >= 0)
  const series = normalized.length > 0 ? normalized : [normalizeChartValue(fallback)]
  const padded = [...Array(Math.max(0, 7 - series.length)).fill(0), ...series]

  return padded.slice(-7)
}

const buildCardChart = (values) => ({
  labels: values.map((_, index) => `${index + 1}`),
  datasets: [
    {
      backgroundColor: 'transparent',
      borderColor: 'rgba(255, 255, 255, 0.72)',
      pointBackgroundColor: 'rgba(255, 255, 255, 0.9)',
      pointBorderColor: 'rgba(255, 255, 255, 0.9)',
      data: values,
    },
  ],
})

const Dashboard = () => {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [stock, setStock] = useState(null)
  const [profit, setProfit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    setLoading(true)
    setError('')

    try {
      const [dashboardData, stockData, profitData] = await Promise.all([
        shopApi.dashboard(),
        shopApi.stockReport(),
        shopApi.profitReport(),
      ])

      setDashboard(dashboardData)
      setStock(stockData)
      setProfit(profitData)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadDashboard, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const cards = dashboard?.cards || {}
  const recentSales = dashboard?.recentActivity?.sales || []
  const recentPurchases = dashboard?.recentActivity?.purchases || []
  const stockProducts = stock?.products || []
  const profitInvoices = profit?.invoices || []
  const recentSalesTrend = buildCardSeries(
    recentSales
      .slice()
      .reverse()
      .map((sale) => sale.totalAmount),
    cards.todaySales?.amount,
  )
  const monthlySalesTrend = buildCardSeries(
    profitInvoices
      .slice()
      .sort((a, b) => new Date(a.invoiceDate) - new Date(b.invoiceDate))
      .slice(-7)
      .map((invoice) => invoice.revenue),
    cards.monthSales?.amount,
  )
  const stockTrend = buildCardSeries(
    stockProducts.slice(0, 7).map((product) => product.totalStock),
    cards.totalProducts,
  )
  const lowStockTrend = buildCardSeries(
    stockProducts
      .map((product) => (product.variants || []).filter((variant) => variant.isLowStock).length)
      .filter((count) => count > 0),
    cards.lowStockCount,
  )

  const categoryChart = useMemo(() => {
    const rows = profit?.byCategory || []

    return {
      labels: rows.map((row) => row.category),
      datasets: [
        {
          label: 'الإيراد',
          backgroundColor: '#3399ff',
          data: rows.map((row) => Number(row.revenue || 0)),
        },
        {
          label: 'الربح',
          backgroundColor: '#2eb85c',
          data: rows.map((row) => Number(row.profit || 0)),
        },
      ],
    }
  }, [profit])

  const stockSummary = stock?.summary || {}
  const stockValue = Number(stockSummary.totalSellingValue || 0)
  const costValue = Number(stockSummary.totalPurchaseValue || 0)
  const margin = stockValue > 0 ? Math.round(((stockValue - costValue) / stockValue) * 100) : 0

  const openInvoice = (type, invoiceId) => {
    navigate(`/${type}/${invoiceId}`)
  }

  const handleInvoiceKeyDown = (event, type, invoiceId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openInvoice(type, invoiceId)
    }
  }

  if (loading && !dashboard) {
    return <LoadingCard label="جاري تحميل لوحة التحكم..." />
  }

  return (
    <>
      <PageHeader
        title="لوحة التحكم"
        subtitle="نظرة مباشرة على المبيعات والمخزون والمديونيات."
        actions={
          <CButton color="primary" variant="outline" onClick={loadDashboard} disabled={loading}>
            <CIcon icon={cilReload} className="me-2" />
            تحديث
          </CButton>
        }
      />

      <ApiAlert error={error} onClose={() => setError('')} />

      <CRow className="mb-4" xs={{ gutter: 4 }}>
        <CCol sm={6} xl={3}>
          <CWidgetStatsA
            color="primary"
            value={formatNumber(cards.totalProducts)}
            title="أنواع المنتجات"
            chart={
              <CChartLine
                className="mt-3 mx-3 widget-dropdown-chart"
                data={buildCardChart(stockTrend)}
                options={cardChartOptions}
              />
            }
          />
        </CCol>
        <CCol sm={6} xl={3}>
          <CWidgetStatsA
            color="success"
            value={formatMoney(cards.todaySales?.amount)}
            title={`${formatNumber(cards.todaySales?.count)} مبيعات اليوم`}
            chart={
              <CChartLine
                className="mt-3 mx-3 widget-dropdown-chart"
                data={buildCardChart(recentSalesTrend)}
                options={cardChartOptions}
              />
            }
          />
        </CCol>
        <CCol sm={6} xl={3}>
          <CWidgetStatsA
            color="info"
            value={formatMoney(cards.monthSales?.amount)}
            title={`${formatNumber(cards.monthSales?.count)} مبيعات الشهر`}
            chart={
              <CChartLine
                className="mt-3 mx-3 widget-dropdown-chart"
                data={buildCardChart(monthlySalesTrend)}
                options={cardChartOptions}
              />
            }
          />
        </CCol>
        <CCol sm={6} xl={3}>
          <CWidgetStatsA
            color={Number(cards.lowStockCount || 0) > 0 ? 'warning' : 'secondary'}
            value={formatNumber(cards.lowStockCount)}
            title="تنبيهات نقص المخزون"
            chart={
              <CChartLine
                className="mt-3 mx-3 widget-dropdown-chart"
                data={buildCardChart(lowStockTrend)}
                options={cardChartOptions}
              />
            }
          />
        </CCol>
      </CRow>

      <CRow>
        <CCol xl={8}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>الربح حسب التصنيف</strong>
              <CBadge color="success">{profit?.summary?.profitMargin || '0%'}</CBadge>
            </CCardHeader>
            <CCardBody>
              <CChartBar
                className="dashboard-profit-chart"
                data={categoryChart}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xl={4}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>قيمة المخزون</strong>
            </CCardHeader>
            <CCardBody>
              <div className="mb-4">
                <div className="text-body-secondary small">قيمة البيع</div>
                <div className="fs-4 fw-semibold">
                  {formatMoney(stockSummary.totalSellingValue)}
                </div>
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between">
                  <span className="text-body-secondary small">هامش الربح المتوقع</span>
                  <strong>{margin}%</strong>
                </div>
                <CProgress className="mt-2" color="success" value={margin} />
              </div>
              <CRow className="g-3">
                <CCol xs={6}>
                  <div className="border-start border-start-4 border-start-info py-1 px-3">
                    <div className="text-body-secondary small">المنتجات</div>
                    <div className="fs-5 fw-semibold">
                      {formatNumber(stockSummary.totalProducts)}
                    </div>
                  </div>
                </CCol>
                <CCol xs={6}>
                  <div className="border-start border-start-4 border-start-warning py-1 px-3">
                    <div className="text-body-secondary small">القطع</div>
                    <div className="fs-5 fw-semibold">{formatNumber(stockSummary.totalItems)}</div>
                  </div>
                </CCol>
                <CCol xs={6}>
                  <div className="border-start border-start-4 border-start-danger py-1 px-3">
                    <div className="text-body-secondary small">ديون الموردين</div>
                    <div className="fw-semibold">{formatMoney(cards.supplierDebt)}</div>
                  </div>
                </CCol>
                <CCol xs={6}>
                  <div className="border-start border-start-4 border-start-success py-1 px-3">
                    <div className="text-body-secondary small">ديون العملاء</div>
                    <div className="fw-semibold">{formatMoney(cards.customerDebt)}</div>
                  </div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol lg={6}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>آخر المبيعات</strong>
            </CCardHeader>
            <CCardBody>
              <CTable align="middle" responsive hover className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>الفاتورة</CTableHeaderCell>
                    <CTableHeaderCell>العميل</CTableHeaderCell>
                    <CTableHeaderCell>التاريخ</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">الإجمالي</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {recentSales.map((sale) => (
                    <CTableRow
                      key={sale.id}
                      className="shop-clickable-row"
                      role="button"
                      tabIndex={0}
                      onClick={() => openInvoice('sales', sale.id)}
                      onKeyDown={(event) => handleInvoiceKeyDown(event, 'sales', sale.id)}
                    >
                      <CTableDataCell className="fw-semibold">{sale.invoiceNo}</CTableDataCell>
                      <CTableDataCell>{sale.customer?.name || 'عميل نقدي'}</CTableDataCell>
                      <CTableDataCell>{formatDate(sale.invoiceDate)}</CTableDataCell>
                      <CTableDataCell className="text-end">
                        {formatMoney(sale.totalAmount)}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={6}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>آخر المشتريات</strong>
            </CCardHeader>
            <CCardBody>
              <CTable align="middle" responsive hover className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>الفاتورة</CTableHeaderCell>
                    <CTableHeaderCell>المورد</CTableHeaderCell>
                    <CTableHeaderCell>التاريخ</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">الإجمالي</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {recentPurchases.map((purchase) => (
                    <CTableRow
                      key={purchase.id}
                      className="shop-clickable-row"
                      role="button"
                      tabIndex={0}
                      onClick={() => openInvoice('purchases', purchase.id)}
                      onKeyDown={(event) => handleInvoiceKeyDown(event, 'purchases', purchase.id)}
                    >
                      <CTableDataCell className="fw-semibold">{purchase.invoiceNo}</CTableDataCell>
                      <CTableDataCell>{purchase.supplier?.name || 'مورد نقدي'}</CTableDataCell>
                      <CTableDataCell>{formatDate(purchase.invoiceDate)}</CTableDataCell>
                      <CTableDataCell className="text-end">
                        {formatMoney(purchase.totalAmount)}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard

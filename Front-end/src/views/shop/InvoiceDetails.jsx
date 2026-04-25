import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  CBadge,
  CButton,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowRight, cilPrint } from '@coreui/icons'

import { shopApi } from 'src/api/shopApi'
import {
  ApiAlert,
  EmptyState,
  LoadingCard,
  PageHeader,
  SectionCard,
} from 'src/views/shop/components'
import { formatDate, formatMoney, formatNumber, getErrorMessage } from 'src/views/shop/utils'

const paymentLabels = {
  CASH: 'نقدي',
  CREDIT: 'آجل',
}

const InvoiceDetails = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isSale = location.pathname.startsWith('/sales/')
  const [invoice, setInvoice] = useState(null)
  const [printData, setPrintData] = useState(null)
  const [printing, setPrinting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadInvoice = async () => {
      setLoading(true)
      setError('')

      try {
        const data = isSale ? await shopApi.sale(id) : await shopApi.purchase(id)
        setInvoice(data)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    loadInvoice()
  }, [id, isSale])

  const items = invoice?.items || []
  const payments = invoice?.payments || []
  const subtotal = items.reduce((sum, item) => sum + Number(item.total || 0), 0)
  const discount = Number(invoice?.discount || 0)
  const remaining = Number(invoice?.remaining || 0)
  const partyName = isSale
    ? invoice?.customer?.name || 'عميل نقدي'
    : invoice?.supplier?.name || 'مورد نقدي'
  const title = isSale ? 'تفاصيل فاتورة بيع' : 'تفاصيل فاتورة شراء'
  const listPath = isSale ? '/sales' : '/purchases'

  const printInvoice = async () => {
    setPrinting(true)
    setError('')

    try {
      const data = isSale
        ? await shopApi.saleInvoicePrint(id)
        : await shopApi.purchaseInvoicePrint(id)
      setPrintData(data)
      window.setTimeout(() => window.print(), 150)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setPrinting(false)
    }
  }

  if (loading && !invoice) {
    return <LoadingCard label="جاري تحميل تفاصيل الفاتورة..." />
  }

  return (
    <>
      <PageHeader
        title={invoice ? `${title} ${invoice.invoiceNo}` : title}
        subtitle={invoice ? `${partyName} - ${formatDate(invoice.invoiceDate)}` : ''}
        actions={
          <div className="d-flex flex-wrap gap-2">
            <CButton
              color="primary"
              variant="outline"
              onClick={printInvoice}
              disabled={!invoice || printing}
            >
              <CIcon icon={cilPrint} className="me-2" />
              طباعة
            </CButton>
            <CButton color="secondary" variant="outline" onClick={() => navigate(listPath)}>
              <CIcon icon={cilArrowRight} className="me-2" />
              رجوع
            </CButton>
          </div>
        }
      />

      <ApiAlert error={error} onClose={() => setError('')} />

      {!invoice ? (
        <EmptyState title="الفاتورة غير موجودة" text="تأكد من رقم الفاتورة ثم حاول مرة أخرى." />
      ) : (
        <>
          <div className="shop-invoice-summary mb-4">
            <SectionCard className="h-100">
              <div className="text-body-secondary small">رقم الفاتورة</div>
              <div className="fs-4 fw-semibold">{invoice.invoiceNo}</div>
            </SectionCard>
            <SectionCard className="h-100">
              <div className="text-body-secondary small">{isSale ? 'العميل' : 'المورد'}</div>
              <div className="fs-5 fw-semibold">{partyName}</div>
            </SectionCard>
            <SectionCard className="h-100">
              <div className="text-body-secondary small">الإجمالي</div>
              <div className="fs-5 fw-semibold">{formatMoney(invoice.totalAmount)}</div>
            </SectionCard>
            <SectionCard className="h-100">
              <div className="text-body-secondary small">الحالة</div>
              <CBadge color={remaining > 0 ? 'warning' : 'success'}>
                {remaining > 0 ? `متبقي ${formatMoney(remaining)}` : 'مدفوعة'}
              </CBadge>
            </SectionCard>
          </div>

          <SectionCard title="بيانات الفاتورة">
            <CRow className="g-4">
              <CCol md={3}>
                <div className="text-body-secondary small">تاريخ الفاتورة</div>
                <div className="fw-semibold">{formatDate(invoice.invoiceDate)}</div>
              </CCol>
              <CCol md={3}>
                <div className="text-body-secondary small">طريقة الدفع</div>
                <div className="fw-semibold">{paymentLabels[invoice.paymentType] || '-'}</div>
              </CCol>
              <CCol md={3}>
                <div className="text-body-secondary small">المدفوع</div>
                <div className="fw-semibold">{formatMoney(invoice.paidAmount)}</div>
              </CCol>
              <CCol md={3}>
                <div className="text-body-secondary small">المتبقي</div>
                <div className="fw-semibold">{formatMoney(invoice.remaining)}</div>
              </CCol>
              {isSale ? (
                <CCol md={3}>
                  <div className="text-body-secondary small">الخصم</div>
                  <div className="fw-semibold">{formatMoney(discount)}</div>
                </CCol>
              ) : null}
              <CCol md={isSale ? 9 : 12}>
                <div className="text-body-secondary small">ملاحظات</div>
                <div className="fw-semibold">{invoice.notes || '-'}</div>
              </CCol>
            </CRow>
          </SectionCard>

          <SectionCard title="بنود الفاتورة">
            {items.length === 0 ? (
              <EmptyState title="لا توجد بنود" />
            ) : (
              <CTable align="middle" responsive hover className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>المنتج</CTableHeaderCell>
                    <CTableHeaderCell>النوع</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">الكمية</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">سعر الوحدة</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">الإجمالي</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {items.map((item) => {
                    const variant = item.variant || {}
                    const product = variant.product || {}

                    return (
                      <CTableRow key={item.id}>
                        <CTableDataCell>
                          <div className="fw-semibold">{product.modelNumber || '-'}</div>
                          <div className="small text-body-secondary">{product.name || '-'}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          {variant.size || '-'} / {variant.color || '-'} / {variant.type || '-'}
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          {formatNumber(item.quantity)}
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          {formatMoney(item.unitPrice)}
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          {formatMoney(item.total)}
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            )}

            <div className="shop-invoice-totals">
              <div>
                <span>مجموع البنود</span>
                <strong>{formatMoney(subtotal)}</strong>
              </div>
              {isSale ? (
                <div>
                  <span>الخصم</span>
                  <strong>{formatMoney(discount)}</strong>
                </div>
              ) : null}
              <div>
                <span>إجمالي الفاتورة</span>
                <strong>{formatMoney(invoice.totalAmount)}</strong>
              </div>
            </div>
          </SectionCard>

          <SectionCard title={isSale ? 'تحصيلات الفاتورة' : 'مدفوعات الفاتورة'}>
            {payments.length === 0 ? (
              <EmptyState title="لا توجد مدفوعات مسجلة" />
            ) : (
              <CTable align="middle" responsive hover className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>التاريخ</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">المبلغ</CTableHeaderCell>
                    <CTableHeaderCell>ملاحظات</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {payments.map((payment) => (
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
            )}
          </SectionCard>
        </>
      )}

      {printData ? (
        <div className="shop-print-area">
          <div className="text-center border-bottom pb-3 mb-3">
            <h1>{printData.shopName}</h1>
            <div>{isSale ? 'فاتورة بيع' : 'فاتورة شراء'}</div>
          </div>

          <div className="shop-print-meta">
            <div>
              <strong>رقم الفاتورة:</strong> {printData.invoiceNo}
            </div>
            <div>
              <strong>التاريخ:</strong> {formatDate(printData.date)}
            </div>
            <div>
              <strong>{isSale ? 'العميل' : 'المورد'}:</strong>{' '}
              {isSale ? printData.customer : printData.supplier}
            </div>
            {printData.phone ? (
              <div>
                <strong>الهاتف:</strong> {printData.phone}
              </div>
            ) : null}
          </div>

          <table className="shop-print-table">
            <thead>
              <tr>
                <th>الصنف</th>
                <th>الموديل</th>
                <th>المقاس</th>
                <th>اللون</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {(printData.items || []).map((item, index) => (
                <tr key={`${item.model}-${index}`}>
                  <td>{item.name}</td>
                  <td>{item.model}</td>
                  <td>{item.size}</td>
                  <td>{item.color}</td>
                  <td>{formatNumber(item.quantity)}</td>
                  <td>{formatMoney(item.unitPrice)}</td>
                  <td>{formatMoney(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="shop-print-total">
            {isSale && Number(printData.discount || 0) > 0 ? (
              <>
                <div>
                  <span>المجموع</span>
                  <strong>{formatMoney(printData.subtotal)}</strong>
                </div>
                <div>
                  <span>الخصم</span>
                  <strong>{formatMoney(printData.discount)}</strong>
                </div>
              </>
            ) : null}
            <div>
              <span>الإجمالي</span>
              <strong>{formatMoney(printData.total)}</strong>
            </div>
            <div>
              <span>المدفوع</span>
              <strong>{formatMoney(printData.paid)}</strong>
            </div>
            <div>
              <span>المتبقي</span>
              <strong>{formatMoney(printData.remaining)}</strong>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default InvoiceDetails

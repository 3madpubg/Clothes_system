// src/components/InvoicePrint/SaleInvoicePrint.jsx
import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useReactToPrint } from 'react-to-print'
import { Printer } from 'lucide-react'
import { invoicesApi } from '../../api'

const fmt = (n) => Number(n || 0).toLocaleString('ar-EG')

export default function SaleInvoicePrint({ invoiceId, onClose }) {
  const printRef = useRef()

  const { data, isLoading } = useQuery({
    queryKey: ['print-sale', invoiceId],
    queryFn: () => invoicesApi.getSalePrint(invoiceId),
  })

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `فاتورة-${data?.data?.invoiceNo}`,
  })

  const d = data?.data

  if (isLoading) return <div className="text-center py-8 text-gray-400">جار التحميل...</div>

  return (
    <div className="space-y-4">
      {/* زرار الطباعة */}
      <div className="flex justify-end gap-2 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-primary-500 text-dark-900 px-4 py-2 rounded-lg text-sm font-semibold"
        >
          <Printer size={16} />
          طباعة
        </button>
      </div>

      {/* محتوى الفاتورة */}
      <div
        ref={printRef}
        className="bg-white text-black p-6 rounded-lg"
        style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}
      >
        {/* Header */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
          <h1 className="text-2xl font-bold">{d?.shopName}</h1>
          <p className="text-sm text-gray-600">فاتورة مبيعات</p>
        </div>

        {/* Invoice Info */}
        <div className="flex justify-between mb-4 text-sm">
          <div>
            <p>
              <strong>رقم الفاتورة:</strong> {d?.invoiceNo}
            </p>
            <p>
              <strong>التاريخ:</strong> {new Date(d?.date).toLocaleDateString('ar-EG')}
            </p>
          </div>
          <div className="text-left">
            <p>
              <strong>العميل:</strong> {d?.customer}
            </p>
            {d?.phone && (
              <p>
                <strong>التليفون:</strong> {d?.phone}
              </p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-sm border-collapse mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-right">الصنف</th>
              <th className="border border-gray-300 p-2 text-center">مقاس</th>
              <th className="border border-gray-300 p-2 text-center">لون</th>
              <th className="border border-gray-300 p-2 text-center">كمية</th>
              <th className="border border-gray-300 p-2 text-center">سعر</th>
              <th className="border border-gray-300 p-2 text-center">إجمالي</th>
            </tr>
          </thead>
          <tbody>
            {d?.items?.map((item, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 p-2">{item.name}</td>
                <td className="border border-gray-300 p-2 text-center">{item.size}</td>
                <td className="border border-gray-300 p-2 text-center">{item.color}</td>
                <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                <td className="border border-gray-300 p-2 text-center">{fmt(item.unitPrice)} ج</td>
                <td className="border border-gray-300 p-2 text-center">{fmt(item.total)} ج</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 text-sm space-y-1">
            {d?.discount > 0 && (
              <>
                <div className="flex justify-between">
                  <span>المجموع:</span>
                  <span>{fmt(d?.subtotal)} ج</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>خصم:</span>
                  <span>- {fmt(d?.discount)} ج</span>
                </div>
              </>
            )}
            <div className="flex justify-between font-bold text-base border-t border-gray-400 pt-1">
              <span>الإجمالي:</span>
              <span>{fmt(d?.total)} ج</span>
            </div>
            <div className="flex justify-between text-green-700">
              <span>المدفوع:</span>
              <span>{fmt(d?.paid)} ج</span>
            </div>
            {d?.remaining > 0 && (
              <div className="flex justify-between text-red-600 font-semibold">
                <span>المتبقي:</span>
                <span>{fmt(d?.remaining)} ج</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 mt-6 pt-3 text-center text-xs text-gray-500">
          <p>شكراً لتعاملكم معنا</p>
        </div>
      </div>
    </div>
  )
}

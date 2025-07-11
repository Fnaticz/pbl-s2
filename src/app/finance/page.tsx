'use client'

import { useEffect, useState } from 'react'

type FinanceReport = {
  _id: string;
  description: string;
  amount: number;
  date: string;
};

export default function FinanceReportPage() {
  const [financeReports, setFinanceReports] = useState<FinanceReport[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchFinanceReports = async () => {
      try {
        const res = await fetch('/api/finance')
        const data: FinanceReport[] = await res.json()
        setFinanceReports(data)
        const totalAmount = data.reduce((sum, item) => sum + item.amount, 0)
        setTotal(totalAmount)
      } catch (error) {
        console.error('Failed to fetch finance reports:', error)
      }
    }

    fetchFinanceReports()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black via-red-950 to-black text-white px-4 py-10">
      <main className="flex-grow pt-20 px-4 pb-16">
        <h1 className="text-3xl font-bold mb-6 text-center">Community Finance Report</h1>
        {financeReports.length === 0 ? (
          <p className="text-center text-gray-400">No finance data available yet.</p>
        ) : (
          <>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-left">
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-3">Amount</th>
                  <th className="py-2 px-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {financeReports.map((f) => (
                  <tr key={f._id} className="border-b border-gray-800">
                    <td className="py-2 px-3">{f.description}</td>
                    <td className="py-2 px-3">Rp{f.amount.toLocaleString()}</td>
                    <td className="py-2 px-3 text-sm text-gray-400">
                      {new Date(f.date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right text-lg font-semibold text-green-400 mt-4">
              Total: Rp{total.toLocaleString()}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

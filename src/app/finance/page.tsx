'use client'

import { useEffect, useState } from 'react'

export default function FinanceReportPage() {
    const [financeReports, setFinanceReports] = useState<{ description: string; amount: number; date: string }[]>([])
    const [total, setTotal] = useState(0)

    useEffect(() => {
        const data = localStorage.getItem('financeReports')
        if (data) {
            const parsed = JSON.parse(data)
            setFinanceReports(parsed)
            const sum = parsed.reduce((acc: number, cur: any) => acc + cur.amount, 0)
            setTotal(sum)
        }
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
                                {financeReports.map((f, i) => (
                                    <tr key={i} className="border-b border-gray-800">
                                        <td className="py-2 px-3">{f.description}</td>
                                        <td className="py-2 px-3">Rp{f.amount.toLocaleString()}</td>
                                        <td className="py-2 px-3 text-sm text-gray-400">{f.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="text-right text-lg font-semibold text-green-400">
                            Total: Rp{total.toLocaleString()}
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}

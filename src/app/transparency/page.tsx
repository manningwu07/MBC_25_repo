// app/transparency/page.tsx
'use client';

import { MainNav } from "~/components/layout/main-nav";
import { Download, ExternalLink } from "lucide-react";

export default function Transparency() {
  const outflows = [
    { id: 1, to: "Medical Supplies Co.", cause: "Gaza Relief", amount: "5,400 USDC", date: "2025-11-20", tx: "3x9...2a1" },
    { id: 2, to: "Local Logistics LLC", cause: "Ukraine Fund", amount: "12,200 USDC", date: "2025-11-19", tx: "8z2...9cc" },
    { id: 3, to: "Water Filters Inc", cause: "Clean Water", amount: "2,100 USDC", date: "2025-11-18", tx: "1p0...5mm" },
  ];

  return (
    <div className="min-h-screen bg-[#020410] text-white">
      <MainNav />
      <div className="max-w-6xl mx-auto py-12 px-6">
        <div className="flex justify-between items-end mb-8">
            <div>
                <h1 className="text-3xl font-bold">Transparency Reports</h1>
                <p className="text-gray-400 mt-2">Public ledger of all fund outflows from NGO sub-wallets.</p>
            </div>
            <button className="flex items-center gap-2 text-sm text-[#14F195] hover:underline">
                <Download size={16} /> Export CSV
            </button>
        </div>

        <div className="bg-[#11131F] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                    <tr>
                        <th className="p-4">Recipient</th>
                        <th className="p-4">Source Fund</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Date</th>
                        <th className="p-4 text-right">Verification</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {outflows.map((row) => (
                        <tr key={row.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-medium">{row.to}</td>
                            <td className="p-4 text-gray-400">{row.cause}</td>
                            <td className="p-4 font-mono text-[#14F195]">{row.amount}</td>
                            <td className="p-4 text-gray-500 text-sm">{row.date}</td>
                            <td className="p-4 text-right">
                                <a href="#" className="inline-flex items-center gap-1 text-xs text-[#9945FF] hover:text-white">
                                    {row.tx} <ExternalLink size={10} />
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
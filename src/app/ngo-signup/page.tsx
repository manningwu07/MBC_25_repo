// app/ngo-signup/page.tsx
'use client';

import { MainNav } from "~/components/layout/main-nav";
import { Button } from "~/components/ui/button";
import { Upload, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function NgoSignup() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#020410] text-white">
      <MainNav />
      <div className="max-w-2xl mx-auto py-16 px-6">
        
        <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold mb-2">NGO Partner Registration</h1>
            <p className="text-gray-400">Join the decentralized aid network. Verify your organization to create specialized funding wallets.</p>
        </div>

        {submitted ? (
             <div className="bg-[#14F195]/10 border border-[#14F195]/30 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
                <CheckCircle2 className="w-16 h-16 text-[#14F195] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Application Received</h2>
                <p className="text-gray-300">Our compliance team is reviewing your documentation. You will receive an NFT access key upon approval.</p>
                <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-6 border-white/20 text-white">Submit Another</Button>
             </div>
        ) : (
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Organization Name</label>
                        <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#9945FF] outline-none transition-colors" placeholder="e.g. Red Cross" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Registration Number</label>
                        <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#9945FF] outline-none transition-colors" placeholder="Tax ID / Gov Reg" required />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Official Solana Wallet Address</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white font-mono text-sm focus:border-[#9945FF] outline-none transition-colors" placeholder="Main organization wallet..." required />
                    <p className="text-xs text-gray-500">This will be the master controller for your sub-wallets.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Verification Documents</label>
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer group">
                        <Upload className="w-8 h-8 text-gray-500 group-hover:text-[#9945FF] mx-auto mb-2 transition-colors" />
                        <p className="text-sm text-gray-400">Drag & drop 501(c)(3) or equivalent papers</p>
                    </div>
                </div>

                <Button className="w-full py-6 text-lg bg-gradient-to-r from-[#9945FF] to-[#14F195] text-black font-bold hover:opacity-90 border-none">
                    Submit for Verification
                </Button>
            </form>
        )}
      </div>
    </div>
  );
}
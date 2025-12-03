'use client';

import { MainNav } from '~/components/layout/main-nav';
import { Button } from '~/components/ui/button';
import {
  Upload,
  CheckCircle2,
  FileText,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function NgoSignup() {
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleDivClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-[#020410] text-white">
      <MainNav />

      <motion.div
        className="max-w-3xl mx-auto py-16 px-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {!submitted ? (
          <>
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-bold mb-2">
                NGO Registry & Smart Contract Setup
              </h1>
              <p className="text-gray-400 max-w-lg mx-auto">
                We use Solana Smart Contracts to whitelist NGOs. Once verified,
                your organization address is added to the
                <span className="text-[#14F195]">
                  {' '}
                  global aid registry
                </span>{' '}
                allowing you to pull authorized funds.
              </p>
            </div>

            <motion.form
              className="space-y-6 bg-[#11131F] p-8 rounded-2xl border border-white/5"
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#14F195] outline-none"
                    placeholder="e.g. Red Cross"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Tax ID / Registration
                  </label>
                  <input
                    type="text"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#14F195] outline-none"
                    placeholder="Gov Reg #"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Solana Master Wallet
                </label>
                <input
                  type="text"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white font-mono text-sm focus:border-[#14F195] outline-none"
                  placeholder="Wallet that will sign withdrawal txs..."
                  required
                />
                <p className="text-xs text-gray-500">
                  This address will be granted WithdrawAuthority in the program.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Verification Documents
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  onClick={handleDivClick}
                  className={`border-2 border-dashed ${
                    fileName
                      ? 'border-[#14F195] bg-[#14F195]/5'
                      : 'border-white/10 hover:bg-white/5'
                  } rounded-xl p-8 text-center transition-colors cursor-pointer group`}
                >
                  {fileName ? (
                    <div className="flex items-center justify-center gap-2 text-[#14F195]">
                      <FileText size={24} />
                      <span className="font-medium">{fileName}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-500 group-hover:text-[#14F195] mx-auto mb-2 transition-colors" />
                      <p className="text-sm text-gray-400">
                        Click to upload 501(c)(3) or legal docs
                      </p>
                    </>
                  )}
                </div>
              </div>

              <Button className="w-full py-6 text-lg bg-linear-to-r from-[#14F195] to-[#9945FF] text-black font-bold hover:opacity-90 border-none">
                Submit Transaction to Registry
              </Button>
            </motion.form>
          </>
        ) : (
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className="bg-[#14F195]/5 border border-[#14F195]/20 rounded-2xl p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-[#14F195] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Application On-Chain
              </h2>
              <p className="text-gray-300 mb-6">
                Your wallet has been proposed to the DAO whitelist.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="bg-black/40 p-4 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Database size={12} /> Registry State
                  </div>
                  <div className="text-[#14F195] font-bold">Pending Review</div>
                </div>
                <div className="bg-black/40 p-4 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <ShieldCheck size={12} /> Withdrawal Limit
                  </div>
                  <div className="text-white font-mono font-bold">0.00 SOL</div>
                </div>
                <div className="bg-black/40 p-4 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <FileText size={12} /> Doc Hash
                  </div>
                  <div className="text-gray-500 font-mono text-xs truncate">
                    0x7f...3a21
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={() => setSubmitted(false)} variant="ghost">
                Return to Form
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
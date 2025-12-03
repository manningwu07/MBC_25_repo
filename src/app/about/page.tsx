/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { MainNav } from '~/components/layout/main-nav';
import { Zap, Globe2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="min-h-screen bg-[#020410] text-white selection:bg-[#14F195] selection:text-black">
      <MainNav />

      <motion.section
        className="relative py-20 px-6 border-b border-white/5 overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#9945FF]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Aid at the Speed of
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14F195] to-[#9945FF]">
              Solana.
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Solana-Aid eliminates the opacity and slowness of traditional
            charity. We route funds from donors to verified ground teams in
            seconds using USDC on Solana.
          </p>
        </div>
      </motion.section>

      <motion.section
        className="max-w-6xl mx-auto py-16 px-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <h2 className="text-3xl font-bold">The Problem</h2>
            <p className="text-gray-400 leading-relaxed">
              Traditional humanitarian rails are slow and opaque. Bank
              settlements take days, intermediaries add fees, and donors lack
              proof of impact.
            </p>
            <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-xl">
              <p className="text-red-400 font-mono text-sm">
                Error: Transaction delay &gt; 72 hours
              </p>
              <p className="text-red-400 font-mono text-sm">
                Error: Intermediary fees &gt; 15%
              </p>
            </div>
          </motion.div>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <h2 className="text-3xl font-bold">Our Solution</h2>
            <p className="text-gray-400 leading-relaxed">
              We use Polymarket as a data oracle to identify high-need zones,
              Solana to settle payments in sub-seconds, and smart contracts to
              whitelist NGOs and cap withdrawal limits.
            </p>
            <div className="p-6 bg-[#14F195]/5 border border-[#14F195]/20 rounded-xl">
              <p className="text-[#14F195] font-mono text-sm">
                Success: Fund Settlement &lt; 1s
              </p>
              <p className="text-[#14F195] font-mono text-sm">
                Success: 100% On-Chain Traceability
              </p>
            </div>
          </motion.div>
        </div>

        <h3 className="text-2xl font-bold mb-8 text-center">Powered By</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TechCard
            icon={<Zap className="text-[#14F195]" />}
            title="Solana & Circle"
            desc="USDC on Solana ensures funds hold value and move instantly, globally."
            delay={0.02}
          />
          <TechCard
            icon={<Globe2 className="text-blue-400" />}
            title="Polymarket Oracle"
            desc="Prediction market data signals urgency and verifies narratives."
            delay={0.06}
          />
          <TechCard
            icon={<Lock className="text-[#9945FF]" />}
            title="Privy Auth"
            desc="Seamless onboarding via email or wallet with secure custody options."
            delay={0.1}
          />
        </div>
      </motion.section>
    </div>
  );
}

function TechCard({
  icon,
  title,
  desc,
  delay = 0,
}: {
  icon: any;
  title: string;
  desc: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="p-6 bg-[#11131F] border border-white/5 rounded-2xl hover:border-white/10 transition-colors group"
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay }}
    >
      <div className="mb-4 p-3 bg-white/5 w-fit rounded-lg group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="text-lg font-bold mb-2">{title}</h4>
      <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
    </motion.div>
  );
}
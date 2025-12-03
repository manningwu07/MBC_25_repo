// app/about/page.tsx
import { MainNav } from "~/components/layout/main-nav";

export default function About() {
    return (
        <div className="min-h-screen bg-[#020410] text-white">
            <MainNav />
            <div className="max-w-3xl mx-auto py-16 px-6 space-y-8">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#9945FF] to-[#14F195]">
                    About Solana-Aid
                </h1>
                <div className="prose prose-invert prose-lg">
                    <p>
                        Solana-Aid is a decentralized humanitarian platform built for the <strong>MBC-25 Hackathon</strong>. 
                        Our mission is to eliminate the friction, opacity, and slowness of traditional charitable giving during crises.
                    </p>
                    <h3>Why Solana?</h3>
                    <p>
                        Disasters don&apos;t wait for bank settlements. Solana&apos;s sub-second finality and negligible fees allow us 
                        to route funds from donors to ground teams instantly.
                    </p>
                    <h3>The Tech Stack</h3>
                    <ul className="list-disc pl-5 text-gray-300 space-y-2">
                        <li><strong>Solana:</strong> Core settlement layer.</li>
                        <li><strong>Polymarket:</strong> Oracle for identifying active conflict zones and verifying need.</li>
                        <li><strong>Circle (USDC):</strong> Stable store of value for NGOs to hedge against volatility.</li>
                        <li><strong>Privy:</strong> Seamless wallet onboarding.</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
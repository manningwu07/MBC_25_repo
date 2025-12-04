'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { usePrivy, useWallets } from "@privy-io/react-auth";

import { clsx } from "clsx";
import Image from "next/image";

export function MainNav() {
  const pathname = usePathname();
  const { authenticated, logout, login } = usePrivy();
  const { wallets } = useWallets();

  const links = [
    { href: "/", label: "Home" },
    { href: "/causes", label: "Causes" },
    { href: "/ngo-signup", label: "NGO Sign-up" },
    { href: "/transparency", label: "Transparency" },
    { href: "/about", label: "About" },
  ];

  // Detect connected wallet types
  const solanaWallet = wallets.find((w) => (w as { type: string }).type === 'solana');
  const ethWallet = wallets.find((w) => (w as { type: string }).type === 'ethereum');

  console.log("Solana Wallet", solanaWallet);
  console.log("Ethereum Wallet", ethWallet);
  console.log("Wallets", wallets);

  const displayWallet = solanaWallet || ethWallet;

  return (
    <nav className="flex justify-between items-center py-4 px-6 md:px-12 border-b border-white/5 bg-[#020410]/90 backdrop-blur-md sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative w-8 h-8">
            <Image src="/favicon.ico" alt="Logo" fill className="object-contain" />
        </div>
        <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white leading-none">Solana-Aid</span>
            <span className="text-[10px] text-gray-400 tracking-wider">Powered by Circle USDC</span>
        </div>
      </Link>
      
      <div className="hidden md:flex items-center gap-8">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "text-sm font-medium transition-colors hover:text-[#14F195]",
              pathname === link.href ? "text-white" : "text-gray-400"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {authenticated && displayWallet ? (
          <div className="flex items-center gap-3">
             <div className="flex flex-col text-right">
                <span className="text-xs text-white font-bold">
                    {displayWallet.address.slice(0, 4)}..{displayWallet.address.slice(-4)}
                </span>
                <span className="text-[10px] text-gray-400 uppercase">
                    {displayWallet.walletClientType === 'ethereum' ? 'Ethereum (Sepolia)' : 'Solana (Devnet)'}
                </span>
             </div>
            <Button variant="outline" onClick={logout} className="h-9 text-xs border-white/10 hover:bg-white/5">Disconnect</Button>
          </div>
        ) : (
          <Button onClick={login}
              className="bg-white text-black hover:bg-gray-200 font-bold px-6 border-none">
            Connect Wallet
          </Button>
        )}
      </div>
    </nav>
  );
}
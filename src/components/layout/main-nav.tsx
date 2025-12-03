'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { clsx } from "clsx";
import Image from "next/image";

export function MainNav() {
  const pathname = usePathname();
  const { login, authenticated, user, logout } = usePrivy();

  const links = [
    { href: "/", label: "Home" },
    { href: "/causes", label: "Causes" },
    { href: "/ngo-signup", label: "NGO Sign-up" },
    { href: "/transparency", label: "Transparency Reports" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav className="flex justify-between items-center py-4 px-6 md:px-12 border-b border-white/5 bg-[#020410]/90 backdrop-blur-md sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative w-8 h-8">
            <Image src="/favicon.ico" alt="Logo" fill className="object-contain" />
        </div>
        <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white leading-none">Solana-Aid</span>
            <span className="text-[10px] text-gray-400 tracking-wider">Direct, Transparent Humanitarian Giving.</span>
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
        {authenticated ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-mono border border-white/10 px-2 py-1 rounded-md bg-white/5">
              {user?.wallet ? `${user.wallet.address.slice(0, 4)}..${user.wallet.address.slice(-4)}` : 'User'}
            </span>
            <Button variant="outline" onClick={logout} className="h-9 text-xs">Disconnect</Button>
          </div>
        ) : (
          <Button onClick={login} className="bg-[#14F195] text-black hover:bg-[#14F195]/80 font-bold px-6 border-none">
            Connect Wallet
          </Button>
        )}
      </div>
    </nav>
  );
}
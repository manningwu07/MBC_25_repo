'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '~/components/ui/button';
import { clsx } from 'clsx';
import Image from 'next/image';

// Solana
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

// Ethereum
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export function MainNav() {
  const pathname = usePathname();

  // Solana wallet
  const {
    publicKey,
    connected: solConnected,
    disconnect: solDisconnect,
    select,
    wallets,
  } = useWallet();
  const { setVisible } = useWalletModal();

  // Ethereum wallet
  const { address: ethAddress, isConnected: ethConnected } = useAccount();
  const { connect: ethConnect } = useConnect();
  const { disconnect: ethDisconnect } = useDisconnect();

  const handleSolConnect = () => {
    const phantomWallet = wallets.find(
      (w) =>
        w.adapter.name.toLowerCase().includes('phantom') &&
        w.readyState === 'Installed'
    );

    if (phantomWallet) {
      select(phantomWallet.adapter.name);
    } else {
      setVisible(true);
    }
  };

  const links = [
    { href: '/', label: 'Home' },
    { href: '/causes', label: 'Causes' },
    { href: '/ngo-signup', label: 'NGO Sign-up' },
    { href: '/transparency', label: 'Transparency' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-[#020410]/90 px-6 py-4 backdrop-blur-md md:px-12">
      <Link href="/" className="group flex items-center gap-3">
        <div className="relative h-8 w-8">
          <Image
            src="/favicon.ico"
            alt="Logo"
            fill
            sizes="32px"
            className="object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold leading-none tracking-tight text-white">
            Solana-Aid
          </span>
          <span className="text-[10px] tracking-wider text-gray-400">
            Powered by Circle USDC
          </span>
        </div>
      </Link>

      <div className="hidden items-center gap-8 md:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              'text-sm font-medium transition-colors hover:text-[#14F195]',
              pathname === link.href ? 'text-white' : 'text-gray-400'
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {/* SOL Wallet */}
        {solConnected && publicKey ? (
          <div className="flex items-center gap-2 rounded-full border border-[#14F195]/30 bg-[#14F195]/10 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-[#14F195]" />
            <span className="font-mono text-xs text-[#14F195]">
              {publicKey.toBase58().slice(0, 3)}..
              {publicKey.toBase58().slice(-2)}
            </span>
            <button
              onClick={() => solDisconnect()}
              className="ml-1 text-[10px] text-[#14F195]/60 hover:text-[#14F195]"
            >
              ✕
            </button>
          </div>
        ) : (
          <Button
            onClick={handleSolConnect}
            className="border-non text-xs bg-[#14F195] font-bold text-black hover:bg-[#14F195]/90"
          >
            Connect SOL
          </Button>
        )}

        {/* ETH Wallet */}
        {ethConnected && ethAddress ? (
          <div className="flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span className="font-mono text-xs text-purple-400">
              {ethAddress.slice(0, 3)}..{ethAddress.slice(-2)}
            </span>
            <button
              onClick={() => ethDisconnect()}
              className="ml-1 text-[10px] text-purple-400/60 hover:text-purple-400"
            >
              ✕
            </button>
          </div>
        ) : (
          <Button
            onClick={() => ethConnect({ connector: injected() })}
            variant="outline"
            className="border-purple-500/30 text-xs text-purple-400 hover:bg-purple-500/10"
          >
            Connect ETH
          </Button>
        )}
      </div>
    </nav>
  );
}
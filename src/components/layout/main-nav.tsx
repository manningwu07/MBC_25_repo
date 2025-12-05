'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '~/components/ui/button';
import { clsx } from 'clsx';
import Image from 'next/image';
import { useMemo } from 'react';

// Solana
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

// Ethereum
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

interface DisplayWallet {
  address: string;
  chainType: 'solana' | 'ethereum';
}

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

  const displayWallet = useMemo((): DisplayWallet | null => {
    if (solConnected && publicKey) {
      return { address: publicKey.toBase58(), chainType: 'solana' };
    }
    if (ethConnected && ethAddress) {
      return { address: ethAddress, chainType: 'ethereum' };
    }
    return null;
  }, [solConnected, publicKey, ethConnected, ethAddress]);

  const handleSolConnect = () => {
    // Try to find Phantom wallet directly
    const phantomWallet = wallets.find(
      (w) =>
        w.adapter.name.toLowerCase().includes('phantom') &&
        w.readyState === 'Installed'
    );

    if (phantomWallet) {
      select(phantomWallet.adapter.name);
    } else {
      // Fallback to modal
      setVisible(true);
    }
  };

  const handleDisconnect = () => {
    if (solConnected) solDisconnect();
    if (ethConnected) ethDisconnect();
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

      <div className="flex items-center gap-3">
        {/* Connection Status Indicators */}
        <div className="hidden items-center gap-2 md:flex">
          {solConnected && (
            <div className="flex items-center gap-1.5 rounded-full bg-[#14F195]/10 px-2 py-1">
              <span className="h-2 w-2 rounded-full bg-[#14F195]" />
              <span className="text-[10px] font-bold text-[#14F195]">SOL</span>
            </div>
          )}
          {ethConnected && (
            <div className="flex items-center gap-1.5 rounded-full bg-purple-500/10 px-2 py-1">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              <span className="text-[10px] font-bold text-purple-400">ETH</span>
            </div>
          )}
        </div>

        {displayWallet ? (
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-white">
                {displayWallet.address.slice(0, 4)}..
                {displayWallet.address.slice(-4)}
              </span>
              <span className="text-[10px] uppercase text-gray-400">
                {displayWallet.chainType === 'ethereum' ? 'Sepolia' : 'Devnet'}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="h-9 border-white/10 text-xs hover:bg-white/5"
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleSolConnect}
              className="border-none bg-[#14F195] font-bold text-black hover:bg-[#14F195]/90"
            >
              Connect SOL
            </Button>
            <Button
              onClick={() => ethConnect({ connector: injected() })}
              variant="outline"
              className="border-white/10 text-xs hover:bg-white/5"
            >
              Connect ETH
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
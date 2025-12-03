import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "~/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Solana-Aid | Direct Humanitarian Giving",
  description: "Decentralized emergency aid distribution on Solana",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#050505] text-white selection:bg-brand-green/30`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
// src/lib/circle.ts
import { PublicKey } from "@solana/web3.js";

// Official Circle USDC Devnet Addresses
export const USDC_DEVNET_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
export const USDC_SEPOLIA_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

// Circle CCTP (Cross-Chain Transfer Protocol) Mock Config
export const CCTP_DOMAINS = {
  ETHEREUM: 0,
  SOLANA: 5,
};

/**
 * MOCK: Simulates a fetch to Circle's pricing API or CCTP bridge
 */
export async function getUSDCConversionRate(fromToken: 'SOL' | 'ETH'): Promise<number> {
    // Hardcoded mock rates for the hackathon demo
    if (fromToken === 'SOL') return 145.50; // 1 SOL = 145.50 USDC
    if (fromToken === 'ETH') return 2200.00; // 1 ETH = 2200.00 USDC
    return 1;
}

/**
 * SIMULATION: Generates a CCTP attestation signature (mock)
 */
export async function fetchCircleAttestation(txHash: string) {
    await new Promise(r => setTimeout(r, 2000)); // Fake delay
    return {
        attestation: "0x" + Array(128).fill("a").join(""),
        status: "complete"
    }
}
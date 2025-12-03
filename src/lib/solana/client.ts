import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com"; // Default to Mainnet for Jupiter
export const FUND_SEED =
  process.env.NEXT_PUBLIC_FUND_SEED || "solana-direct-fund";
export const FUND_BASE = process.env.NEXT_PUBLIC_FUND_BASE as string; 
export const FUND_ADDRESS = process.env.NEXT_PUBLIC_FUND_ADDRESS as string | undefined;

// Constants for Jupiter/USDC
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"); // Mainnet USDC
const SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

export const connection = new Connection(RPC_URL, "confirmed");

export async function ensureFundAddress(): Promise<string> {
  if (FUND_ADDRESS && FUND_ADDRESS.length > 0) return FUND_ADDRESS;
  if (!FUND_BASE) throw new Error("NEXT_PUBLIC_FUND_BASE missing");
  const base = new PublicKey(FUND_BASE);
  const addr = await PublicKey.createWithSeed(
    base,
    FUND_SEED,
    SystemProgram.programId
  );
  return addr.toBase58();
}

export async function getPoolSol(): Promise<number> {
  const addr = new PublicKey(await ensureFundAddress());
  const bal = await connection.getBalance(addr);
  return bal / LAMPORTS_PER_SOL;
}

// --- Standard SOL Donation (Devnet Friendly) ---
export async function buildDonateTx(donor: PublicKey, amountSol: number) {
  const to = new PublicKey(await ensureFundAddress());
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: donor,
      toPubkey: to,
      lamports: Math.round(amountSol * LAMPORTS_PER_SOL),
    })
  );
  return tx;
}

// --- Jupiter / Circle USDC Swap (Mainnet Only) ---

// Helper to find ATA
function getAssociatedTokenAddressSync(mint: PublicKey, owner: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];
}

export async function buildSwapAndDonateTx(donor: PublicKey, amountSol: number) {
  // 1. Check Network: Jupiter only works on Mainnet
  const genesis = await connection.getGenesisHash();
  const IS_MAINNET = genesis === '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d';
  
  if (!IS_MAINNET) {
    console.warn("Jupiter Swap is Mainnet only. Falling back to standard SOL transfer.");
    return buildDonateTx(donor, amountSol);
  }

  const fundAddress = new PublicKey(await ensureFundAddress());
  const fundUsdcAta = getAssociatedTokenAddressSync(USDC_MINT, fundAddress);

  const amountLamports = Math.round(amountSol * LAMPORTS_PER_SOL);

  // 2. Get Quote from Jupiter (SOL -> USDC)
  const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${SOL_MINT.toBase58()}&outputMint=${USDC_MINT.toBase58()}&amount=${amountLamports}&slippageBps=50`;
  const quoteResponse = await fetch(quoteUrl).then(r => r.json());

  if (!quoteResponse || quoteResponse.error) {
    throw new Error("Failed to get swap quote: " + (quoteResponse?.error || "Unknown error"));
  }

  // 3. Get Swap Transaction
  // We set destinationTokenAccount to the Fund's USDC address. 
  // NOTE: This assumes the Fund's USDC account is already initialized.
  const swapResponse = await fetch('https://quote-api.jup.ag/v6/swap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quoteResponse,
      userPublicKey: donor.toBase58(),
      destinationTokenAccount: fundUsdcAta.toBase58(),
    }),
  }).then(r => r.json());

  if (!swapResponse.swapTransaction) {
    throw new Error("Failed to generate swap transaction");
  }

  // 4. Deserialize Versioned Transaction
  const swapTransactionBuf = Buffer.from(swapResponse.swapTransaction, 'base64');
  const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

  return transaction;
}
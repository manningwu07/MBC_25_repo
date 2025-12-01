import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";
export const FUND_SEED =
  process.env.NEXT_PUBLIC_FUND_SEED || "solana-direct-fund";
export const FUND_BASE = process.env.NEXT_PUBLIC_FUND_BASE as string; // base pubkey
export const FUND_ADDRESS = process.env.NEXT_PUBLIC_FUND_ADDRESS as string | undefined;

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
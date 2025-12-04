// src/lib/solana/client.ts
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { 
    createTransferInstruction, 
    getAssociatedTokenAddress, 
    createAssociatedTokenAccountInstruction 
} from "@solana/spl-token";
import { USDC_DEVNET_MINT } from "../circle";

export const connection = new Connection(
  process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com",
  "confirmed"
);

// 1. Direct SOL Transfer
export async function buildDirectSolTransfer(from: PublicKey, amount: number, to: PublicKey) {
    const tx = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from,
            toPubkey: to,
            lamports: amount * LAMPORTS_PER_SOL
        })
    );
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = from;
    return tx;
}

// 2. USDC SPL Transfer
export async function buildUSDCTransferTx(from: PublicKey, amountUSDC: number, to: PublicKey) {
    // 1. Get ATAs (Associated Token Accounts)
    const fromAta = await getAssociatedTokenAddress(USDC_DEVNET_MINT, from);
    const toAta = await getAssociatedTokenAddress(USDC_DEVNET_MINT, to);

    const tx = new Transaction();

    // 2. Check if receiver has ATA, if not, create it (Payer = Sender for this demo)
    const toAccountInfo = await connection.getAccountInfo(toAta);
    if (!toAccountInfo) {
        tx.add(
            createAssociatedTokenAccountInstruction(
                from, // payer
                toAta, // associatedToken
                to, // owner
                USDC_DEVNET_MINT // mint
            )
        );
    }

    // 3. Add Transfer Instruction (USDC has 6 decimals)
    tx.add(
        createTransferInstruction(
            fromAta,
            toAta,
            from,
            Math.floor(amountUSDC * 1_000_000)
        )
    );

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = from;
    
    return tx;
}
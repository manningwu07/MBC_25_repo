/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  Keypair,
} from "@solana/web3.js";
import fs from "fs";

const RPC = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";
const BASE_WALLET_PATH =
  process.env.SOLANA_BASE_WALLET ||
  `${process.env.HOME}/.config/solana/id.json`;
const SEED = process.env.NEXT_PUBLIC_FUND_SEED || "solana-direct-fund";
const DEST = process.env.DEST || ""; // base58

(async () => {
  if (!DEST) throw new Error("Set DEST=recipientPubkey");
  const connection = new Connection(RPC, "confirmed");
  const base = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(BASE_WALLET_PATH, "utf8")))
  );
  const fund = await PublicKey.createWithSeed(
    base.publicKey,
    SEED,
    SystemProgram.programId
  );

  const lamports = Number(process.env.AMOUNT_SOL || "0.1") * LAMPORTS_PER_SOL;

  const ix = SystemProgram.transfer({
    // Note: transferWithSeed requires this overload
    fromPubkey: fund,
    toPubkey: new PublicKey(DEST),
    lamports,
  } as any);

  // Patch: convert to transferWithSeed
  ix.programId = SystemProgram.programId;
  // overwrite keys & data:
  // simpler: use SystemProgram.transferWithSeed helper if available in your web3.js version:
  // const ix = SystemProgram.transferWithSeed({ fromPubkey: fund, basePubkey: base.publicKey, seed: SEED, programId: SystemProgram.programId, toPubkey: new PublicKey(DEST), lamports });

  const tx = new Transaction().add(
    SystemProgram.transferWithSeed({
      fromPubkey: fund,
      basePubkey: base.publicKey,
      seed: SEED,
      programId: SystemProgram.programId,
      toPubkey: new PublicKey(DEST),
      lamports,
    })
  );

  const sig = await sendAndConfirmTransaction(connection, tx, [base], {
    commitment: "confirmed",
  });
  console.log("Withdraw sig:", sig);
})();
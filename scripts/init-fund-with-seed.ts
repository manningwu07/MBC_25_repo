import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import fs from "fs";

const RPC = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";
const BASE_WALLET_PATH =
  process.env.SOLANA_BASE_WALLET ||
  `${process.env.HOME}/.config/solana/id.json`;
const SEED = process.env.NEXT_PUBLIC_FUND_SEED || "solana-direct-fund";
const SPACE = 0; // we just hold lamports, no data

(async () => {
  const secret = Uint8Array.from(
    JSON.parse(fs.readFileSync(BASE_WALLET_PATH, "utf8"))
  );
  const base = Keypair.fromSecretKey(secret);
  const connection = new Connection(RPC, "confirmed");

  const fundAddress = await PublicKey.createWithSeed(
    base.publicKey,
    SEED,
    SystemProgram.programId
  );
  console.log("FUND_ADDRESS:", fundAddress.toBase58());

  const info = await connection.getAccountInfo(fundAddress);
  if (info) {
    console.log("Fund account already exists. Balance:",
      (info.lamports / LAMPORTS_PER_SOL).toFixed(9), "SOL");
    return;
  }

  const rent = await connection.getMinimumBalanceForRentExemption(SPACE);
  const createIx = SystemProgram.createAccountWithSeed({
    fromPubkey: base.publicKey,
    basePubkey: base.publicKey,
    seed: SEED,
    newAccountPubkey: fundAddress,
    lamports: rent,
    space: SPACE,
    programId: SystemProgram.programId,
  });
  const tx = new Transaction().add(createIx);
  const sig = await sendAndConfirmTransaction(connection, tx, [base], {
    commitment: "confirmed",
  });
  console.log("Created fund with seed. Tx:", sig);
})();
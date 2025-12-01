import { PublicKey } from "@solana/web3.js";

// This must match the declare_id! in your lib.rs
const PROGRAM_ID = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"); 

// This must match the seed used in your lib.rs #[account] macro
// In the previous code, we didn't specify a seed explicitly, so let's use a standard "fund" seed.
const SEED = Buffer.from("fund"); 

const [pda] = PublicKey.findProgramAddressSync(
  [SEED],
  PROGRAM_ID
);

console.log("----------------------------------------------------");
console.log("YOUR FUND ADDRESS (PDA):", pda.toBase58());
console.log("----------------------------------------------------");
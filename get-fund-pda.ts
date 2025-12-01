import { PublicKey } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("YOUR_DEPLOYED_PROGRAM_ID");

const [fundPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("emergency_fund")],
  PROGRAM_ID
);

console.log("Fund Address:", fundPda.toString());
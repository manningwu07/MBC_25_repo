import { Program } from "@coral-xyz/anchor";

import { SolanaAid } from "./solana_aid";
import idl from "./solana_aid.json";

export const program = new Program(idl) as Program<SolanaAid>;

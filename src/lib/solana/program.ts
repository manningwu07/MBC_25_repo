import { Program } from "@coral-xyz/anchor";
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';


import { SolanaAid } from "./solana_aid";
import idl from "./solana_aid.json";

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
const programId = new PublicKey(
	(idl as any).address ?? 'oops'
);


export const program = new Program(idl, { connection }) as Program<SolanaAid>;


//file: src/app/api/actions/donate-sol/route.ts

import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  BLOCKCHAIN_IDS,
} from "@solana/actions";

// imports for the transaction
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

// Create a connection to the Solana blockchain
const connection = new Connection("https://api.devnet.solana.com");

// Tutorial reccommended. 
// CAIP-2 format for Solana
const blockchain = BLOCKCHAIN_IDS.devnet;

// Set standardized headers for Blink Providers
const headers = {
  ...ACTIONS_CORS_HEADERS,
  "x-blockchain-ids": blockchain,
  "x-action-version": "2.4",
};

// OPTIONS endpoint is required for CORS preflight requests
// Your Blink won't render if you don't add this
export const OPTIONS = async () => {
  return new Response(null, { headers });
};


// GET endpoint returns the Blink metadata (JSON) and UI configuration
export const GET = async (req: Request) => {
  // This JSON is used to render the Blink UI
  const response: ActionGetResponse = {
    type: "action",
    icon: `${new URL("/donate.jpg", req.url).toString()}`,
    label: "1 SOL",
    title: "Donate SOL",
    description:
      "This Blink demonstrates how to donate SOL on the Solana blockchain. It is a part of the official Blink Starter Guides by Dialect Labs.",
    // Links is used if you have multiple actions or if you need more than one params
    links: {
      actions: [
        {
          // Defines this as a blockchain transaction
          type: "transaction",
          label: "0.01 SOL",
          // This is the endpoint for the POST request
          href: `/api/actions/donate-sol?amount=0.01`,
        },
        {
          type: "transaction",
          label: "0.05 SOL",
          href: `/api/actions/donate-sol?amount=0.05`,
        },
        {
          type: "transaction",
          label: "0.1 SOL",
          href: `/api/actions/donate-sol?amount=0.1`,
        },
        {
          // Example for a custom input field
          type: "transaction",
          href: `/api/actions/donate-sol?amount={amount}`,
          label: "Donate",
          parameters: [
            {
              name: "amount",
              label: "Enter a custom SOL amount",
              type: "number",
            },
          ],
        },
      ],
    },
  };

  // Return the response with proper headers
  return new Response(JSON.stringify(response), {
    status: 200,
    headers,
  });
};

const prepareTransaction = async (
  connection: Connection,
  payer: PublicKey,
  poolId: number,
  amountSol: number
) => {
  // We will call the program instruction `donate_to_pool` using the IDL
  // Read program id from the local idl file and use the instruction discriminator
  const idl = await import("../../../../lib/solana/solana_aid.json");

  const programId = new PublicKey(idl.address);

  // Find the instruction description for donate_to_pool in the idl
  const instr = idl.instructions.find((i: any) => i.name === "donate_to_pool");
  if (!instr) throw new Error("donate_to_pool instruction not found in IDL");

  // discriminator is provided in the idl as an array of u8
  const discriminator = Buffer.from(instr.discriminator);

  // amount is u64 in the program: convert SOL -> lamports and encode as u64 LE
  const lamports = BigInt(Math.floor(amountSol * LAMPORTS_PER_SOL));
  const amountBuf = Buffer.alloc(8);
  amountBuf.writeBigUInt64LE(lamports, 0);

  // instruction data = <8-byte discriminator> + serialized args (here only u64 amount)
  const data = Buffer.concat([discriminator, amountBuf]);

  // pool PDA: seeds ["pool", poolId as u64 le]
  const poolIdBuf = Buffer.alloc(8);
  poolIdBuf.writeBigUInt64LE(BigInt(poolId), 0);
  const [poolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("pool"), poolIdBuf],
    programId
  );

  // Build instruction keys according to idl accounts order
  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: poolPda, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  const instruction = new TransactionInstruction({
    keys,
    programId,
    data,
  });

  // Get the latest blockhash
  const { blockhash } = await connection.getLatestBlockhash();

  // Create a transaction message
  const message = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions: [instruction],
  }).compileToV0Message();

  // Create and return a versioned transaction
  return new VersionedTransaction(message);
};

export const POST = async (req: Request) => {
  try {
    // Following code will start here with step 1
    // Step 1: Extract parameters, prepare data
    const url = new URL(req.url);

    // Amount of SOL to transfer is passed in the URL
    const amount = Number(url.searchParams.get("amount"));

    // Payer public key is passed in the request body
    const request: ActionPostRequest = await req.json();
    const payer = new PublicKey(request.account);

    // We call donate_to_pool for pool id 0 (matches example Anchor code)
    const poolId = 0;

    const transaction = await prepareTransaction(connection, payer, poolId, amount);

    const response: ActionPostResponse = {
      type: "transaction",
      transaction: Buffer.from(transaction.serialize()).toString("base64"),
    };

    // Return the response with proper headers
    return Response.json(response, { status: 200, headers });
 
  } catch (error) {
    // Log and return an error response
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers,
    });
  }
};
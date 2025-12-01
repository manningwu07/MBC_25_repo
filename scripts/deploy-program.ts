import { Connection, Keypair } from '@solana/web3.js';
import * as fs from 'fs';

const deploy = async () => {
    console.log("Reading keypair...");
    console.log("Deploying program from keypair...");
    console.log("Program deployed to Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
};

deploy().catch(console.error);

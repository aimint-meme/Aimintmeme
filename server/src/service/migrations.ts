import * as anchor from "@coral-xyz/anchor";
import { Keypair, Connection } from "@solana/web3.js";
import idl from '../idl/idl.json'
import { AmiContract } from "../idl/idlType";

const connection = new Connection(process.env.ENDPOINT as string)

let FROM_SECRET_KEY = process.env.FROM_SECRET_KEY as string;
let keys = FROM_SECRET_KEY.split(',').map(item => parseInt(item, 10));

const priKey = Uint8Array.from(keys);
const priKP = Keypair.fromSecretKey(priKey)
const wallet = new anchor.Wallet(priKP)
//preflightCommitment: "processed",
//commitment: "processed"
const provider = new anchor.AnchorProvider(connection, wallet, {
})
anchor.setProvider(provider)
const program = new anchor.Program(idl as AmiContract, provider)
const signer = provider.wallet.publicKey;

async function migration(mintPdaAddress: string, tokenPdaAddress: string) {
    // const mintPdaAddress = "4QUBmgzUYfhqvuwxMZZhEyZZJcwZerhEVk7aRJS1ZHGt"
    const mintPda = new anchor.web3.PublicKey(mintPdaAddress)

    // const tokenPdaAddress = "FTV1qwXxhDEzEyvwYREwcx7FatAy2vPeMUzBnyW8ZaYw"
    const tokenPda = new anchor.web3.PublicKey(tokenPdaAddress);

    try {
        const tx = await program.methods.startMigration().accounts({
            signer: signer,
            tokenVaultPda: tokenPda,
            mint: mintPda
        }).rpc({
            commitment: "confirmed",
            preflightCommitment: "processed",
            skipPreflight: true,
            maxRetries: 3,
        })
        console.log("migration tx:", tx)
        // process.exit()
    } catch (error) {
        console.log("migration error:", error)
        // process.exit()
    }
}

// migration()
export default {
    migration
}
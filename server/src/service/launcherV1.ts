// npx ts-node launcher.ts
import { BN } from '@coral-xyz/anchor';
import {
    Raydium,
    TxVersion,
    parseTokenAccountResp,
    MARKET_STATE_LAYOUT_V3,
    AMM_V4,
    OPEN_BOOK_PROGRAM,
    FEE_DESTINATION_ID,
    DEVNET_PROGRAM_ID,
    confirmTransaction,
    CREATE_CPMM_POOL_PROGRAM,
    CREATE_CPMM_POOL_FEE_ACC,
    getCpmmPdaAmmConfigId,
} from '@raydium-io/raydium-sdk-v2'
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { Connection, Keypair, clusterApiUrl, PublicKey, VersionedTransaction, Signer } from '@solana/web3.js'
// import { devConfigs } from './utils';
// import Decimal from 'decimal.js';


let FROM_SECRET_KEY = process.env.FROM_SECRET_KEY as string;
let keys = FROM_SECRET_KEY.split(',').map(item => parseInt(item, 10));

// dS8oFvVzvr3BosefasMFG3EJAKxDCAxSuEkwMKTboTW
const owner: Keypair = Keypair.fromSecretKey(Uint8Array.from(keys))
const signer: Signer = owner
const txVersion = TxVersion.V0

let ENDPOINT = process.env.ENDPOINT as string;
const connection = new Connection(ENDPOINT, {
    commitment: 'finalized'
})

// const cluster = 'devnet'
// const cluster = 'mainnet'
let cluster = process.env.CLUSTER as any;

let raydium: Raydium | undefined

// // WSOL: So11111111111111111111111111111111111111112
// //let baseMint = new PublicKey("So11111111111111111111111111111111111111112")

// TODO: ---------------------
// test3 coin mint: Hhv6yS7L6UwJXwktt5vf88YBtJ1wyMkb7i5618g8C9EW
// let baseMint = new PublicKey("So11111111111111111111111111111111111111112")
let BASEMINT = process.env.BASEMINT as string
let baseMint = new PublicKey(BASEMINT);
// let baseAmount = new BN(52).mul(new BN(10).pow(new BN(9)))

// test4 coin mint: 5y6pPQqpxTxRgdWsnQjvigbrrvFrUEGyVEHKpTYwJAXs
// let quoteMint = new PublicKey("5y6pPQqpxTxRgdWsnQjvigbrrvFrUEGyVEHKpTYwJAXs")

// tokenAmount
// let quoteAmount = new BN(200000000).mul(new BN(10).pow(new BN(9)))

// ------------------------------
import { getLog } from "../utils/LogUtils";
const logger = getLog("launcherV1");
async function startLaunchingWork(mintPdaAddr: string, solAmount: number, tokenAmount: number) {
    await initSdk()
    console.log("step1...")
    logger.info('launcherV1->step1', mintPdaAddr, solAmount, tokenAmount);
    let marketId;
    try {
        marketId = await createBookMarket(mintPdaAddr)
        console.log("get marketId:", marketId)
    } catch (error) {
        console.log("create market failed:")
    }

    console.log("step2...")
    logger.info('launcherV1->step2', mintPdaAddr, solAmount, tokenAmount);
    try {
        if (marketId) {
            console.log('step2->marketId:', marketId);
            logger.info('step2->marketId', mintPdaAddr, solAmount, tokenAmount);
            await retryCreateAmmPool(marketId, mintPdaAddr, Math.floor(solAmount), Math.floor(tokenAmount))
        }
    } catch (error) {
        console.log("create AMM failed")
        logger.info('create AMM failed', mintPdaAddr, solAmount, tokenAmount);
    }
    logger.info('work finished', mintPdaAddr, solAmount, tokenAmount);
    console.log("work finished")
}

async function createBookMarket(mintPdaAddr: string) {
    if (!raydium) {
        console.log("raydium not ready")
        return
    }
    console.log("1")
    let marketId
    try {
        const { execute, extInfo, transactions, signers } = await raydium.marketV2.create({
            baseInfo: {
                // mint: baseMint,
                mint: new PublicKey(mintPdaAddr),
                decimals: 9
            },
            quoteInfo: {
                // mint: quoteMint,
                mint: baseMint,
                // mint: new PublicKey(mintPdaAddr),
                decimals: 9
            },
            lotSize: 1,
            tickSize: 0.01,
            dexProgramId: DEVNET_PROGRAM_ID.OPENBOOK_MARKET,
            txVersion,
            computeBudgetConfig: {
                units: 100_000_000,
                microLamports: 1_000,
            },
        })
        let marketObj: MarketInfo = Object.keys(extInfo.address).reduce(
            (acc, cur) => ({
                ...acc,
                [cur]: extInfo.address[cur as keyof typeof extInfo.address].toBase58(),
            }),
            {} as MarketInfo
        )
        if (marketObj) {
            marketId = marketObj.marketId;
            console.log("2:", marketObj.marketId)
        } else {
            console.log("3: !marketObj")
        }
        console.log(
            `create market total ${transactions.length} txs, market info: `,
            marketObj
        )

        const txIds = await execute({ sequentially: false })
        console.log("txids:", txIds)
    } catch (error) {
        console.log("", error)
    } finally {
        return marketId
    }
}

async function createAmmPool(marketIdStr: string, mintPdaAddr: string, solAmount: number, tokenAmount: number) {
    console.log('tokenAmount1:', tokenAmount);
    const marketId = new PublicKey(marketIdStr)
    if (!raydium) {
        console.log("raydium sdk not ready")
        return
    }
    try {
        console.log("1")
        const marketBufferInfo = await raydium.connection.getAccountInfo(marketId)
        console.log("marketBufferInfo: ", marketBufferInfo)

        console.log("baseMint:", baseMint)
        console.log("quoteMint", mintPdaAddr)
        console.log("baseAmount", new BN(solAmount).mul(new BN(10).pow(new BN(9))))
        console.log("quoteAmount", new BN(tokenAmount).mul(new BN(10).pow(new BN(9))))

        const { execute, extInfo } = await raydium.liquidity.createPoolV4({
            programId: DEVNET_PROGRAM_ID.AmmV4,
            marketInfo: {
                marketId,
                programId: DEVNET_PROGRAM_ID.OPENBOOK_MARKET,
            },
            baseMintInfo: {
                // mint: baseMint,
                mint: new PublicKey(mintPdaAddr),
                decimals: 9
            },
            quoteMintInfo: {
                // mint: quoteMint,
                mint: baseMint,
                // mint: new PublicKey(mintPdaAddr),
                decimals: 9,
            },
            // baseAmount: baseAmount,
            baseAmount: new BN(solAmount).mul(new BN(10).pow(new BN(9))),
            // quoteAmount: quoteAmount,
            quoteAmount: new BN(tokenAmount).mul(new BN(10).pow(new BN(9))),
            startTime: new BN(0),
            ownerInfo: {
                useSOLBalance: true
            },
            associatedOnly: false,
            txVersion,
            feeDestinationId: DEVNET_PROGRAM_ID.FEE_DESTINATION_ID,
            computeBudgetConfig: {
                units: 100_000_000,
                microLamports: 1_000,
            }
        })
        console.log("4")
        let ammObj = Object.keys(extInfo.address).reduce(
            (acc, cur) => ({
                ...acc,
                [cur]: extInfo.address[cur as keyof typeof extInfo.address].toBase58(),
            }),
            {}
        )
        logger.info('ammObj', ammObj);
        console.log("ammObj:", ammObj)
        console.log("5")
        const { txId } = await execute({ sendAndConfirm: false })
        console.log("6")
        console.log(
            'amm pool created! txId: ',
            txId,
        )
        logger.info('amm pool created! txId', txId);
        if (txId) {
            logger.info('Transaction successful, txId:', txId);
            return txId;
        } else {
            logger.info('Transaction failed or not returned.');
            return null;
        }
    } catch (error) {
        logger.info("createAmmPool error:", error);
        return null;
    }
}

async function retryCreateAmmPool(
    marketIdStr: string,
    mintPdaAddr: string,
    solAmount: number,
    tokenAmount: number,
    maxRetries: number = 50 // 最大重试次数
): Promise<string | null> {
    let attempt = 0;
    let delay = 1000; // 初始延迟时间为 1 秒

    while (attempt < maxRetries) {
        attempt++;
        console.log(`Attempt ${attempt}/${maxRetries} to create AMM Pool...`);
        const txId = await createAmmPool(marketIdStr, mintPdaAddr, solAmount, tokenAmount);
        if (txId) {
            console.log(`AMM Pool created successfully on attempt ${attempt} with txId: ${txId}`);
            return txId; // 成功返回 txId
        } else {
            console.log(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay)); // 延迟重试
            delay *= 2;
        }
    }
    console.error(`Failed to create AMM Pool after ${maxRetries} attempts.`);
    return null; // 超过最大重试次数后返回 null
}


// startLaunchingWork().then(() => {
//     console.log("launching work finished")
//     process.exit();
// }).catch(() => {
//     console.log("launching work failed")
//     process.exit();
// })

process.on('SIGINT', () => {
    console.log("Exiting...");
    // process.exit();
});

interface MarketInfo {
    marketId: string;
    requestQueue: string;
    eventQueue: string;
    bids: string;
    asks: string;
    baseVault: string;
    quoteVault: string;
    baseMint: string;
    quoteMint: string;
}

async function initSdk() {
    try {
        raydium = await Raydium.load({
            owner,
            connection,
            cluster,
            disableFeatureCheck: true,
            disableLoadToken: true,
            blockhashCommitment: 'finalized'
        })
        console.log("init raydium SDK finished")
        logger.info('init raydium SDK finished');
    } catch (error) {
        console.log("initSdk error:", error)
    }
}

export default {
    startLaunchingWork
}

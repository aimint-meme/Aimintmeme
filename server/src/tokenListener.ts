import { Connection, clusterApiUrl, ConfirmOptions, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AxiosError } from 'axios';
import solanaWeb3 from "@solana/web3.js";
import MySQLUtils from "./utils/MySQLUtils";
import RedisUtils from "./utils/RedisUtils";
import DataUtils from "./utils/DataUtils";
import DateUtils from "./utils/DateUtils";
import TokenService from "./service/TokenService";
import migrations from "./service/migrations";
import startLaunchingWorks from "./service/launcherV1";
import { getLog } from "./utils/LogUtils";
const logger = getLog("tokenListener");
// 创建连接
// const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/nOASmU1uqpL4UUTuxtbX3r9rrdJKYeKv', 'confirmed');

// const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed' as ConfirmOptions);
// const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
// const rpc = process.env.RPC as string;
// const connection = new solanaWeb3.Connection(rpc, "confirmed");

const endpoint = process.env.ENDPOINT as string;
const connection = new Connection(endpoint);

// let connection: Connection;
// async function createConnection() {
//     const endpoint = process.env.ENDPOINT as string;
//     try {
//         connection = new Connection(endpoint);  // 建立连接
//         console.log("Connected to Solana network");
//     } catch (error) {
//         console.error("Failed to connect to Solana network", error);
//         await new Promise(resolve => setTimeout(resolve, 60000)); // 等待一段时间后重试
//         await createConnection(); // 重新连接
//     }
// }

async function listenEvent() {
    //const endpoint = "https://api.mainnet-beta.solana.com"
    // const endpoint = process.env.ENDPOINT as string;
    // const connection = new Connection(endpoint);
    const public_key = process.env.PUBLIC_KEY as string;
    const programId = new PublicKey(public_key)
    //const programId = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    let lastCheckedSignature: string | undefined;
    let bool = true;

    const createdTokenInfo = await MySQLUtils.getInstance().selectOrderby(
        'signature'
    ) as any;
    if (createdTokenInfo.length > 0) {
        lastCheckedSignature = createdTokenInfo[0].lastCheckedSignature;
    }
    while (bool) {
        bool = false;
        if (lastCheckedSignature !== undefined) {
            console.log("start tx: ", lastCheckedSignature);
        }
        try {
            console.log("1")
            const signatures = await connection.getSignaturesForAddress(
                programId,
                { until: lastCheckedSignature },
                'confirmed'
            )
            console.log("signatures1: ", signatures);
            let token = []; // 存所有监听到的数据
            let sellToken = [];
            let buyToken = [];
            let bondingCurveClose = [];
            let tokenCreate = [];

            if (signatures.length > 0) {
                console.log("3")
                let count = 0
                for (const { signature } of signatures) {
                    count++
                    console.log("-- signature:", signature)
                    const tx = await connection.getParsedTransaction(
                        signature,
                        { commitment: "confirmed", maxSupportedTransactionVersion: 0 }
                    );
                    if (tx) {
                        console.log('err->', tx.meta?.err);
                        let err = tx.meta?.err;
                        if (err !== null) continue;
                        let userAddress = tx.transaction.message.accountKeys[0].pubkey.toString();
                        // let slot = tx.slot;
                        let ts = tx.blockTime;
                        const logs = tx.meta?.logMessages || [];
                        for (let log of logs) {
                            switch (true) {
                                case log.includes('Program log: AMI-CreateToken'):
                                    console.log("program log data: CreateToken", log);
                                    logger.info("program log data: CreateToken", log);
                                    log += `,userAddress: ${userAddress}`;
                                    const CreateTokenString = log.replace(/^Program log: AMI-CreateToken:\s*/, '');
                                    let resCreate = DataUtils.parseLog(CreateTokenString);
                                    resCreate.ts = ts;
                                    console.log('creatToken->', resCreate);
                                    tokenCreate.push(resCreate);
                                    break;
                                case log.includes('Program log: AMI-FEE'):
                                    console.log("program log data: FEE", log);
                                    logger.info("program log data: FEE", log);
                                    break;
                                case log.includes('Program log: AMI-BuyToken'):
                                    console.log("program log data: BuyToken", log);
                                    logger.info("program log data: BuyToken", log);
                                    log += `,tx: ${signature}, userAddress: ${userAddress}`;
                                    const cleanedLogString = log.replace(/^Program log: AMI-BuyToken:\s*/, '');
                                    let resBuy = DataUtils.parseLog(cleanedLogString);
                                    resBuy.avePri = Number((Number(resBuy.solAmount) / Number(resBuy.tokenAmount)).toFixed(10)) || 0;
                                    resBuy.marketCap = Number(resBuy.avePri) * 1000000000 || 0;
                                    resBuy.ts = ts;
                                    token.push(resBuy);
                                    buyToken.push(resBuy);
                                    break;
                                case log.includes('Program log: AMI-SellToken'):
                                    console.log("program log data: SellToken", log);
                                    logger.info("program log data: SellToken", log);
                                    log += `,tx: ${signature}, userAddress: ${userAddress}`;
                                    const cleaned2LogString = log.replace(/^Program log: AMI-SellToken:\s*/, '');
                                    let resSell = DataUtils.parseLog(cleaned2LogString);
                                    resSell.avePri = Number((Number(resSell.solAmount) / Number(resSell.tokenAmount)).toFixed(10)) || 0;
                                    resSell.marketCap = Number(resSell.avePri) * 1000000000 || 0;
                                    resSell.ts = ts;
                                    token.push(resSell);
                                    sellToken.push(resSell);
                                    break;
                                case log.includes('Program log: AMI-BondingCurveClose'):
                                    console.log("program log data: BondingCurveClose", log);
                                    logger.info("program log data: BondingCurveClose", log);
                                    const cleaned3LogString = log.replace(/^Program log: AMI-BondingCurveClose:\s*/, '')
                                    let bondingCurveCloseRes = DataUtils.parseLog(cleaned3LogString);
                                    bondingCurveCloseRes.ts = ts;
                                    bondingCurveClose.push(bondingCurveCloseRes);
                                    migrations.migration(bondingCurveCloseRes.mintAddr, bondingCurveCloseRes.tokenVaultAddr);
                                    break;
                                case log.includes('Program log: AMI-MIGRATION'):
                                    console.log("program log data: MIGRATION", log);
                                    logger.info("program log data: MIGRATION", log);
                                    const cleaned4LogString = log.replace(/^Program log: AMI-MIGRATION:\s*/, '');
                                    let startLaunchingWork = DataUtils.parseLog(cleaned4LogString);
                                    startLaunchingWorks.startLaunchingWork(startLaunchingWork.mintAddr, startLaunchingWork.solAmount - 7, startLaunchingWork.tokenAmount);
                                    break;
                                default:
                            }
                        }
                    }
                    if (count >= 5) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        count = 0
                    }
                }
                lastCheckedSignature = signatures[0].signature;
                let blockTime = signatures[0].blockTime;

                // 创建代币
                if (tokenCreate.length > 0) {
                    tokenCreate.forEach(async item => {
                        let userInfo = await MySQLUtils.getInstance().getUsersByAddress(
                            'user_details',
                            [item.userAddress],
                            ['id', 'user_id', 'address']
                        ) as Array<{ [key: string]: any }>;
                        let time = DateUtils.convertToMySQLDateTime(Number(item.ts) * 1000);
                        let userId = userInfo.find(subItem => item.userAddress === subItem.address)?.user_id || '';
                        let uri = await DataUtils.fetchTokenUri(item.tokenUri);
                        let description = uri?.description || '';
                        let image = uri?.image || '';
                        logger.info('createInsert->', item, uri);
                        if (userId !== '' && image !== '') {
                            await new TokenService().generateToken(
                                userId, item.tokenName, item.tokenSymbol, description, image, '', '', '', '', '', item.mintAddr, item.tokenVaultAddr, time
                            )
                        }
                        logger.info('generateToken', userId, item.tokenName, item.tokenSymbol, description, image, '', '', '', '', '', item.mintAddr, item.tokenVaultAddr, time)
                        // await MySQLUtils.getInstance().insertRecordTransInfo(
                        //     'token_info',
                        //     ['name', 'ticker', 'token_pda_address', 'mint_pda_address', 'created_time', 'updated_time'],
                        //     [item.tokenName, item.tokenSymbol, item.tokenVaultAddr, item.mintAddr, time, time]
                        // );
                    })
                }
                //记录买卖情况
                if (buyToken.length > 0) {
                    buyToken.forEach(async item => {
                        // await MySQLUtils.getInstance().insertRecord(
                        //     'token_transactions',
                        //     ['mint_pda_address', 'token_pda_address', 'pool_sol_balance', 'transaction_time', 'ave_pri', 'token_amount', 'sol_amount', 'user_address', 'transaction_type', 'tx'],
                        //     [item.mintAddr, item.tokenVaultAddr, Number(item.poolSolBalance), DateUtils.convertToMySQLDateTime(Number(item.ts) * 1000), Number(item.avePri), Number(item.tokenAmount), Number(item.solAmount), item.userAddress, 'buy', item.tx]
                        // );
                        let rows = await MySQLUtils.getInstance().insertRecordTransInfo(
                            'transactions',
                            ['signature', 'mint_pda_address', 'token_pda_address', 'pool_sol_balance', 'ts', 'market_cap', 'ave_pri', 'user_address', 'transaction_type', 'token_amount', 'sol_amount'],
                            [item.tx, item.mintAddr, item.tokenVaultAddr, Number(item.poolSolBalance), DateUtils.convertToMySQLDateTime(Number(item.ts) * 1000), Number(item.marketCap), Number(item.avePri), item.userAddress, 'buy', Number(item.tokenAmount), Number(item.solAmount)],
                            'signature'
                        );
                        let transactionId = rows.id;
                        if (transactionId > 1) {
                            await MySQLUtils.getInstance().insertRecord(
                                'token_transactions_amounts',
                                ['transaction_id', 'token_amount', 'sol_amount', 'ts'],
                                [transactionId, Number(item.tokenAmount), Number(item.solAmount), DateUtils.convertToMySQLDateTime(Number(item.ts) * 1000)]
                            );
                            await MySQLUtils.getInstance().insertRecord(
                                'token_tx',
                                ['transaction_id', 'tx', 'ts'],
                                [transactionId, item.tx, DateUtils.convertToMySQLDateTime(Number(item.ts) * 1000)]
                            );
                            // redis计数
                            // await RedisUtils.getInstance().incrementPoints(`detail_${item.tokenVaultAddr}`, item.tokenVaultAddr, 1, 86400);
                            // await RedisUtils.getInstance().incrementPoints(`kLine_${item.tokenVaultAddr}`, item.tokenVaultAddr, 1, 86400);
                        }
                    })
                }
                if (sellToken.length > 0) {
                    sellToken.forEach(async item => {
                        let rows = await MySQLUtils.getInstance().insertRecordTransInfo(
                            'transactions',
                            ['signature', 'mint_pda_address', 'token_pda_address', 'pool_sol_balance', 'ts', 'market_cap', 'ave_pri', 'user_address', 'transaction_type', 'token_amount', 'sol_amount'],
                            [item.tx, item.mintAddr, item.tokenVaultAddr, Number(item.poolSolBalance), DateUtils.convertToMySQLDateTime(Number(item.ts) * 1000), Number(item.marketCap), Number(item.avePri), item.userAddress, 'sell', Number(item.tokenAmount), Number(item.solAmount)],
                            'signature'
                        );
                        let transactionId = rows.id;
                        if (transactionId > 1) {
                            // 加积分
                            // let userService = new UserService();
                            // userService.addPoints(item.userAddress, item.tokenVaultAddr, DateUtils.convertToMySQLDateTime(Number(item.ts) * 1000))
                            // 分表插入
                            await MySQLUtils.getInstance().insertRecord(
                                'token_transactions_amounts',
                                ['transaction_id', 'token_amount', 'sol_amount', 'ts'],
                                [transactionId, Number(item.tokenAmount), Number(item.solAmount), DateUtils.convertToMySQLDateTime(Number(item.ts) * 1000)]
                            );
                            await MySQLUtils.getInstance().insertRecord(
                                'token_tx',
                                ['transaction_id', 'tx', 'ts'],
                                [transactionId, item.tx, DateUtils.convertToMySQLDateTime(Number(item.ts) * 1000)]
                            );
                            // redis计数
                            // await RedisUtils.getInstance().incrementPoints(`detail_${item.tokenVaultAddr}`, item.tokenVaultAddr, 1, 86400);
                            // await RedisUtils.getInstance().incrementPoints(`kLine_${item.tokenVaultAddr}`, item.tokenVaultAddr, 1, 86400);
                        }
                    })
                }
                console.log('token->', token);
                logger.info('token->', token);
                // 更新交易代币信息
                const sortedData = token.sort((a, b) => b.ts - a.ts);// 排序 降序
                const uniqueData = Object.values(sortedData.reduce((acc, item) => { // 去重
                    if (!acc[item.tokenVaultAddr]) {
                        acc[item.tokenVaultAddr] = item;
                    }
                    return acc;
                }, {})) as any;
                if (uniqueData.length > 0) {
                    uniqueData.forEach(async (item: any) => {
                        const time = DateUtils.getInstance().getCurrTime();
                        item.updatedTime = time;
                        await MySQLUtils.getInstance().updateMultipleFieldsAsync(item.mintAddr || '', item || {});
                        if (item.ts) await MySQLUtils.getInstance().updateMultipleKeysAsync(item.mintAddr || '', item || {});
                    })
                }
                // 上外盘，更新数据
                if (bondingCurveClose.length > 0) {
                    bondingCurveClose.forEach(async item => {
                        // 1/410*1000000000 = 243.9024390244 (打满固定平均价)
                        await MySQLUtils.getInstance().updateData(
                            'token_info',
                            'is_outside = 1, market_cap = 243.9024390244',
                            'mint_pda_address = ? AND token_pda_address = ?',
                            [item.mintAddr, item.tokenVaultAddr]
                        )
                    })
                }
                await MySQLUtils.getInstance().insertRecordTransInfo(
                    'signature',
                    ['lastCheckedSignature', 'ts'],
                    [lastCheckedSignature, DateUtils.convertToMySQLDateTime(Number(blockTime) * 1000)],
                    'lastCheckedSignature'
                );
            }
            await new Promise(resolve => setTimeout(resolve, 10000));
            bool = true;
        } catch (error) {
            bool = true;
            console.log("parse program log error:", error)
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
}

// 补查
async function fetchSignatures() {
    try {
        console.log('Fetching signatures...');
        const public_key = process.env.PUBLIC_KEY as string;
        const programId = new PublicKey(public_key)
        let lastCheckedSignature: string | undefined;
        const createdTokenInfo = await MySQLUtils.getInstance().selectOrderbyTime(
            'signature'
        ) as any;
        console.log('createdTokenInfo1111', createdTokenInfo);

        if (createdTokenInfo.length > 0) {
            lastCheckedSignature = createdTokenInfo[0].lastCheckedSignature;
        }
        const signatures = await connection.getSignaturesForAddress(
            programId,
            { until: lastCheckedSignature },
            'confirmed'
        );
        let token = []; // 存所有监听到的数据
        let sellToken = [];
        let buyToken = [];
        let bondingCurveClose = [];
        let tokenCreate = [];
        if (signatures.length > 0) {
            console.log('New Signatures:', signatures);
            let count = 0
            for (const { signature } of signatures) {
                count++
                console.log("-- signature2:", signature)
                const tx = await connection.getParsedTransaction(
                    signature,
                    { commitment: "confirmed", maxSupportedTransactionVersion: 0 }
                );
                if (tx) {
                    console.log('err->', tx.meta?.err);
                    let err = tx.meta?.err;
                    if (err !== null) continue;
                    let userAddress = tx.transaction.message.accountKeys[0].pubkey.toString();
                    let ts = tx.blockTime;
                    const logs = tx.meta?.logMessages || [];
                    for (let log of logs) {
                        switch (true) {
                            case log.includes('Program log: AMI-CreateToken'):
                                console.log("program log data: CreateToken2", log);
                                logger.info("program log data: CreateToken2", log);
                                log += `,userAddress: ${userAddress}`;
                                const CreateTokenString = log.replace(/^Program log: AMI-CreateToken:\s*/, '');
                                let resCreate = DataUtils.parseLog(CreateTokenString);
                                resCreate.ts = ts;
                                console.log('creatToken2->', resCreate);
                                tokenCreate.push(resCreate);
                                break;
                            case log.includes('Program log: AMI-FEE'):
                                console.log("program log data: FEE2", log);
                                logger.info("program log data: FEE2", log);
                                break;
                            case log.includes('Program log: AMI-BuyToken'):
                                console.log("program log data: BuyToken2", log);
                                logger.info("program log data: BuyToken2", log);
                                log += `,tx: ${signature}, userAddress: ${userAddress}`;
                                const cleanedLogString = log.replace(/^Program log: AMI-BuyToken:\s*/, '');
                                let resBuy = DataUtils.parseLog(cleanedLogString);
                                resBuy.avePri = Number((Number(resBuy.solAmount) / Number(resBuy.tokenAmount)).toFixed(10)) || 0;
                                resBuy.marketCap = Number(resBuy.avePri) * 1000000000 || 0;
                                resBuy.ts = ts;
                                token.push(resBuy);
                                buyToken.push(resBuy);
                                break;
                            case log.includes('Program log: AMI-SellToken'):
                                console.log("program log data: SellToken2", log);
                                logger.info("program log data: SellToken2", log);
                                log += `,tx: ${signature}, userAddress: ${userAddress}`;
                                const cleaned2LogString = log.replace(/^Program log: AMI-SellToken:\s*/, '');
                                let resSell = DataUtils.parseLog(cleaned2LogString);
                                resSell.avePri = Number((Number(resSell.solAmount) / Number(resSell.tokenAmount)).toFixed(10)) || 0;
                                resSell.marketCap = Number(resSell.avePri) * 1000000000 || 0;
                                resSell.ts = ts;
                                token.push(resSell);
                                sellToken.push(resSell);
                                break;
                            case log.includes('Program log: AMI-BondingCurveClose'):
                                console.log("program log data: BondingCurveClose2", log);
                                logger.info("program log data: BondingCurveClose2", log);
                                const cleaned3LogString = log.replace(/^Program log: AMI-BondingCurveClose:\s*/, '')
                                let bondingCurveCloseRes = DataUtils.parseLog(cleaned3LogString);
                                bondingCurveCloseRes.ts = ts;
                                bondingCurveClose.push(bondingCurveCloseRes);
                                migrations.migration(bondingCurveCloseRes.mintAddr, bondingCurveCloseRes.tokenVaultAddr);
                                break;
                            case log.includes('Program log: AMI-MIGRATION'):
                                console.log("program log data: MIGRATION2", log);
                                logger.info("program log data: MIGRATION2", log);
                                const cleaned4LogString = log.replace(/^Program log: AMI-MIGRATION:\s*/, '');
                                let startLaunchingWork = DataUtils.parseLog(cleaned4LogString);
                                startLaunchingWorks.startLaunchingWork(startLaunchingWork.mintAddr, startLaunchingWork.solAmount - 7, startLaunchingWork.tokenAmount);
                                break;
                            default:
                        }
                    }
                }
                if (count >= 5) {
                    await new Promise(resolve => setTimeout(resolve, 6000));
                    count = 0
                }
            }
            if (tokenCreate.length > 0) {
                tokenCreate.forEach(async item => {
                    let whereClause = 'mint_pda_address = ?'
                    const [counts] = await MySQLUtils.getInstance().getCount('token_info', whereClause, [item.mintAddr]) as any;
                    if (counts?.count === 0) {
                        let userInfo = await MySQLUtils.getInstance().getUsersByAddress(
                            'user_details',
                            [item.userAddress],
                            ['id', 'user_id', 'address']
                        ) as Array<{ [key: string]: any }>;
                        let time = DateUtils.convertToMySQLDateTime(Number(item.ts) * 1000);
                        let userId = userInfo.find(subItem => item.userAddress === subItem.address)?.user_id || '';
                        let uri = await DataUtils.fetchTokenUri(item.tokenUri);
                        let description = uri?.description || '';
                        let image = uri?.image || '';
                        logger.info('createInsert2->', item, uri);
                        if (userId !== '' && image !== '') {
                            await new TokenService().generateToken(
                                userId, item.tokenName, item.tokenSymbol, description, image, '', '', '', '', '', item.mintAddr, item.tokenVaultAddr, time
                            )
                        }
                        logger.info('generateToken2', userId, item.tokenName, item.tokenSymbol, description, image, '', '', '', '', '', item.mintAddr, item.tokenVaultAddr, time)
                    }
                })
            }
            if (buyToken.length > 0) {
                buyToken.forEach(async item => {
                    let rows = await MySQLUtils.getInstance().insertRecordTransInfo(
                        'transactions',
                        ['signature', 'mint_pda_address', 'token_pda_address', 'pool_sol_balance', 'ts', 'market_cap', 'ave_pri', 'user_address', 'transaction_type', 'token_amount', 'sol_amount'],
                        [item.tx, item.mintAddr, item.tokenVaultAddr, Number(item.poolSolBalance), DateUtils.convertToMySQLDateTime(Number(item.ts) * 1000), Number(item.marketCap), Number(item.avePri), item.userAddress, 'buy', Number(item.tokenAmount), Number(item.solAmount)],
                        'signature'
                    );
                    let transactionId = rows.id;
                    if (transactionId > 1) {
                        await MySQLUtils.getInstance().insertRecord(
                            'token_transactions_amounts',
                            ['transaction_id', 'token_amount', 'sol_amount', 'ts'],
                            [transactionId, Number(item.tokenAmount), Number(item.solAmount), DateUtils.convertToMySQLDateTime(Number(item.ts) * 1000)]
                        );
                        await MySQLUtils.getInstance().insertRecord(
                            'token_tx',
                            ['transaction_id', 'tx', 'ts'],
                            [transactionId, item.tx, DateUtils.convertToMySQLDateTime(Number(item.ts) * 1000)]
                        );
                    }
                })
            }
            if (sellToken.length > 0) {
                sellToken.forEach(async item => {
                    let rows = await MySQLUtils.getInstance().insertRecordTransInfo(
                        'transactions',
                        ['signature', 'mint_pda_address', 'token_pda_address', 'pool_sol_balance', 'ts', 'market_cap', 'ave_pri', 'user_address', 'transaction_type', 'token_amount', 'sol_amount'],
                        [item.tx, item.mintAddr, item.tokenVaultAddr, Number(item.poolSolBalance), DateUtils.convertToMySQLDateTime(Number(item.ts) * 1000), Number(item.marketCap), Number(item.avePri), item.userAddress, 'sell', Number(item.tokenAmount), Number(item.solAmount)],
                        'signature'
                    );
                    let transactionId = rows.id;
                    if (transactionId > 1) {
                        // 分表插入
                        await MySQLUtils.getInstance().insertRecord(
                            'token_transactions_amounts',
                            ['transaction_id', 'token_amount', 'sol_amount', 'ts'],
                            [transactionId, Number(item.tokenAmount), Number(item.solAmount), DateUtils.convertToMySQLDateTime(Number(item.ts) * 1000)]
                        );
                        await MySQLUtils.getInstance().insertRecord(
                            'token_tx',
                            ['transaction_id', 'tx', 'ts'],
                            [transactionId, item.tx, DateUtils.convertToMySQLDateTime(Number(item.ts) * 1000)]
                        );
                    }
                })
            }
            // 上外盘补查
            if (bondingCurveClose.length > 0) {
                bondingCurveClose.forEach(async item => {
                    // 1/410*1000000000 = 243.9024390244 (打满固定平均价)
                    const tokenInfo = await MySQLUtils.getInstance().selectWhere(
                        'token_info',
                        ['*'], // 选择所有列
                        ['mint_pda_address', 'token_pda_address'], // 条件字段
                        [item.mintAddr, item.tokenVaultAddr]
                    );
                    if (tokenInfo.length === 1 && tokenInfo[0].is_outside === 0) {
                        await MySQLUtils.getInstance().updateData(
                            'token_info',
                            'is_outside = 1, market_cap = 243.9024390244',
                            'mint_pda_address = ? AND token_pda_address = ?',
                            [item.mintAddr, item.tokenVaultAddr]
                        )
                    }

                })
            }
        } else {
            console.log('No new signatures.');
        }
    } catch (error) {
        console.error('Error fetching signatures:', error);
    }
}

async function listenForTokenCreations(): Promise<void> {
    console.log('Listening for SPL Token creations...');
    // setInterval(listenEvent, 20000);
    // await createConnection();
    listenEvent()
    fetchSignatures();
    setInterval(fetchSignatures, 1 * 60 * 60 * 1000); // 1小时
}


// 导出函数
export default listenForTokenCreations;
import { EventEmitter } from "stream";
import { ResultEnumCode, ResultEnumMsg } from "../common/Enum";
import Result from "../common/Result";
import MySQLUtils from "../utils/MySQLUtils";
import MySQL from "mysql2/promise";
import { getLog } from "../utils/LogUtils";
import { randomInt } from "crypto";
const logger = getLog("TokenService");
import DateUtils from "../utils/DateUtils";
import DataUtils from "../utils/DataUtils";
import RedisUtils from "../utils/RedisUtils";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair, clusterApiUrl, PublicKey, VersionedTransaction, Signer } from '@solana/web3.js'
import { createMint } from "@solana/spl-token";

const endpoint = "https://api.mainnet-beta.solana.com"

let FROM_SECRET_KEY = process.env.FROM_SECRET_KEY as string;
let keys = FROM_SECRET_KEY.split(',').map(item => parseInt(item, 10));
class TokenService extends EventEmitter {
    mysql: MySQLUtils;
    constructor() {
        super();
        this.mysql = MySQLUtils.getInstance();
    }

    /**
     * 模糊搜索
     * @param keyword 关键字
     */
    // tokenSearch(keyword: string) {
    //     //TODO 处理创建逻辑

    //     return new Result(ResultEnumCode.Succeed);
    // }
    /**
     * 市值排行
     * @param page 页数
     * @param size 当前页显示的数据个数
     */
    tokenRank(page: number, size: number) {
        //TODO 处理创建逻辑 

        return new Result(ResultEnumCode.Succeed);
    }
    /**
     * 代币信息
     * @param address 代币地址
     */
    token(address: string) {
        //TODO 处理创建逻辑

        return new Result(ResultEnumCode.Succeed);
    }
    /**
     * 代币详细信息
     * @param address 代币地址
     */
    // tokenDetails(address: string) {
    //     //TODO 处理创建逻辑

    //     return new Result(ResultEnumCode.Succeed);
    // }
    /**
     * 代币交易历史
     * @param address 代币地址
     */
    tokenHistory(address: string) {
        //TODO 处理创建逻辑

        return new Result(ResultEnumCode.Succeed);
    }
    /**
     * 代币评论信息
     * @param address 代币地址
     */
    tokenTopic(address: string) {
        //TODO 处理创建逻辑

        return new Result(ResultEnumCode.Succeed);
    }
    /**
     * 创建代币
     * @param name 
     * @param symbol 
     * @param icon 
     * @param creator 
     */
    tokenCreate(name: string, symbol: string, icon: string, creator: string) {
        if (!creator) {//连接的钱包到期或者没连接
            return Result.ResultError(ResultEnumCode.ErrorWalletNotConnect);
        }
        //TODO 处理创建逻辑

        return new Result(ResultEnumCode.Succeed);
    }

    /**
     * 生成指定后缀的代币地址
     */
    addressKeygenEnds() {

    }


    /**
     * 生成代币
     * @param name 
     * @returns 
     */
    public async generateToken(
        userId: string,
        name: string,
        ticker: string,
        description: string,
        image: string = '',
        token_symbol: string = '',
        x_link: string = '',
        teltgram_link: string = '',
        discord_link: string = '',
        user_website: string = '',
        mintPdaAddress: string = '',
        tokenPdaAddress: string = '',
        time: string = DateUtils.getInstance().getCurrTime()
    ) {
        try {
            let res = await this.mysql.insertRecord(
                'token_info',
                ['user_id', 'name', 'ticker', 'description', 'image', 'token_symbol', 'mint_pda_address', 'token_pda_address', 'pool_sol_balance', 'x_link', 'teltgram_link', 'discord_link', 'user_website', 'market_cap', 'volume', 'holders', 'created_time', 'updated_time'],
                [userId, name, ticker, description, image, token_symbol, mintPdaAddress, tokenPdaAddress, 0, x_link, teltgram_link, discord_link, user_website, 0, 0, 0, time, time],
                // ['mint_pda_address', 'token_pda_address']
            );
            RedisUtils.getInstance().set('create_in_time', 1, 19);
            if (res.id && res.id) {
                console.log('res=>', res);
                // RedisUtils.getInstance().addPoints(userId, 'points', 10); // 创建代币增加积分
                await this.topic(userId, res.id, `${name}($${ticker})-${description}`, image);
                return new Result(ResultEnumCode.Succeed, res);
            } else {
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        } catch (error) {
            logger.error("生成代币错误", error);
            console.log(error);
            return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
        }
    }

    /**
     * 更新代币信息
     * @param userId 
     * @param id 
     * @param mintPdaAddress 
     * @param tokenPdaAddress 
     * @returns 
     */
    public async updateTokenInfo(
        userId: string,
        id: number,
        mintPdaAddress: string,
        tokenPdaAddress: string
    ) {
        try {
            // const [user] = await this.mysql.select('user_details', '\`user_id\`=?', [userId]) as MySQL.RowDataPacket[];
            // if (user.length === 0) return new Result(ResultEnumCode.BadRequest, ResultEnumMsg.BadRequest);
            await this.mysql.updateData(
                'token_info',
                'mint_pda_address = ?, token_pda_address = ?',
                'id = ?',
                [mintPdaAddress, tokenPdaAddress, id]
            ) as MySQL.RowDataPacket[];
            let res = await this.tokenDetails(userId, id);
            return new Result(ResultEnumCode.Succeed, res.data);
        } catch (error) {
            logger.error("更新代币错误", error);
            console.log(error);
            return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
        }
    }

    /**
     * 直接创建 只更新Link信息等
     * @param userId 
     * @param mintPdaAddress 
     * @param tokenPdaAddress 
     * @param xLink 
     * @param teltgramLink 
     * @param discordLink 
     * @param userWebsite 
     * @returns 
     */
    public async updateTokenInfo2(
        userId: string,
        mintPdaAddress: string,
        tokenPdaAddress: string,
        xLink: string,
        teltgramLink: string,
        discordLink: string,
        userWebsite: string
    ) {
        try {
            await this.mysql.updateData(
                'token_info',
                'x_link = ?, teltgram_link = ?, discord_link = ?, user_website = ?',
                'mint_pda_address = ?',
                [xLink, teltgramLink, discordLink, userWebsite, mintPdaAddress]
            ) as MySQL.RowDataPacket[];
            const [results] = await this.mysql.select('token_info', '\`mint_pda_address\`=?', [mintPdaAddress]) as MySQL.RowDataPacket[];
            if (results.length === 0) return new Result(ResultEnumCode.BadRequest, ResultEnumMsg.BadRequest);
            let result = results as any[];
            result = DataUtils.toCamelCase(result).map(item => {
                return {
                    ...item,
                    id: item.id
                }
            })
            let res = result[0];
            return new Result(ResultEnumCode.Succeed, res);
        } catch (error) {
            logger.error("更新代币错误", error);
            console.log(error);
            return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
        }
    }

    /**
     * 代币列表
     * @param page 
     * @param limit 
     * @returns 
     */
    public async tokenList(
        type: string,
        userId: string,
        page: number,
        limit: number,
        time: number,
        unit: string,
        orderBy: string,
        orderDirection: 'ASC' | 'DESC' = 'DESC',
        marketCap: string[],
        volume: string[],
        following: boolean = false,
        completed: boolean = false, // 是否外盘
        completing: boolean = false, // 是否快上外盘
        spam: boolean = false, // 无交易
        solPrice: number = 214,
        searchTerm: string
    ) {
        try {
            await this.mysql.deleteSameMintAddr();
            // 查询该用户关注的用户
            let followedIds: string[] = [];
            if (following && userId) {
                const [followsInfo] = await this.mysql.select('follows', '\`follower\`=?', [userId]) as MySQL.RowDataPacket[];
                followedIds = [...new Set(followsInfo.map((item: { followed: string; }) => item.followed))] as string[];
            }
            if (following && followedIds.length === 0) {
                return new Result(ResultEnumCode.Succeed, {
                    total: 0,
                    item: []
                });
            }
            // 拼接查询where
            let where = [];
            let params = [];
            if (following && followedIds.length > 0) {
                const placeholders = followedIds.map(() => '?').join(', '); // 使用 ? 作为占位符
                where.push(`user_id IN (${placeholders})`);
                params.push(...followedIds); // 将 followedIds 中的值添加到 params 中
            }
            if (completed) {
                where.push('is_outside = ?');
                params.push(1);
            }
            if (completing) {
                where.push('market_cap >= ? AND is_outside <> 1 ');
                params.push(48000 / solPrice * 0.6);
            }
            if (spam) {
                where.push('holders > ? AND quantity > ?');
                params.push(0, 0);
            }
            if (marketCap && marketCap.length === 2) {
                where.push('market_cap >= ? AND market_cap <= ?');
                params.push(Number(marketCap[0]) / solPrice, Number(marketCap[1]) / solPrice);
            }
            if (volume && volume.length === 2) {
                where.push('volume >= ? AND volume <= ?');
                params.push(volume[0], volume[1]);
            }
            // 模糊查询
            if (searchTerm) {
                where.push('(name LIKE ? OR ticker LIKE ?)');
                params.push(`%${searchTerm}%`, `%${searchTerm}%`);
            }
            if (time && ["HOUR", "DAY", "WEEK", "MINUTE"].includes(unit)) {
                where.push(`created_time >= NOW() - INTERVAL ${time} ${unit}`);
            }
            if (orderBy === 'quantity') {
                where.push('is_outside <> 1')
            }
            // 拼接 WHERE 子句
            let whereClause = where.length > 0 ? where.join(' AND ') : '';
            // 获取代币信息
            let results = await this.mysql.selectWithPagination('token_info', ["*"], page, limit, orderBy, orderDirection, whereClause, params);
            let todexs = results.reduce((sum, e) => sum += Number(e.is_outside), 0);
            if (type && type === 'trending' && todexs > 5) {
                // 当上外盘数量大于5时，只显示5条，剩余5条按交易数量排行
                whereClause += ' AND is_outside <> 1 '
                let otherRes = await this.mysql.selectWithPagination('token_info', ["*"], 1, 5, 'quantity', 'DESC', whereClause, params);
                results = results.slice(0, 5);
                results = results.concat(otherRes);
            }

            // 获取代币数量
            const [counts] = await this.mysql.getCount('token_info', whereClause, params) as MySQL.RowDataPacket[];

            let token_pda_addressIds = [...new Set(results.map(item => item.token_pda_address).filter(address => address !== ""))];

            // 获取代币交易数量
            const countInfo = await this.mysql.countRecords2('transactions', 'token_pda_address', token_pda_addressIds, 'token_pda_address') as Array<{ [key: string]: any }>;
            // 获取代币持有者数量
            const holderCount = await this.mysql.countUserAddressesByToken(token_pda_addressIds) as Array<{ [key: string]: any }>;
            // 批量获取代币创建者的用户信息
            let userIds = [...new Set(results.map(item => item.user_id))];
            let userInfo = await this.mysql.getUsersByIds(
                'user_details',
                userIds,
                ['id', 'user_id', 'username', 'avatar']
            ) as Array<{ [key: string]: any }>;

            let transactionsAvrpri = await this.mysql.getTransactionsAvrpri(token_pda_addressIds, 1, 'DAY') as Array<{ [key: string]: any }>;

            // 批量获取SUM(sol_amount),交易量 并批量更新
            let countsAmount = await this.mysql.getAmountSumBatch(token_pda_addressIds);
            countsAmount.forEach((item: { quantity: any; token_pda_address: any; holders: any; }) => {
                item.quantity = countInfo.find(subItem => item.token_pda_address === subItem.token_pda_address)?.count || 0;
                item.holders = holderCount.find(subItem => item.token_pda_address === subItem.token_pda_address)?.count || 0; //持有人数
            });
            await this.mysql.updateTokenVolumes(countsAmount);

            results = DataUtils.toCamelCase(results).map(item => {
                item.poolSolBalance = Number(item.poolSolBalance) === 0.0016 ? 0 : item.poolSolBalance || 0;
                item.holders = holderCount.find(subItem => item.tokenPdaAddress === subItem.token_pda_address)?.count || 0; //持有人数
                // item.quantity = countInfo.find(subItem => item.tokenPdaAddress === subItem.token_pda_address)?.count || 0; // 交易数量
                item.avatar = userInfo.find(subItem => item.userId === subItem.user_id)?.avatar || process.env.AVATAR;
                item.createdBy = userInfo.find(subItem => item.userId === subItem.user_id)?.username || '';
                item.image = item.image || '';
                item.avePri = item.avePri || 0;
                item.quantity = item.quantity || 0;
                item.tokenAmount = item.tokenAmount || 0;
                item.badge = item.isOutside === 1 ? 4 : DataUtils.calculateValue(Number((item.poolSolBalance / 59 * 100)), item.quantity) || 1;
                item.progressBar = item.isOutside === 1 ? '100%' : DataUtils.convertToPercentage(Number((item.poolSolBalance / 59 * 100)));// 进度条
                item.marketCap = item.isOutside === 1 ? (1 / 4100000 * 1000000000).toFixed(10) : item.marketCap || 0;
                // item.marketCap = Number(item.marketCap) * solPrice || 0;
                item.createdTime = DateUtils.formatDate(item.createdTime) || '';
                item.updatedTime = DateUtils.formatDate(item.updatedTime) || '';
                // item.firstAvePri = transactionsAvrpri.find(subItem => item.tokenPdaAddress === subItem.token_pda_address)?.ave_pri || 0;
                const filteredItems = transactionsAvrpri.filter(subItem => item.tokenPdaAddress === subItem.token_pda_address);
                const lastAvePri = filteredItems[filteredItems.length - 1]?.ave_pri || 0;
                const firstAvePri = filteredItems[0]?.ave_pri || 0;
                item.markup = DataUtils.compareValues(firstAvePri, lastAvePri || '0');
                item.colour = item.isOutside === 1 ? 3 : DataUtils.setColour(item.markup, item.poolSolBalance, Number(item.marketCap)).colour; // [1:紫色（失败）。2：红色（下降）3：绿色（上升）3：不显示]
                if (firstAvePri != 0 && item.marketCap == 0) item.colour = 1;
                return {
                    ...item,
                    currentTime: DateUtils.getInstance().getCurrTime(),
                    firstAvePri,
                    lastAvePri
                }
            })
            let res = {
                total: counts?.count || 0,
                item: results
            }
            return new Result(ResultEnumCode.Succeed, res);
        } catch (error) {
            logger.error("代币列表查询错误", error);
            console.log(error);
            return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
        }
    }

    /**
     * 代币详情
     * @param name 代币名称
     * @param name 代币id
     * @returns 
     */
    public async tokenDetails(
        userId: string,
        id: number
    ) {
        try {
            const [results] = await this.mysql.select('token_info', '\`id\`=?', [id]) as MySQL.RowDataPacket[];
            if (results.length === 0) return new Result(ResultEnumCode.BadRequest, ResultEnumMsg.BadRequest);
            let result = results as any[];
            const [countsAmount] = await this.mysql.getAmountSum(result[0].token_pda_address);

            // 获取第一笔交易平均价格
            // let rows = await this.mysql.selectWhere(
            //     'transactions',
            //     ['ave_pri'], // 选择所有列
            //     ['token_pda_address'], // 条件字段
            //     [result[0].token_pda_address],
            //     1,
            //     1
            // );
            // let firstAvePri = rows[0]?.ave_pri || 0;
            // let nowAvePri = results[0]?.ave_pri || 0;

            // 批量获取用户信息
            let userIds = [...new Set(result.map(item => item.user_id))];
            let userInfo = await this.mysql.getUsersByIds(
                'user_details',
                userIds,
                ['id', 'user_id', 'username', 'avatar']
            ) as Array<{ [key: string]: any }>;
            let isfollowed = false
            if (userId) {
                const rows = await this.mysql.selectWhere(
                    'follows',
                    ['id'], // 选择id列
                    ['follower', 'followed'], // 条件字段
                    [userId, userIds[0]] // 条件值
                );
                if (rows.length > 0) isfollowed = true;
                if (userId === userIds[0]) isfollowed = true;
            }
            const transformedData = userInfo.reduce((acc, curr) => {
                acc[curr.user_id] = { ...curr };  // 将当前对象放在 user_id 键下
                return acc;
            }, {});
            // DataUtils.removeFields(resultArray, ['mintPdaAddress']); // 删除指定字段
            let transactionsAvrpri = await this.mysql.getTransactionsAvrpri([result[0].token_pda_address], 1, 'DAY') as Array<{ [key: string]: any }>;
            let firstAvePri = transactionsAvrpri[0]?.ave_pri || '0';
            let nowAvePri = transactionsAvrpri[transactionsAvrpri.length - 1]?.ave_pri || '0';

            const transactionsInfo = await this.mysql.selectWhere(
                'transactions',
                ['id', 'pool_sol_balance', 'market_cap', 'ave_pri', 'token_amount', 'token_pda_address'],
                ['mint_pda_address'], // 条件字段
                [result[0].mint_pda_address], // 条件值
                1, 2, 'ts', "DESC"
            );
            logger.info('tokenDetails-transactionsInfo-2', transactionsInfo)
            result = DataUtils.toCamelCase(result).map(item => {
                item.poolSolBalance = Number(item.poolSolBalance) === 0.0016 ? 0 : item.poolSolBalance || 0;
                item.createdTime = DateUtils.formatDate(item.createdTime);
                item.updatedTime = DateUtils.formatDate(item.updatedTime);
                item.volume = Number(countsAmount.total_sol_amount) || 0;
                item.avePri = item.avePri || 0;
                item.tokenAmount = item.tokenAmount || 0;
                return {
                    ...item,
                    currentTime: DateUtils.getInstance().getCurrTime(),
                    poolSolBalanceShare: DataUtils.convertToPercentage(Number((item.poolSolBalance / 59 * 100))),
                    remainingTokenAmount: 1000000000 - Number(item.tokenAmount),
                    createdBy: transformedData[item.userId]?.username || '',
                    avatar: transformedData[item.userId]?.avatar || process.env.AVATAR,
                    badge: item.isOutside === 1 ? 4 : DataUtils.calculateValue(Number((item.poolSolBalance / 59 * 100)), item.quantity) || 1,
                    progressBar: item.isOutside === 1 ? '100%' : DataUtils.convertToPercentage(Number((item.poolSolBalance / 59 * 100))),// 进度条
                    marketCap: item.isOutside === 1 ? (1 / 4100000 * 1000000000).toFixed(10) : item.marketCap || 0,
                    markup: DataUtils.compareValues(firstAvePri, nowAvePri),
                    isfollowed,
                    itself: userId ? userId === userIds[0] : false,
                }
            })
            let res = result[0];
            logger.info('tokenDetails-transactionsInfo-res', res);
            // 更新token_info数据(当监听失败时，特殊处理)
            if (transactionsInfo.length > 0) {
                const transaction = transactionsInfo[0];
                const isSingleTransaction = transactionsInfo.length === 1;
                let isBalanceZero = Number(transaction.pool_sol_balance) === 0.0016;
                if (res.mintPdaAddress !== '' && res.createdTime !== '' && new Date(res.createdTime.replace(' ', 'T')) < new Date("2024-11-30T23:08:31")) {
                    isBalanceZero = Number(transaction.pool_sol_balance) === 0.0018;
                }
                const update = {
                    tokenVaultAddr: transaction.token_pda_address,
                    poolSolBalance: transaction.pool_sol_balance,
                    avePri: transaction.ave_pri,
                    tokenAmount: transaction.token_amount,
                    marketCap: transaction.market_cap,
                    updatedTime: DateUtils.getInstance().getCurrTime(),
                };
                // 统一更新 res 的公共字段
                const updateResFields = () => {
                    res.poolSolBalance = isBalanceZero ? 0 : transaction.pool_sol_balance;
                    res.marketCap = transaction.market_cap;
                    res.avePri = transaction.ave_pri;
                    res.tokenAmount = transaction.token_amount;
                    res.progressBar = res.isOutside === 1 ? '100%' : DataUtils.convertToPercentage(Number((res.poolSolBalance / 59) * 100));
                };
                // 判断是否为单个交易
                if (isSingleTransaction) {
                    updateResFields();
                    await MySQLUtils.getInstance().updateMultipleFieldsAsync(res.mintPdaAddress || '', update);
                    logger.info('tokenDetails-transactionsInfo-update', update);
                } else {
                    updateResFields();
                    if (update.poolSolBalance !== res.poolSolBalance) {
                        logger.info('tokenDetails->updateSup', update);
                        await MySQLUtils.getInstance().updateMultipleFieldsAsync(res.mintPdaAddress || '', update);
                    }
                }
            }
            if (res.tokenPdaAddress === '' && res?.avePri > 0) {
                let update = {
                    poolSolBalance: 0,
                    avePri: 0,
                    tokenAmount: 0,
                    marketCap: 0,
                }
                await MySQLUtils.getInstance().updateMultipleFieldsAsyncByTokenId(res.id || '', update);
                logger.info('tokenDetails-transactionsInfo-update-0', update);
            }
            return new Result(ResultEnumCode.Succeed, res);
        } catch (error) {
            logger.error("代币详情查询错误", error);
            console.log(error);
            return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
        }
    }

    /**
     * 涨幅
     * @param userId 
     * @param id 
     * @param time 
     * @param unit 
     * @returns 
     */
    public async getMarkup(
        userId: string,
        tokenId: number,
        time: number,
        unit: string
    ) {
        try {
            const [results] = await this.mysql.select('token_info', '\`id\`=?', [tokenId]) as MySQL.RowDataPacket[];
            if (results.length === 0) return new Result(ResultEnumCode.BadRequest, ResultEnumMsg.BadRequest);
            let result = results as any[];
            const [countsAmount] = await this.mysql.getAmountSum(result[0].token_pda_address);
            let transactionsAvrpri = await this.mysql.getTransactionsAvrpri([result[0].token_pda_address], time, unit) as Array<{ [key: string]: any }>;
            let firstAvePri = transactionsAvrpri[0]?.ave_pri || '0';
            let nowAvePri = transactionsAvrpri[transactionsAvrpri.length - 1]?.ave_pri || '0';
            result = DataUtils.toCamelCase(result).map(item => {
                item.poolSolBalance = Number(item.poolSolBalance) === 0.0016 ? 0 : item.poolSolBalance || 0;
                item.createdTime = DateUtils.formatDate(item.createdTime);
                item.updatedTime = DateUtils.formatDate(item.updatedTime);
                item.volume = Number(countsAmount.total_sol_amount) || 0;
                item.avePri = item.avePri || 0;
                item.tokenAmount = item.tokenAmount || 0;
                return {
                    ...item,
                    currentTime: DateUtils.getInstance().getCurrTime(),
                    poolSolBalanceShare: DataUtils.convertToPercentage(Number((item.poolSolBalance / 59 * 100))),
                    remainingTokenAmount: 1000000000 - Number(item.tokenAmount),
                    badge: item.isOutside === 1 ? 4 : DataUtils.calculateValue(Number((item.poolSolBalance / 59 * 100)), item.quantity) || 1,
                    progressBar: item.isOutside === 1 ? '100%' : DataUtils.convertToPercentage(Number((item.poolSolBalance / 59 * 100))),// 进度条
                    marketCap: item.isOutside === 1 ? (1 / 4100000 * 1000000000).toFixed(10) : item.marketCap || 0,
                    markup: DataUtils.compareValues(firstAvePri, nowAvePri),
                }
            })
            let res = result[0];
            return new Result(ResultEnumCode.Succeed, res);
        } catch (error) {
            logger.error("代币涨幅查询错误", error);
            console.log(error);
            return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
        }
    }

    public async getTokenId(
        userId: string,
        mintPdaAddress: number
    ) {
        try {
            const [results] = await this.mysql.select('token_info', '\`mint_pda_address\`=?', [mintPdaAddress]) as MySQL.RowDataPacket[];
            if (results.length === 0) return new Result(ResultEnumCode.BadRequest, ResultEnumMsg.BadRequest);
            let result = results as any[];
            result = DataUtils.toCamelCase(result).map(item => {
                return {
                    id: item.id
                }
            })
            let res = result[0];
            return new Result(ResultEnumCode.Succeed, res);
        } catch (error) {
            logger.error("代币id查询错误", error);
            console.log(error);
            return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
        }
    }


    // 获取代币信息
    public async tokenInfo(
        userId: string,
        id: number
    ) {
        try {
            // const time = DateUtils.getInstance().getCurrTime();
            let whereClause = `updated_time > NOW() - INTERVAL 10 SECOND AND id = ${id}`;
            let result = await this.mysql.selectWithPagination(
                'token_info', ['*'], 1, 1, 'id', 'ASC', whereClause
            );
            if (result.length === 0) return new Result(ResultEnumCode.Succeed, {});
            const [countsAmount] = await this.mysql.getAmountSum(result[0].token_pda_address);
            let transactionsAvrpri = await this.mysql.getTransactionsAvrpri([result[0].token_pda_address], 1, 'MINUTE') as Array<{ [key: string]: any }>;
            let firstAvePri = transactionsAvrpri[0]?.ave_pri || '0';
            let nowAvePri = transactionsAvrpri[transactionsAvrpri.length - 1]?.ave_pri || '0';
            result = DataUtils.toCamelCase(result).map(item => {
                item.poolSolBalance = Number(item.poolSolBalance) === 0.0016 ? 0 : item.poolSolBalance || 0;
                item.createdTime = DateUtils.formatDate(item.createdTime);
                item.updatedTime = DateUtils.formatDate(item.updatedTime);
                item.volume = Number(countsAmount.total_sol_amount) || 0;
                item.avePri = item.avePri || 0;
                item.tokenAmount = item.tokenAmount || 0;
                return {
                    ...item,
                    currentTime: DateUtils.getInstance().getCurrTime(),
                    poolSolBalanceShare: DataUtils.convertToPercentage(Number((item.poolSolBalance / 59 * 100))),
                    remainingTokenAmount: 1000000000 - Number(item.tokenAmount),
                    badge: item.isOutside === 1 ? 4 : DataUtils.calculateValue(Number((item.poolSolBalance / 59 * 100)), item.quantity) || 1,
                    progressBar: item.isOutside === 1 ? '100%' : DataUtils.convertToPercentage(Number((item.poolSolBalance / 59 * 100))),// 进度条
                    marketCap: item.isOutside === 1 ? (1 / 4100000 * 1000000000).toFixed(10) : item.marketCap || 0,
                    markup: DataUtils.compareValues(firstAvePri, nowAvePri),
                }
            })
            let res = result[0];
            return new Result(ResultEnumCode.Succeed, res);
        } catch (error) {
            logger.error("代币详情查询错误", error);
            console.log(error);
            return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
        }
    }

    /**
     * 代币模糊搜索
     * @param userId 
     * @param searchTerm 
     * @returns 
     */
    public async tokenSearch(
        userId: string,
        searchTerm: string,
        page: number,
        limit: number
    ) {
        try {
            let result = await this.mysql.searchByField('token_info', ['ticker', 'mint_pda_address', 'name'], searchTerm, page, limit) as any;
            let results = result.items as any[];

            // 批量获取用户信息
            let userIds = [...new Set(result.items.map((item: { user_id: any; }) => item.user_id))] as string[];
            let userInfo = await this.mysql.getUsersByIds(
                'user_details',
                userIds,
                ['id', 'user_id', 'username', 'avatar']
            ) as Array<{ [key: string]: any }>;
            const transformedData = userInfo.reduce((acc, curr) => {
                acc[curr.user_id] = { ...curr };  // 将当前对象放在 user_id 键下
                return acc;
            }, {});
            let token_pda_addressIds = [...new Set(results.map(item => item.token_pda_address).filter(address => address !== ""))];
            let transactionsAvrpri = await this.mysql.getTransactionsAvrpri(token_pda_addressIds, 1, 'DAY') as Array<{ [key: string]: any }>;

            result.items = DataUtils.toCamelCase(result.items).map((item: any) => {
                const filteredItems = transactionsAvrpri.filter(subItem => item.tokenPdaAddress === subItem.token_pda_address);
                const lastAvePri = filteredItems[filteredItems.length - 1]?.ave_pri || 0;
                const firstAvePri = filteredItems[0]?.ave_pri || 0;
                item.markup = DataUtils.compareValues(firstAvePri, lastAvePri || '0');
                item.firstAvePri = transactionsAvrpri.find(subItem => item.tokenPdaAddress === subItem.token_pda_address)?.ave_pri || 0;
                item.createdTime = DateUtils.formatDate(item.createdTime);
                item.updatedTime = DateUtils.formatDate(item.updatedTime);
                item.avePri = item.avePri || 0;
                item.tokenAmount = item.tokenAmount || 0;
                item.poolSolBalance = Number(item.poolSolBalance) === 0.0016 ? 0 : item.poolSolBalance || 0;
                // item.marketCap = item.marketCap || 0;
                return {
                    ...item,
                    currentTime: DateUtils.getInstance().getCurrTime(),
                    createdBy: transformedData[item.userId]?.username || '',
                    avatar: transformedData[item.userId]?.avatar || process.env.AVATAR,
                    badge: item.isOutside === 1 ? 4 : DataUtils.calculateValue(Number((item.poolSolBalance / 59 * 100)), item.quantity) || 1,
                    progressBar: item.isOutside === 1 ? '100%' : DataUtils.convertToPercentage(Number((item.poolSolBalance / 59 * 100))),// 进度条
                    marketCap: item.isOutside === 1 ? (1 / 4100000 * 1000000000).toFixed(10) : item.marketCap || 0,
                }
            })
            return new Result(ResultEnumCode.Succeed, result);
        } catch (error) {
            logger.error("代币详情查询错误", error);
            console.log(error);
            return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
        }
    }

    /**
     * initMint
     * @returns 
     */
    public async backMint() {
        try {
            const time = DateUtils.getInstance().getCurrTime();
            let whereClause = 'ts < NOW() - INTERVAL 6 HOUR AND state = 1';
            let usedrows = await this.mysql.selectWithPagination('token_key', ["*"], 1, 1, 'id', 'ASC', whereClause);
            if (usedrows && usedrows.length > 0) {
                logger.info('usedrows', usedrows);
                usedrows = DataUtils.removeFields(usedrows, ['private_key', 'state', 'ts']);
                await this.mysql.updateData(
                    'token_key',
                    `state = ?, ts = '${time}'`,
                    'id = ?',
                    [1, usedrows[0].id]
                ) as MySQL.RowDataPacket[];
                usedrows = DataUtils.toCamelCase(usedrows);
                logger.info('usedrows-succeed', usedrows[0]);
                return new Result(ResultEnumCode.Succeed, usedrows[0]);
            }
            let rows = await this.mysql.selectWhere(
                'token_key',
                ['*'], // 选择所有列
                ['state'], // 条件字段
                [0],
                1,
                1
            );
            logger.info('backMint-rows', rows);
            if (rows && rows.length > 0) {
                let initMintAccount = await this.retryInitMintAccount(rows[0].private_key);
                logger.info('backMint-initMintAccount', initMintAccount);
                console.log('initMintAccount:', initMintAccount);
                if (initMintAccount === '') {
                    logger.info('backMint-initMintAccount-isnull', initMintAccount);
                    return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ErrorInitMint);
                }
                // 将状态置为1
                await this.mysql.updateData(
                    'token_key',
                    `state = ?, ts = '${time}'`,
                    'id = ?',
                    [1, rows[0].id]
                ) as MySQL.RowDataPacket[];
                rows = DataUtils.removeFields(rows, ['private_key', 'state', 'ts']);
                rows = DataUtils.toCamelCase(rows);
                logger.info('backMint-initMintAccount-Succeed', rows[0]);
                return new Result(ResultEnumCode.Succeed, rows[0]);
            } else {
                logger.info('backMint-initMintAccount-error', rows);
                return (new Result(ResultEnumCode.ServerError, ResultEnumMsg.ErrorInitMint));
            }
        } catch (error) {
            logger.error("公钥查询错误", error);
            console.log(error);
            return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
        }
    }

    // 测试用
    public async backMintTest() {
        try {
            let rows = await this.mysql.selectWhere(
                'token_key',
                ['*'], // 选择所有列
                ['state'], // 条件字段
                [0],
                1,
                1
            );
            if (rows && rows.length > 0) {
                let initMintAccount = await this.retryInitMintAccount(rows[0].private_key);
                console.log('initMintAccount:', initMintAccount);
                rows = DataUtils.removeFields(rows, ['private_key', 'state']);
                await this.mysql.updateData(
                    'token_key',
                    'state = ?',
                    'id = ?',
                    [1, rows[0].id]
                ) as MySQL.RowDataPacket[];
                rows = DataUtils.toCamelCase(rows)
                return new Result(ResultEnumCode.Succeed, rows[0]);
            } else {
                return (new Result(ResultEnumCode.ServerError, ResultEnumMsg.ErrorInitMint));
            }
        } catch (error) {
            logger.error("公钥查询错误", error);
            console.log(error);
            return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
        }
    }
    /**
     * initMintAccount
     * @param privateKey 
     */
    public async initMintAccount(privateKey: number[]) {
        let authPdaAddress = process.env.AUTH_PDA_ADDRESS as string;
        let ENDPOINT = process.env.ENDPOINT as string;
        const mintAuth = new PublicKey(authPdaAddress)
        const mintPayer: Keypair = Keypair.fromSecretKey(Uint8Array.from(keys))
        const connection = new Connection(ENDPOINT, {
            commitment: 'finalized'
        })
        const mintKeypair: Keypair = Keypair.fromSecretKey(Uint8Array.from(privateKey));
        let initMintAccount
        try {
            initMintAccount = await createMint(
                connection,
                mintPayer,
                mintAuth,
                null,
                9,
                mintKeypair,
                { commitment: "finalized", maxRetries: 50, preflightCommitment: "finalized" } // 确认级别
            );
            console.log("initialized mint:", initMintAccount)
            return initMintAccount;
        } catch (error) {
            console.log("createMint failed:", error)
            return '';
        }
    }
    // 增加重试
    async retryInitMintAccount(privateKey: number[], maxRetries = 2, delay = 1000) {
        let attempt = 0;
        let initMintAccount;
        while (attempt < maxRetries) {
            try {
                initMintAccount = await this.initMintAccount(privateKey);
                // 如果成功，返回结果
                if (initMintAccount !== '') {
                    return initMintAccount;
                }
            } catch (error) {
                console.log(`Attempt ${attempt + 1} failed`);
            }
            // 等待指定的延迟时间后再重试
            await new Promise(resolve => setTimeout(resolve, delay));
            attempt++;
        }
        // 如果所有重试都失败了，返回空字符串
        return '';
    }
    /**
     * 评论列表
     * @param tokenId 代币id
     * @param userId 用户id
     * @param address 代币地址
     * @returns 
     */
    public async topicList(userId: string, tokenId: number, page: number, limit: number, orderBy: string = 'created_time', orderDirection: 'ASC' | 'DESC' = 'DESC') {
        // 查询这个代币下的评论和数量
        let rows = await this.mysql.selectWhere(
            'token_comments',
            ['*'], // 选择所有列
            ['token_id'], // 条件字段
            [tokenId],
            page,
            limit,
            orderBy,
            orderDirection,
            'like_count',
            'DESC'
        );
        if (rows.length === 0) return new Result(ResultEnumCode.Succeed, { total: 0, items: [] });
        const [counts] = await this.mysql.countRecords('token_comments', 'token_id', tokenId) as MySQL.RowDataPacket[];
        // 同时查询 comment_likes 表，判断当前用户是否对某条评论点过赞。
        const comments = await this.mysql.getCommentsWithLikes(tokenId, userId) as Array<{ [key: string]: any }>;

        // 通过userIds批量查询用户数据
        let userIds = [...new Set(rows.map(item => item.user_id))];
        let repliedUids = [...new Set(rows.map(item => item.replied_uid).filter(uid => uid))];
        let userInfo = await this.mysql.getUsersByIds(
            'user_details',
            userIds,
            ['id', 'user_id', 'username', 'avatar']
        ) as Array<{ [key: string]: any }>;
        let repliedUserInfo = await this.mysql.getUsersByIds(
            'user_details',
            repliedUids,
            ['id', 'user_id', 'username', 'avatar']
        ) as Array<{ [key: string]: any }>;
        // 数组组合
        let updatedArray = rows.map(item => {
            const isLike = comments.some(secondItem => secondItem.liked_by_user === 1 && secondItem.comment_id === item.id);
            const uInfo = userInfo.filter(subItem => subItem.user_id === item.user_id) as any;
            const rUInfo = repliedUserInfo.filter(subItem => subItem.user_id === item.replied_uid) as any;
            return {
                ...item,
                isLike,
                currentTime: DateUtils.getInstance().getCurrTime(),
                repliedUid: item.replied_uid || '',
                username: uInfo[0]?.username || '',
                avatar: uInfo[0]?.avatar || process.env.AVATAR,
                repliedUsername: rUInfo[0]?.username || '',
                repliedAvatar: rUInfo[0]?.avatar || process.env.AVATAR,
            };
        });

        let resultArray = DataUtils.toCamelCase(updatedArray);
        resultArray.forEach(item => {
            item.createdTime = DateUtils.formatDate(item.createdTime);
            item.updatedTime = DateUtils.formatDate(item.updatedTime);
            item.image = item.image || '';
        })
        const totalItems = counts?.count; // 总条数
        const pageSize = limit;   // 每页条数
        const lastPage = Math.ceil(totalItems / pageSize);
        if (page === lastPage) {
            resultArray = resultArray.slice(0, -1);
        }
        let res = {
            total: counts?.count - 1 || 0,
            items: resultArray
        };
        return new Result(ResultEnumCode.Succeed, res);
    }

    // 置顶评论
    public async topicListTop(userId: string, tokenId: number, page: number, limit: number, orderBy: string = 'created_time', orderDirection: 'ASC' | 'DESC' = 'DESC') {
        // 查询这个代币下的评论和数量
        let rows = await this.mysql.selectWhere(
            'token_comments',
            ['*'], // 选择所有列
            ['token_id'], // 条件字段
            [tokenId],
            1,
            1
        );
        if (rows.length === 0) return new Result(ResultEnumCode.Succeed, { total: 0, items: [] });
        // 通过userIds批量查询用户数据
        let userIds = [...new Set(rows.map(item => item.user_id))];
        let userInfo = await this.mysql.getUsersByIds(
            'user_details',
            userIds,
            ['id', 'user_id', 'username', 'avatar']
        ) as Array<{ [key: string]: any }>;
        // 数组组合
        let updatedArray = rows.map(item => {
            const uInfo = userInfo.filter(subItem => subItem.user_id === item.user_id) as any;
            return {
                ...item,
                currentTime: DateUtils.getInstance().getCurrTime(),
                repliedUid: item.replied_uid || '',
                username: uInfo[0]?.username || '',
                avatar: uInfo[0]?.avatar || process.env.AVATAR,
                repliedUsername: '',
                repliedAvatar: ''
            };
        });
        let resultArray = DataUtils.toCamelCase(updatedArray);
        resultArray.forEach(item => {
            item.createdTime = DateUtils.formatDate(item.createdTime);
            item.updatedTime = DateUtils.formatDate(item.updatedTime);
            item.image = item.image || '';
        })
        let res = resultArray[0];
        return new Result(ResultEnumCode.Succeed, res);
    }


    /**
     * 评论
     * @param userId 用户id
     * @param address 用户地址
     * @param tokenId 代币id
     * @param tokenAddress 代币地址
     * @param content 内容
     * @param image 图片
     * @returns 
     */
    public async topic(userId: string, tokenId: number, content: string, image: string) {
        // 验证用户id，代币id是否有效
        const [results] = await this.mysql.select('token_info', '\`id\`=?', [tokenId]) as MySQL.RowDataPacket[];
        if (results && results.length === 0) return new Result(ResultEnumCode.BadRequest);

        const time = DateUtils.getInstance().getCurrTime();
        let result = await this.mysql.insertRecord(
            'token_comments',
            ['token_id', 'user_id', 'comment', 'image', 'like_count', 'created_time', 'updated_time'],
            [tokenId, userId, content, image, 0, time, time]
        );

        let userInfo = await this.mysql.getUsersByIds(
            'user_details',
            [userId],
            ['id', 'user_id', 'username', 'avatar']
        ) as Array<{ [key: string]: any }>;

        // 数据格式化
        result.created_time = DateUtils.formatDate(result.created_time);
        result.updated_time = DateUtils.formatDate(result.updated_time);
        // result = DataUtils.removeFields(result, ['updated_time']); // 删除指定字段
        let resultArray = DataUtils.toCamelCase([result]); // 转为驼峰
        resultArray[0].isLike = false;
        resultArray[0].username = userInfo[0]?.username || '';
        resultArray[0].avatar = userInfo[0]?.avatar || process.env.AVATAR;
        return new Result(ResultEnumCode.Succeed, resultArray[0] || {});
    }


    /**
     * 代币持有者列表
     * @param userId 
     * @param tokenId 
     * @param page 
     * @param limit 
     * @returns 
     */
    public async holder(userId: string, tokenId: number, page: number, limit: number) {
        let rows = await this.mysql.selectWhere(
            'token_info',
            ['token_pda_address', 'pool_sol_balance', 'user_id', 'mint_pda_address'],
            ['id'], // 条件字段
            [tokenId]
        );
        // if (rows.length === 0) return new Result(ResultEnumCode.Succeed, { total: 0, items: [] }); // 该用户无购买代币记录
        // const [counts] = await this.mysql.countRecords('token_info', 'id', tokenId) as MySQL.RowDataPacket[];

        // // 通过userIds批量查询用户数据
        // let userIds = [...new Set(rows.map(item => item.user_id))];
        // let userInfo = await this.mysql.getUsersByIds(
        //     'user_details',
        //     userIds,
        //     ['id', 'user_id', 'username', 'avatar', 'address']
        // ) as Array<{ [key: string]: any }>;

        // // 数组组合
        // let updatedArray = rows.map(item => {
        //     const res = userInfo.filter(subItem => subItem.user_id === item.user_id) as any;
        //     return { ...item, address: res[0]?.address || '', username: res[0]?.username || '', avatar: res[0]?.avatar || '' };
        // });

        // let resultArray = DataUtils.toCamelCase(updatedArray);
        // // // 最终结果
        // let result: any = {
        //     total: counts?.count || 0,
        //     items: resultArray
        // };
        // result.items = result.items.map((item: any) => {
        //     return {
        //         ...item,
        //         poolSolBalance: DataUtils.convertToPercentage(Number(item.poolSolBalance)), // 转换为百分比
        //         value: (item.poolSolBalance * 48000).toFixed(2), // value
        //     }
        // })
        let mint_pda_address = rows[0]?.mint_pda_address || '';
        // let userIds = [...new Set(rows.map(item => item.user_id))];
        // let userInfo = await this.mysql.getUsersByIds(
        //     'user_details',
        //     userIds,
        //     ['id', 'user_id', 'address']
        // ) as Array<{ [key: string]: any }>;
        // let userAddress = userInfo[0].address;
        // let firstUserInfo = await this.mysql.selectWhere(
        //     'transactions',
        //     ['user_address', 'mint_pda_address'],
        //     ['mint_pda_address'],
        //     [mint_pda_address],
        //     1,
        //     1,
        //     'ts',
        //     'ASC'
        // );
        // let firstUserAddress = firstUserInfo[0]?.user_address;
        const connection = new Connection(process.env.ENDPOINT as string, {
            fetch: (url, options: any) => {
                return fetch(url, options);
            }
        })
        const totalTokens = 1000000000;
        try {
            let result = await connection.getTokenLargestAccounts(new PublicKey(mint_pda_address));
            // let res = await connection.getParsedAccountInfo(new PublicKey('JpuMnwpb1LRrV9cQ9twvPkmJyi1staDB4Lqbado4Cme')) as any;
            // let mintAuthority = res?.value?.data?.parsed?.info?.mintAuthority;
            // let decimals = res?.value?.data?.parsed?.info?.decimals;
            // const tokenNum = result.value.reduce((acc, curr) => {
            //     acc += curr.uiAmount || 0;
            //     return acc;
            // }, 0);
            let type = '';
            result.value = result.value.map(item => {
                // if (item.address === userAddress) type = 'createUser';
                // if (item.address === firstUserAddress) type = 'firstUser';
                return {
                    ...item,
                    accountPercentage: `${((Number((item.uiAmountString)) / totalTokens) * 100).toFixed(6)}%`,
                    // type,
                }
            })
            // let result = await connection.getBalanceAndContext(new PublicKey('r68TbRvWFUnhQsNk91JqotfZrxz8FtNoUCs43q6ABme'));
            return new Result(ResultEnumCode.Succeed, result);
        } catch (error) {
            return new Result(ResultEnumCode.Succeed, { context: {}, value: [] });
        }
        // let result = await this.fetchWithRetry(connection, mint_pda_address)
    }

    async fetchWithRetry(connection: any, mintPdaAddress: string) {
        const MAX_RETRIES = 1; // 最大重试次数
        const RETRY_DELAY = 1000; // 重试延迟时间（毫秒）
        let attempt = 0;
        while (attempt < MAX_RETRIES) {
            try {
                const result = await connection.getTokenLargestAccounts(new PublicKey(mintPdaAddress));
                return result;
            } catch (error) {
                attempt++;
                // console.error(`Attempt ${attempt} failed: ${error.message}`);
                if (attempt < MAX_RETRIES) {
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY)); // 等待重试
                } else {
                    return await connection.getTokenLargestAccounts(new PublicKey(mintPdaAddress));
                }
            }
        }
    }


    /**
     * 交易数据
     * @param userId 
     * @param tokenId 
     * @param page 
     * @param limit 
     * @returns 
     */
    public async trades(userId: string, tokenId: number, page: number, limit: number) {
        let [tokenInfo] = await this.mysql.selectWhere(
            'token_info',
            ['mint_pda_address', 'token_pda_address'],
            ['id'], // 条件字段
            [tokenId]
        );
        let rows = await this.mysql.getTransactionsInfo(tokenInfo.token_pda_address, page, limit) as any[];
        if (rows.length === 0) return new Result(ResultEnumCode.Succeed, { total: 0, items: [] }); // 该用户无购买代币记录
        const [counts] = await this.mysql.countRecords('transactions', 'token_pda_address', tokenInfo.token_pda_address) as MySQL.RowDataPacket[];

        await this.mysql.frequentTrans(); // 检测机器人数据并更新
        // await this.mysql.userBot(); // 查询并更新用户是否机器人

        // 通过user_address批量查询用户数据
        let userAddress = [...new Set(rows.map(item => item.user_address))];
        let userInfo = await this.mysql.getUsersByAddress(
            'user_details',
            userAddress,
            ['id', 'user_id', 'username', 'avatar', 'address', 'is_bot']
        ) as Array<{ [key: string]: any }>;

        // 数组组合
        let updatedArray = rows.map(item => {
            const res = userInfo.filter(subItem => subItem.address === item.user_address) as any;
            return {
                ...item,
                currentTime: DateUtils.getInstance().getCurrTime(),
                userId: res[0]?.user_id || '',
                isBot: res[0]?.is_bot || 0,
                address: res[0]?.address || '',
                username: res[0]?.username || res[0]?.address.slice(-6),
                avatar: res[0]?.avatar || process.env.AVATAR,
                frequent: item.frequent || 0,
                tx: item.signature,
            };
        });

        let resultArray = DataUtils.toCamelCase(updatedArray);
        resultArray = DataUtils.removeFields(resultArray, ['mintPdaAddress']); // 删除指定字段
        resultArray.forEach(item => {
            item.transactionTime = DateUtils.formatDate(item.ts)
        })
        // // 最终结果
        let res = {
            total: counts?.count || 0,
            items: resultArray
        };
        return new Result(ResultEnumCode.Succeed, res);
    }


    /**
     * k线图数据
     * @param tokenId 
     * @param page 
     * @param limit 
     * @returns 
     */
    public async kLine(tokenId: number, page?: number, limit?: number) {
        let [tokenInfo] = await this.mysql.selectWhere(
            'token_info',
            ['mint_pda_address', 'token_pda_address'],
            ['id'], // 条件字段
            [tokenId]
        );
        let token_pda_address = tokenInfo?.token_pda_address || '';
        let kLineDatas = await this.mysql.selectKlineData(token_pda_address) as any[];
        let tokenNum = 1000000000;
        const groupedData = kLineDatas.reduce((acc, item) => {
            // 获取每 day 的一个区间的时间
            // const date = new Date(item.transaction_date).toISOString().slice(0, 10); // 只保留日期部分
            // const key = `${date}_${item.token_pda_address}`;

            let transactionDate = new Date(item.transaction_time_slot);
            // 获取每 1 分钟一个区间的时间
            const minutes = Math.floor(transactionDate.getMinutes() / 1) * 1;
            // const minutes = Math.floor(transactionDate.getMinutes() / 15) * 15;
            transactionDate.setMinutes(minutes, 0, 0);  // 设置为对应的 1 分钟区间的开始时间
            const dateTimeSlot = transactionDate.toISOString(); // 获取 ISO 格式的时间，精确到分钟
            const key = `${dateTimeSlot}_${item.token_pda_address}`;
            if (!acc[key]) {
                acc[key] = {
                    // transaction_date: item.transaction_date,
                    transaction_date: dateTimeSlot,
                    token_pda_address: item.token_pda_address,
                    max_market_cap: parseFloat(item.max_market_cap) / tokenNum,
                    min_market_cap: parseFloat(item.min_market_cap) / tokenNum,
                    start_market_cap: parseFloat(item.start_market_cap) / tokenNum,
                    end_market_cap: parseFloat(item.end_market_cap) / tokenNum,
                    total_token_amount: 0 // 默认值
                };
            }
            // 可以在这里累加成交量
            if (item.total_token_amount !== null) {
                acc[key].total_token_amount += parseFloat(item.total_token_amount);
            }
            return acc;
        }, {});
        // for (const key in groupedData) {
        //     if (groupedData[key]?.token_pda_address) {
        //         await RedisUtils.getInstance().updateHashData(`token_${groupedData[key]?.token_pda_address}`, groupedData[key]?.transaction_date, groupedData[key]);
        //         console.log(`缓存更新完成: ${key} - ${groupedData[key]?.token_pda_address}`);
        //     }
        // }

        let resultArray = Object.values(groupedData) as any[];
        if (resultArray.length > 0) {
            resultArray[0].start_market_cap = 0.0000000222;
            resultArray[0].min_market_cap = 0.0000000222;
        }
        // 格式化为 K 线图所需的数据
        const kLineData = {
            t: [],
            o: [],
            h: [],
            l: [],
            c: [],
            v: [],
            s: "ok"
        } as any;
        resultArray.forEach(item => {
            kLineData.t.push(Math.floor(new Date(item.transaction_date).getTime()));
            kLineData.o.push(item.start_market_cap); // 开盘价
            kLineData.h.push(item.max_market_cap); // 最高价
            kLineData.l.push(item.min_market_cap); // 最低价
            kLineData.c.push(item.end_market_cap); // 收盘价
            // kLineData.v.push(item.total_token_amount); // 成交量
        });
        return new Result(ResultEnumCode.Succeed, kLineData);
    }

    // 从redis获取数据
    public async kLineLast(tokenId: number) {
        const kLineData = {
            t: [],
            o: [],
            h: [],
            l: [],
            c: [],
            v: [],
            s: "ok"
        } as any;
        let [tokenInfo] = await this.mysql.selectWhere(
            'token_info',
            ['mint_pda_address', 'token_pda_address'],
            ['id'], // 条件字段
            [tokenId]
        );
        let tokenPadAddress = tokenInfo?.token_pda_address || '';
        if (tokenPadAddress === '') return new Result(ResultEnumCode.Succeed, kLineData);
        let groupedData = await RedisUtils.getInstance().getAllHashFields(`token_${tokenPadAddress}`) as any;
        groupedData = Object.keys(groupedData).map((field) => ({
            timestamp: field, // 时间戳字段
            ...groupedData[field] // 其他数据
        }));
        groupedData.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const resultArray = Object.values(groupedData) as any[];
        resultArray.forEach(item => {
            kLineData.t.push(Math.floor(new Date(item.transaction_date).getTime() / 1000)); // 转换为秒
            kLineData.o.push(item.start_market_cap); // 开盘价
            kLineData.h.push(item.max_market_cap); // 最高价
            kLineData.l.push(item.min_market_cap); // 最低价
            kLineData.c.push(item.end_market_cap); // 收盘价
            // kLineData.v.push(item.total_token_amount); // 成交量
        });
        return new Result(ResultEnumCode.Succeed, kLineData);
    }

    /**
     * 推送最新交易数据 + 创建代币的数据
     * @param page 
     * @param limit 
     * @returns 
     */
    public async dealInfo(page: number, limit: number) {
        let where = [];

        if (limit === 1) {
            where.push(`ts >= NOW() - INTERVAL 14 SECOND`);
        } else {
            where.push(`ts >= NOW() - INTERVAL 1 DAY`);
        }
        let whereClause = where.length > 0 ? where.join(' AND ') : '';
        let results = await this.mysql.selectWithPagination('transactions',
            ["*"],
            page, limit, 'id', 'DESC', whereClause);

        let token_pda_addressIds = [...new Set(results.map(item => item.token_pda_address).filter(address => address !== ""))];
        let userAddress = [...new Set(results.map(item => item.user_address))];
        let userInfo = await this.mysql.getUsersByAddress(
            'user_details',
            userAddress,
            ['id', 'user_id', 'username', 'avatar', 'address']
        ) as Array<{ [key: string]: any }>;
        let tokenInfo = await this.mysql.getConditionByIds(
            'token_info',
            'token_pda_address',
            token_pda_addressIds,
            ['name', 'ticker', 'id', 'token_pda_address', 'image']
        ) as Array<{ [key: string]: any }>;
        results = DataUtils.removeFields(results, ['signature']);
        results = DataUtils.toCamelCase(results).map(item => {
            item.username = userInfo.find(subItem => item.userAddress === subItem.address)?.username || '';
            item.userId = userInfo.find(subItem => item.userAddress === subItem.address)?.user_id || '';
            item.avatar = userInfo.find(subItem => item.userAddress === subItem.address)?.avatar || process.env.AVATAR;
            item.ticker = tokenInfo.find(subItem => item.tokenPdaAddress === subItem.token_pda_address)?.ticker || '';
            item.name = tokenInfo.find(subItem => item.tokenPdaAddress === subItem.token_pda_address)?.name || '';
            item.image = tokenInfo.find(subItem => item.tokenPdaAddress === subItem.token_pda_address)?.image || '';
            item.id = tokenInfo.find(subItem => item.tokenPdaAddress === subItem.token_pda_address)?.id || '';
            return {
                ...item
            }
        })
        results = results.filter(subItem => subItem.id !== "") as any;
        if (limit > 1) {
            let where = [];
            where.push(`created_time >= NOW() - INTERVAL 1 DAY`);
            let whereClause = where.length > 0 ? where.join(' AND ') : '';
            let tokenInfoLast = await this.mysql.selectWithPagination('token_info', ["*"], page, limit, 'id', 'DESC', whereClause);
            if (tokenInfoLast.length > 0) {
                let userIds = [...new Set(tokenInfoLast.map(item => item.user_id))];
                let userInfo = await this.mysql.getUsersByIds(
                    'user_details',
                    userIds,
                    ['id', 'user_id', 'username', 'avatar']
                ) as Array<{ [key: string]: any }>;
                tokenInfoLast = DataUtils.toCamelCase(tokenInfoLast).map(item => {
                    item.transactionType = 'create';
                    item.avatar = userInfo.find(subItem => item.userId === subItem.user_id)?.avatar || process.env.AVATAR;
                    item.username = userInfo.find(subItem => item.userId === subItem.user_id)?.username || '';
                    results.unshift(item);
                })
            }
        }
        return new Result(ResultEnumCode.Succeed, results);
    }

    /**
     * 推送最新创建的代币
     * @param page 
     * @param limit 
     * @returns 
     */
    public async newToken(page: number, limit: number) {
        let results: any[] = []
        let where = [];
        where.push(`created_time >= NOW() - INTERVAL 1 DAY`);
        let whereClause = where.length > 0 ? where.join(' AND ') : '';
        let tokenInfoLast = await this.mysql.selectWithPagination('token_info', ["*"], page, limit, 'id', 'DESC', whereClause);
        if (tokenInfoLast.length > 0) {
            let userIds = [...new Set(tokenInfoLast.map(item => item.user_id))];
            let userInfo = await this.mysql.getUsersByIds(
                'user_details',
                userIds,
                ['id', 'user_id', 'username', 'avatar']
            ) as Array<{ [key: string]: any }>;
            tokenInfoLast = DataUtils.toCamelCase(tokenInfoLast).map(item => {
                item.transactionType = 'create';
                item.avatar = userInfo.find(subItem => item.userId === subItem.user_id)?.avatar || process.env.AVATAR;
                item.username = userInfo.find(subItem => item.userId === subItem.user_id)?.username || '';
                results.push(item);
            })
        }
        return new Result(ResultEnumCode.Succeed, results);
    }


    /**
     * k线图
     * @param userId 
     * @param tokenId 
     * @param page 
     * @param limit 
     * @returns 
     */
    public async kLine2(tokenId: number, page?: number, limit?: number) {
        let [tokenInfo] = await this.mysql.selectWhere(
            'token_info',
            ['mint_pda_address', 'token_pda_address'],
            ['id'], // 条件字段
            [tokenId]
        );
        let rows = await this.mysql.getTransactionsInfo(tokenInfo.token_pda_address, page, limit = 100) as any[];

        const kLineData = {
            t: [],
            o: [],
            h: [],
            l: [],
            c: [],
            v: [],
            s: "ok"
        } as any;
        // 将数据按天分组
        const groupedData: any = {};

        rows.forEach(entry => {
            const date = new Date(entry.ts).toISOString().split('T')[0]; // 获取日期（yyyy-mm-dd格式）

            if (!groupedData[date]) {
                groupedData[date] = [];
            }
            groupedData[date].push(entry);
        });
        const formatNumber = (num: any) => {
            // return parseFloat(num).toFixed(10); // 保留10位小数，视需要可调整
            return parseFloat(num)
        };
        // 计算每个时间段的 K 线数据
        for (const date in groupedData) {
            const entries: any[] = groupedData[date];
            const openPrice = formatNumber(entries[0].market_cap); // 开盘价
            const closePrice = formatNumber(entries[entries.length - 1].market_cap); // 收盘价
            const highPrice = formatNumber(Math.max(...entries.map(e => parseFloat(e.market_cap)))); // 最高价
            const lowPrice = formatNumber(Math.min(...entries.map(e => parseFloat(e.market_cap)))); // 最低价
            const volume = formatNumber(entries.reduce((sum, e) => sum + parseFloat(e.token_amount), 0)); // 成交量

            // 填充 K 线数据
            kLineData.t.push(new Date(date).getTime() / 1000); // 时间戳
            kLineData.o.push(openPrice);
            kLineData.h.push(highPrice);
            kLineData.l.push(lowPrice);
            kLineData.c.push(closePrice);
            // kLineData.v.push(volume);
        }
        return new Result(ResultEnumCode.Succeed, kLineData);
    }


    /**
     * 获取sql转美元系数
     * @returns 
     */
    public async sqlPrice() {
        let { solPrice } = await DataUtils.fetchSolPrice();
        return new Result(ResultEnumCode.Succeed, { solPrice });
    }

    /**
     * 推送最新数据
     * @param tokenId 
     * @returns 
     */
    public async pushTrans(tokenId: string) {
        let [tokenInfo] = await this.mysql.selectWhere(
            'token_info',
            ['mint_pda_address', 'token_pda_address'],
            ['id'], // 条件字段
            [tokenId]
        );
        let token_pda_address = tokenInfo?.token_pda_address || '';

        let whereClause = `token_pda_address = '${token_pda_address}'`;
        let results = await this.mysql.selectWithPagination('transactions', ["*"], 1, 2, 'id', 'DESC', whereClause);
        const kLineData = {
            t: [],
            o: [],
            h: [],
            l: [],
            c: [],
            v: [],
            s: "ok",
            r: "1"
        } as any;
        if (results.length > 0) {
            const date = new Date(results[0]?.ts);
            const timestamp = date.getTime();
            kLineData.t = [timestamp]
            kLineData.o = [Number(results[0].ave_pri)]
            kLineData.h = [Number(results[0].ave_pri)]
            kLineData.l = [Number(results[0].ave_pri)]
            kLineData.c = [Number(results[0].ave_pri)]
            // kLineData.v = [Number(results[0].token_amount)]
        }
        if (results.length === 1) {
            kLineData.o = [0.0000000222];
            kLineData.l = [0.0000000222];
        }
        return new Result(ResultEnumCode.Succeed, kLineData);
    }

    /**
     * 当前代币的最新价格
     * @param mintAddr 
     * @returns 
     */
    public async nowAvePri(mintAddr: string) {
        let rows = await this.mysql.selectWhere(
            'transactions',
            ['ave_pri'],
            ['mint_pda_address'], // 条件字段
            [mintAddr],
            1,
            1,
            'ts',
            'DESC'
        );
        rows = DataUtils.toCamelCase(rows);
        return new Result(ResultEnumCode.Succeed, rows[0] ? rows[0] : { "avePri": "0" });
    }
}

export default TokenService;
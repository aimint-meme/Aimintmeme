// import * as mysql from "mysql2"
import mysql, { Pool } from "mysql2/promise";
import DateUtils from "./DateUtils";
import { getLog } from "./LogUtils";
import MySQL from "mysql2/promise";

const logger = getLog('MySQLUtils');
class MySQLUtils {
    public connection: Pool;
    private static instance: MySQLUtils;
    public static getInstance() {
        if (!MySQLUtils.instance) {
            MySQLUtils.instance = new MySQLUtils();
        }
        return MySQLUtils.instance;
    }
    constructor() {
        this.connection = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        })
    }
    /***********************************************************数据插入*********************************************************** */
    async insert(table: string, fields: string, values: string) {
        return await this.connection.execute(
            `INSERT INTO ${table}(${fields}) VALUES(${values})`
        )
    }
    /**
     * 插入计算出带后缀地址的数据
     * @param public_key 
     * @param private_key 
     */
    async insertAddress(public_key: string, private_key: string) {
        return await this.connection.execute(
            `INSERT INTO address(\`public_key\`, \`private_key\`, \`create_time\`) VALUES('${public_key}', '${private_key}', '${DateUtils.getInstance().getCurrTime()}')`
        )
    }

    /**
     * 插入用户钱包数据
     * @param address 
     */
    async insertUserWallet(userId: string, address: string, signature: string) {
        const time = DateUtils.getInstance().getCurrTime();
        return await this.connection.execute(
            `INSERT INTO user_wallet(\`user_id\`,\`address\`, \`signature\`, \`create_time\`, \`connect_time\`) VALUES('${userId}','${address}', '${signature}','${time}', '${time}')`
        )
    }
    /**
     * 插入用户积分数据
     * @param address 
     */
    async insertUserCredits(wallet_id: number) {
        return await this.connection.execute(
            `INSERT INTO user_credits(\`wallet_id\`, \`credits\`, \`update_time\`) VALUES(${wallet_id}, ${0}, '${DateUtils.getInstance().getCurrTime()}')`
        )
    }

    /**
     * 插入用户钱包地址数据
     * @param address 
     * @returns 
     */
    async insertUserDetail(address: string) {
        return await this.connection.execute(
            `INSERT INTO user_details(\`address\`, \`created_time\`) VALUES('${address}', '${DateUtils.getInstance().getCurrTime()}')`
        )
    }

    /**
     * 插入热点数据数据
     * @param words 
     */
    async insertHotspot(words: string) {
        return await this.connection.execute(
            `INSERT INTO hotspot(\`words\`, \`create_time\`) VALUES('${words}', '${DateUtils.getInstance().getCurrTime()}')`
        )
    }
    /**
     * 插入用户创建的代币数据
     * @param address 
     * @param name 
     * @param symbol 
     * @param icon 
     * @param creator 
     */
    async insertToken(address: string, name: string, symbol: string, icon: string, creator: string) {
        return await this.connection.execute(
            `INSERT INTO token(\`address\`, \`name\`, \`symbol\`, \`icon\`, \`creator\`, \`create_time\`) VALUES('${address}', '${name}', '${symbol}', '${icon}', '${creator}', '${DateUtils.getInstance().getCurrTime()}')`
        )
    }
    /**
     * 插入已经上链的代币数据
     * @param token_id 
     * @param owner 
     */
    async insertTokenOnline(token_id: number, owner: string) {
        return await this.connection.execute(
            `INSERT INTO token_online(\`token_id\`, \`owner\`, \`create_time\`) VALUES(${token_id}, '${owner}', '${DateUtils.getInstance().getCurrTime()}')`
        )
    }
    /**
     * 插入代币市值
     * @param token_id 
     * @param value 
     */
    async insertTokenMarketValue(token_id: number, value: number) {
        return await this.connection.execute(
            `INSERT INTO token_market_value(\`token_id\`, \`value\`, \`update_time\`) VALUES(${token_id}, ${value}, '${DateUtils.getInstance().getCurrTime()}')`
        )
    }
    /**
     * 插入拉新奖励积分
     * @param credits_id 
     * @param new_user_wallet_id 
     * @param reward 
     */
    async insertUserRewardInvitedUser(credits_id: number, new_user_wallet_id: number, reward: number) {
        return await this.connection.execute(
            `INSERT INTO user_reward_invited_user(\`credits_id\`, \`new_user_wallet_id\`, \`reward\`, \`create_time\`) VALUES(${credits_id}, ${new_user_wallet_id}, ${reward}, '${DateUtils.getInstance().getCurrTime()}')`
        )
    }

    /**
     * 数据插入（通用）
     * @param table 表名
     * @param columns 列
     * @param values 值
     * @returns 
     */
    async insertRecord(table: string, columns: string[], values: any[], uniqueColumns: string[] = []) {
        // 验证输入参数
        if (!table || !columns || !values || columns.length !== values.length) {
            throw new Error('表名、列名和值都是必需的，且列名和值的数量必须一致');
        }
        if (uniqueColumns.length > 0) {
            const checkSql = `SELECT COUNT(*) as count FROM ${table} WHERE ${uniqueColumns.map(col => `${col} = ?`).join(' AND ')}`;
            const [checkResult] = await this.connection.execute(checkSql, uniqueColumns.map(col => values[columns.indexOf(col)])) as any;
            const count = (checkResult[0] as any).count;
            if (count > 0) {
                throw new Error(`记录已存在，违反唯一性约束: ${uniqueColumns.join(', ')}`);
            }
        }
        const placeholders = columns.map(() => '?').join(', ');
        const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
        try {
            const [result] = await this.connection.execute(sql, values);
            if ('insertId' in result) {
                // 根据 insertId 查询插入的完整记录
                const selectSql = `SELECT * FROM ${table} WHERE id = ?`;
                const [rows] = await this.connection.execute(selectSql, [(result as any).insertId]) as Array<{ [key: string]: any }>;
                // 返回插入的那条完整记录
                if (rows.length > 0) {
                    logger.info('insertRecord', table, rows);
                    return rows[0];  // 返回第一条匹配的记录（通常应该只有一条）
                } else {
                    throw new Error('无法查询到插入的记录');
                }
            } else {
                throw new Error('插入失败');
            }
        } catch (error) {
            console.error('插入数据时出错:', error);
            logger.error('插入数据时出错', table, error);
            throw error;
        }
    }


    // 交易数据存储
    async insertRecordTransInfo(table: string, columns: string[], values: any[], uniqueField?: string) {
        // 验证输入参数
        if (!table || !columns || !values || columns.length !== values.length) {
            throw new Error('表名、列名和值都是必需的，且列名和值的数量必须一致');
        }
        if (uniqueField) {
            const uniqueIndex = columns.indexOf(uniqueField);
            if (uniqueIndex !== -1) {
                const uniqueValue = values[uniqueIndex];
                const checkSql = `SELECT COUNT(*) AS count FROM ${table} WHERE ${uniqueField} = ?`;
                const [checkResult] = await this.connection.execute(checkSql, [uniqueValue]) as any;
                if (checkResult[0].count > 0) {
                    return { id: 1 };
                }
            }
        }
        const placeholders = columns.map(() => '?').join(', ');
        const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
        try {
            const [result] = await this.connection.execute(sql, values);
            if ('insertId' in result) {
                // 根据 insertId 查询插入的完整记录
                const selectSql = `SELECT * FROM ${table} WHERE id = ?`;
                const [rows] = await this.connection.execute(selectSql, [(result as any).insertId]) as Array<{ [key: string]: any }>;
                // 返回插入的那条完整记录
                if (rows.length > 0) {
                    console.log('insert->', table);
                    logger.info('insert->', table);
                    logger.info('insertRecordTransInfo', table, rows);
                    return rows[0];  // 返回第一条匹配的记录（通常应该只有一条）
                } else {
                    return { id: 0 };
                }
            } else {
                return { id: 0 };
            }
        } catch (error) {
            console.error('插入数据时出错:', error);
            return { id: 0 };
        }
    }


    /***********************************************************数据更新*********************************************************** */
    async update(table: string, set: string, where: string, value: any) {
        return await this.connection.execute(
            `UPDATE ${table} SET ${set} WHERE ${where}`,
            value
        )
    }

    /**
     * 根据监听到的代币交易信息，更新市值等字段
     * @param updates 
     * @returns 
     */
    async updateMultipleFieldsAsync(mintAddr: string, updates: any) {
        const sql = `
        UPDATE \`token_info\`
        SET 
            \`token_pda_address\` = ?,
            \`pool_sol_balance\` = ?,
            \`ave_pri\` = ?,
            \`token_amount\` = ?,
            \`market_cap\` = ?,
            \`updated_time\` = ?
        WHERE 
            \`mint_pda_address\` = ?;
    `;
        const params = [
            updates?.tokenVaultAddr || '',
            updates?.poolSolBalance || 0,
            updates?.avePri || 0,
            updates?.tokenAmount || 0,
            updates?.marketCap || 0,
            updates?.updatedTime || 0,
            mintAddr
        ];
        console.log('update_token_info->', updates?.tokenVaultAddr);
        logger.info('updateMultipleFieldsAsync', params, updates?.tokenVaultAddr);
        try {
            const result = await this.connection.execute(sql, params);
            return result;
        } catch (error) {
            console.error('Error executing update:', error);
            throw error;
        }
    }

    async updateMultipleFieldsAsyncByTokenId(tokenId: string, updates: any) {
        const sql = `
        UPDATE \`token_info\`
        SET 
            \`token_pda_address\` = ?,
            \`pool_sol_balance\` = ?,
            \`ave_pri\` = ?,
            \`token_amount\` = ?,
            \`market_cap\` = ?
        WHERE 
            \`id\` = ?;
    `;
        const params = [
            updates?.tokenVaultAddr || '',
            updates?.poolSolBalance || 0,
            updates?.avePri || 0,
            updates?.tokenAmount || 0,
            updates?.marketCap || 0,
            tokenId
        ];
        try {
            const result = await this.connection.execute(sql, params);
            return result;
        } catch (error) {
            console.error('Error executing update:', error);
            throw error;
        }
    }

    // 更新token_key表的status状态为2
    async updateMultipleKeysAsync(mintAddr: string, updates: any) {
        const sql = `
        UPDATE \`token_key\`
        SET 
            \`state\` = ?,
            \`ts\` = ?
        WHERE 
            \`public_key\` = ?;
    `;
        const params = [
            2,
            DateUtils.convertToMySQLDateTime(Number(updates?.ts) * 1000),
            mintAddr
        ];
        try {
            logger.info('updateMultipleKeysAsync', params);
            const result = await this.connection.execute(sql, params);
            return result;
        } catch (error) {
            console.error('Error executing update:', error);
            throw error;
        }
    }

    /**
     * 数据更新
     * @param table 
     * @param set 
     * @param where 
     * @param value 
     * @returns 
     */
    async updateData(table: string, set: string, where: string, value: any) {
        const cleanedValues = value.map((v: any) => v === undefined ? null : v);
        const query = `UPDATE ${table} SET ${set} WHERE ${where}`;
        return await this.connection.execute(query, cleanedValues);
    }

    async updateData2(table: string, set: string, where: string, values: any) {
        const cleanedValues = values.map((v: any) => v === undefined ? null : v);
        try {
            // 执行更新操作
            const updateQuery = `UPDATE ${table} SET ${set} WHERE ${where}`;
            await this.connection.execute(updateQuery, cleanedValues);
            const selectQuery = `SELECT * FROM ${table} WHERE ${where}`;
            const [updatedRows] = await this.connection.execute(selectQuery, cleanedValues.slice(-1));
            return updatedRows;
        } catch (error) {
            console.error('更新操作失败:', error);
            throw new Error('更新数据时出错'); // 抛出自定义错误
        }
    }

    /**
     * 更新数据
     * @param table 
     * @param setFields 
     * @param whereConditions 
     * @returns 
     */
    async updateDataInfo(
        table: string,
        setFields: { [key: string]: any },
        whereConditions: { [key: string]: any }
    ): Promise<{ affectedRows: number, changedRows: number }> {
        const setString = Object.keys(setFields)
            .map((field) => {
                // 如果字段值是字符串且包含运算符，直接使用
                const value = setFields[field];
                return typeof value === 'string' && value.includes('+')
                    ? `${field} = ${value}`
                    : `${field} = ?`;
            })
            .join(', ');

        const whereString = Object.keys(whereConditions)
            .map((field) => `${field} = ?`)
            .join(' AND ');

        const values = Object.values(whereConditions);
        const sql = `UPDATE ${table} SET ${setString} WHERE ${whereString}`;
        const params = [
            ...Object.values(setFields).filter(value => !(typeof value === 'string' && value.includes('+'))),
            ...values,
        ];
        try {
            const [result]: any = await this.connection.execute(sql, params);
            const { affectedRows, changedRows } = result;
            return { affectedRows, changedRows };
        } catch (error) {
            console.error('更新时出错:', error);
            throw error;
        }
    }

    /**
     * 批量or全部更新数据 后台管理系统
     * @param table 
     * @param ids 
     * @param newStatus 
     * @returns 
     */
    async updateStatus(
        table: string,
        ids: number[] | string[],
        newStatus: any
    ): Promise<{ affectedRows: number }> {
        if (ids.length === 0) {
            throw new Error('没有提供要更新的 ID');
        }

        let sql: string;
        let values: any[];
        if (ids[0] === 'all' || ids[0] === 0) {
            // 全部更新
            sql = `UPDATE ${table} SET status = ?`;
            values = [newStatus];
        } else {
            // 批量更新
            const idPlaceholders = ids.map(() => '?').join(',');
            sql = `UPDATE ${table} SET status = ? WHERE id IN (${idPlaceholders})`;
            values = [newStatus, ...ids];
        }

        try {
            const [result]: any = await this.connection.execute(sql, values);
            const { affectedRows } = result;
            return { affectedRows };
        } catch (error) {
            console.error('更新状态时出错:', error);
            throw error;
        }
    }



    /***********************************************************数据查询*********************************************************** */
    /**
     * 查询
     * @param table 表名
     * @param field 需要查询的字段 （id = ?)
     * @param value 查询字段的匹配数据[1]
     */
    async select(table: string, field: string, value: any) {
        return await this.connection.execute(
            `SELECT * FROM ${table} WHERE ${field}`,
            value
        )
    }

    async selectOrderby(table: string) {
        let [rows] = await this.connection.execute(
            `SELECT * FROM ${table} ORDER BY id DESC LIMIT 1`
        )
        return rows;
    }

    async selectOrderbyTime(table: string) {
        let [rows] = await this.connection.execute(
            `SELECT *
                FROM ${table}
                WHERE id < (
                    SELECT id
                    FROM ${table}
                    WHERE ts >= NOW() - INTERVAL 65 MINUTE
                    ORDER BY id ASC
                    LIMIT 1
                )
                ORDER BY id DESC
                LIMIT 1;`
        )
        return rows;
    }

    /**
     * 模糊搜索
     * @param table 
     * @param fields 
     * @param searchTerm 
     * @returns 
     */
    async searchByField(
        table: string,
        fields: string[],
        searchTerm: string,
        page: number = 1,
        pageSize: number = 10
    ) {
        let conditions = '';
        let values: string[] = [];
        if (searchTerm) {
            conditions = fields.map(field => `${field} LIKE ?`).join(' OR ');
            const searchQuery = `%${searchTerm}%`;
            values = Array(fields.length).fill(searchQuery);  // 创建一个与 fields 长度相同的数组
        } else {
            conditions = '1';  // 1 是一个永远为 true 的条件，用来查询所有记录
        }
        const offset = (page - 1) * pageSize;

        const sql = `SELECT * FROM ${table} WHERE ${conditions} ORDER BY market_cap DESC LIMIT ${pageSize} OFFSET ${offset}`;

        const [items] = await this.connection.execute(sql, [...values]);
        // 获取总匹配数量
        const countSql = `SELECT COUNT(*) AS total FROM ${table} WHERE ${conditions}`;
        const [countRows] = await this.connection.execute(countSql, values) as MySQL.RowDataPacket[];
        const total = countRows[0].total;
        return {
            total,
            items
        };

    }

    /**
     * 查询（通用）
     * @param table 
     * @param columns 
     * @param conditions 
     * @param values 
     * @returns 
     */
    async selectWhere(
        table: string,
        columns: string[],
        conditions: string[],
        values: any[],
        page?: number,// 可选的 page 参数
        limit?: number,  // 可选的 limit 参数
        // excludeUids?: number[],  // 新增参数，排除的 UID 数组
        orderBy?: string, // 新增参数，排序字段
        orderDirection?: 'ASC' | 'DESC', // 新增参数，排序方向
        orderBy2?: string,
        orderDirection2?: 'ASC' | 'DESC',
    ): Promise<any[]> {
        if (conditions.length !== values.length) {
            throw new Error('列名、条件名和值的数量必须一致');
        }
        const conditionString = conditions.map((condition) => `${condition} = ?`).join(' AND ');
        let sql = `SELECT ${columns.join(', ')} FROM ${table} WHERE ${conditionString}`;
        // 处理排除 UID 的逻辑
        // if (excludeUids && excludeUids.length > 0) {
        //     const placeholders = excludeUids.map(() => '?').join(', ');
        //     sql += ` AND followed NOT IN (${placeholders})`;
        //     values.push(...excludeUids);  // 将排除的 UID 添加到 values 数组中
        // }
        if (orderBy && !orderBy2) {
            const direction = orderDirection || 'DESC';
            sql += ` ORDER BY ${orderBy} ${direction}`;
        }
        if (orderBy && orderBy2) {
            const direction2 = orderDirection2 || 'DESC';
            sql += ` ORDER BY DATE_FORMAT(${orderBy}, '%Y-%m-%d %H') ${direction2}, ${orderBy2} ${orderDirection2}, id DESC `;
        }
        if (limit && page) {
            const offset = (page - 1) * limit;
            sql += ` LIMIT ${limit} OFFSET ${offset}`;
        } else if (limit) {
            sql += ` LIMIT ${limit}`;  // 如果只有 limit，则只添加 LIMIT
        }
        try {
            const [rows] = await this.connection.execute(sql, values);
            return rows as any[];
        } catch (error) {
            console.error('查询时出错:', error);
            throw error;
        }
    }

    /**
     * 
     * @param userId 
     * @returns 
     */
    async getRandomUnfollowedUsers(userId: string, limit: number) {
        const sql = `
            SELECT ud.username, ud.avatar, ud.user_id,
                (SELECT COUNT(*) FROM follows f2 WHERE f2.followed = ud.user_id) AS follower_count
            FROM user_details ud
            LEFT JOIN follows f ON f.followed = ud.user_id AND f.follower = ?
            WHERE f.follower IS NULL AND ud.user_id != ?
            ORDER BY RAND()
            LIMIT ${limit}
        `;
        const [rows] = await this.connection.execute(sql, [userId, userId]);
        return rows;
    };


    // 查询交易记录
    async getTransactionsInfo(token_pda_address: string, page?: number, limit?: number) {
        // let sql = `SELECT 
        //     t.id,
        //     t.pool_sol_balance,
        //     t.user_address,
        //     t.ave_pri,
        //     t.market_cap,
        //     t.ts,
        //     t.mint_pda_address,
        //     t.token_pda_address,
        //     t.transaction_type,
        //     t.frequent,
        //     ta.token_amount,
        //     ta.sol_amount,
        //     tx.tx
        // FROM 
        //     transactions t
        // JOIN 
        //     token_transactions_amounts ta ON t.id = ta.transaction_id
        // JOIN 
        //     token_tx tx ON t.id = tx.transaction_id
        // WHERE 
        //     t.token_pda_address = ? ORDER BY ts DESC`;
        let sql = `SELECT 
            id,
            pool_sol_balance,
            user_address,
            ave_pri,
            market_cap,
            ts,
            mint_pda_address,
            token_pda_address,
            transaction_type,
            frequent,
            token_amount,
            sol_amount,
            signature
        FROM 
            transactions
        WHERE 
            token_pda_address = ? ORDER BY ts DESC`;
        if (limit && page) {
            const offset = (page - 1) * limit;
            sql += ` LIMIT ${limit} OFFSET ${offset}`;
        } else if (limit) {
            sql += ` LIMIT ${limit}`;  // 如果只有 limit，则只添加 LIMIT
        }
        const [rows] = await this.connection.execute(sql, [token_pda_address]);
        return rows as any;
    };


    //  获取总交易量
    async getAmountSum(token_pda_address: string, page?: number, limit?: number) {
        const sql = `
            SELECT 
                SUM(tam.sol_amount) AS total_sol_amount
            FROM 
                token_transactions_amounts tam
            JOIN 
                transactions t ON tam.transaction_id = t.id
            WHERE 
                t.token_pda_address = ?;
        `;
        const [rows] = await this.connection.execute(sql, [token_pda_address]);
        // const totalSolAmount = rows[0]?.total_sol_amount || 0;
        return rows as any;
    };


    // 获取n小时内交易量
    async getAmountSumByTime(token_pda_address: string, time?: number, page?: number, limit?: number) {
        const sql = `
            SELECT 
                SUM(tam.sol_amount) AS total_sol_amount
            FROM 
                token_transactions_amounts tam
            JOIN 
                transactions t ON tam.transaction_id = t.id
            WHERE 
                t.token_pda_address = ?
                AND t.ts >= NOW() - INTERVAL ${time} HOUR;
        `;
        const [rows] = await this.connection.execute(sql, [token_pda_address]);
        return rows as any;
    };

    // 批量获取SUM(sol_amount)
    async getAmountSumBatch(tokenPdaAddresses: string[]) {
        if (tokenPdaAddresses.length === 0) return [];
        const placeholders = tokenPdaAddresses.map(() => '?').join(', ');
        const sql = `
            SELECT 
                token_pda_address,
                SUM(sol_amount) AS volume,
                SUM(
                    CASE 
                        WHEN transaction_type = 'buy' THEN token_amount 
                        WHEN transaction_type = 'sell' THEN -token_amount 
                        ELSE 0 
                    END
                ) AS token_amount
            FROM 
                transactions
            WHERE 
                token_pda_address IN (${placeholders})
            GROUP BY 
                token_pda_address;
        `;
        const [rows] = await this.connection.execute(sql, tokenPdaAddresses);
        return rows as any;
    };

    // 批量跟新代币表中的volume
    async updateTokenVolumes(data: { token_pda_address: string; volume: string; token_amount: string; quantity: number; holders: number }[]): Promise<{ affectedRows: number }> {
        if (data.length === 0) {
            return { affectedRows: 0 };
        }
        const caseVolumeClauses: string[] = [];
        const caseQuantityClauses: string[] = [];
        const caseHoldersClauses: string[] = [];
        const caseTokenAmountClauses: string[] = [];
        const values: any[] = [];
        data.forEach(item => {
            caseVolumeClauses.push(`WHEN token_pda_address = ? THEN ?`);
            values.push(item.token_pda_address, item.volume);
        });
        data.forEach(item => {
            caseQuantityClauses.push(`WHEN token_pda_address = ? THEN ?`);
            values.push(item.token_pda_address, item.quantity);
        });
        data.forEach(item => {
            caseHoldersClauses.push(`WHEN token_pda_address = ? THEN ?`);
            values.push(item.token_pda_address, item.holders);
        });
        data.forEach(item => {
            caseTokenAmountClauses.push(`WHEN token_pda_address = ? THEN ?`);
            values.push(item.token_pda_address, item.token_amount);
        });
        const sql = `
            UPDATE token_info 
            SET 
                volume = CASE ${caseVolumeClauses.join(' ')}
                    ELSE volume
                END,
                quantity = CASE ${caseQuantityClauses.join(' ')}
                    ELSE quantity
                END,
                holders = CASE ${caseHoldersClauses.join(' ')}
                    ELSE holders
                END,
                token_amount = CASE ${caseTokenAmountClauses.join(' ')}
                    ELSE token_amount
                END
            WHERE token_pda_address IN (${data.map(() => '?').join(',')});
        `;
        values.push(...data.map(item => item.token_pda_address));
        try {
            const [result]: any = await this.connection.execute(sql, values);
            const { affectedRows } = result;
            return { affectedRows };
        } catch (error) {
            console.error('更新 volume 时出错:', error);
            return { affectedRows: 0 };
        }
    }

    // 查询-后台（筛选）
    async queryWithFilters(
        tableName: string,
        filters: Record<string, any>, // 查询条件
        limit: number = 10,
        page: number = 1
    ): Promise<{ rows: any[]; total: number }> {
        const offset = (page - 1) * limit;
        let conditions: string[] = [];
        let values: (string | number | Date)[] = [];

        // 动态构建查询条件
        Object.keys(filters).forEach((key) => {
            if (filters[key] !== undefined && filters[key] !== null) {
                if (typeof filters[key] === 'string' && filters[key].includes('%')) {
                    // 模糊查询
                    conditions.push(`${key} LIKE ?`);
                    values.push(filters[key]);
                } else if (key === 'startDate') {
                    // 时间范围查询 (开始时间)
                    conditions.push('created_time >= ?');
                    values.push(new Date(filters[key]));
                } else if (key === 'endDate') {
                    // 时间范围查询 (结束时间)
                    conditions.push('created_time <= ?');
                    values.push(new Date(filters[key]));
                } else if (key === 'source') {
                    conditions.push(`JSON_CONTAINS(source, '${JSON.stringify([filters[key]])}')`);
                } else {
                    // 精确匹配
                    conditions.push(`${key} = ?`);
                    values.push(filters[key]);
                }
            }
        });

        // 基础 SQL 查询语句
        let sqlQuery = `SELECT * FROM ${tableName}`;
        let countQuery = `SELECT COUNT(*) AS total FROM ${tableName}`;

        // 如果有查询条件，拼接 WHERE 子句
        if (conditions.length > 0) {
            const whereClause = ` WHERE ${conditions.join(' AND ')}`;
            sqlQuery += whereClause;
            countQuery += whereClause;
        }
        sqlQuery += ` ORDER BY created_time DESC LIMIT ${limit} OFFSET ${offset}`;
        try {
            const [rows] = await this.connection.execute(sqlQuery, values);
            const [totalResult] = await this.connection.execute(countQuery, values); // 不需要分页的参数
            const total = (totalResult as any)[0].total;
            return {
                total: total as number,
                rows: rows as any[]
            };
        } catch (error: any) {
            return {
                total: 0,
                rows: []
            };
        }
    }


    /**
     * 随机查询
     * @param table 
     * @param limit 
     * @returns 
     */
    async getRandomRecordsWithExclusions(table: string, fields: string[], excludeIds: string[], limit: number = 1): Promise<any[]> {
        const fieldList = fields.join(', '); // 将字段数组转换为字符串，供SQL使用
        if (excludeIds.length === 0) {
            const query = `SELECT ${fieldList} FROM ${table} ORDER BY RAND() LIMIT ?`;
            const [rows] = await this.connection.execute(query, [limit]);
            return rows as any[];
        } else {
            const placeholders = excludeIds.map(() => '?').join(',');
            const query = `SELECT ${fieldList} FROM ${table} WHERE user_id NOT IN (${placeholders}) ORDER BY RAND() LIMIT ${limit}`;
            const [rows] = await this.connection.execute(query, [...excludeIds]);
            return rows as any[];
        }
    }
    /**
     * 查询数据（通用）
     * @param table 
     * @param page 
     * @param limit 
     * @returns 
     */
    async selectWithPagination(
        table: string,
        fields: string[],
        page: number,
        limit: number,
        orderBy: string = 'id',
        orderDirection: 'ASC' | 'DESC' = 'DESC',
        where?: string, // 可选的筛选条件
        params?: any[] // 筛选条件的参数
    ) {
        const fieldList = fields.join(', ');
        const offset = (page - 1) * limit; // 计算偏移量
        let query = `SELECT ${fieldList} FROM ${table}`;
        // 如果有筛选条件，则添加 WHERE 子句
        if (where && where.trim() !== "") {
            query += ` WHERE ${where}`;
        }
        query += ` ORDER BY ${orderBy} ${orderDirection} LIMIT ${limit} OFFSET ${offset}`;
        const finalParams = [...(params || [])];
        let [rows] = await this.connection.execute(query, finalParams);
        return rows as any[];
    }

    /**
     * 查询数据count（通用）
     * @param table 
     * @param where 
     * @param params 
     * @returns 
     */
    async getCount(table: string, where?: string, params?: any[]) {
        let query = `SELECT COUNT(*) as count FROM ${table}`;
        if (where && where.trim() !== "") {
            query += ` WHERE ${where}`;
        }
        const finalParams = params || [];
        let [rows] = await this.connection.execute(query, finalParams);
        return rows;
    }

    /**
     * 查询数量（通用）
     * @param table 
     * @returns 
     */
    async countRecords(table: string, field?: string, value?: any) {
        if (field && value !== undefined) {
            let [rows] = await this.connection.execute(
                `SELECT COUNT(*) AS count FROM ${table} WHERE ${field} = ?`,
                [value]
            );
            return rows;
        } else {
            let [rows] = await this.connection.execute(
                `SELECT COUNT(*) AS count FROM ${table}`
            );
            return rows;
        }
    }

    // 批量查询代币交易数量
    async countRecords2(table: string, field: string, values?: any, groupByField?: string) {
        let query = `SELECT ${field}, COUNT(*) AS count FROM ${table}`;
        const params: any[] = [];
        if (field && values && values.length > 0) {
            const placeholders = values.map(() => '?').join(',');
            query += ` WHERE ${field} IN (${placeholders})`;
            params.push(...values);
        }

        if (groupByField) {
            query += ` GROUP BY ${groupByField}`;
        }
        const [rows] = await this.connection.execute(query, params);
        return rows;
    }

    async countUserAddressesByToken(token_pda_addressIds: string[]) {
        if (token_pda_addressIds.length === 0) return [];
        const ids = token_pda_addressIds.map(id => `'${id}'`).join(", ");
        const query = `
            SELECT 
                token_pda_address, 
                COUNT(DISTINCT user_address) AS count
            FROM 
                transactions
                WHERE 
                    token_pda_address IN (${ids})
            GROUP BY 
                token_pda_address;`
        const [rows] = await this.connection.execute(query);
        return rows;
    }

    async getFollowerCountsByFollowed(followedIds: string[]) {
        if (followedIds.length === 0) {
            return [];
        }
        const placeholders = followedIds.map(() => '?').join(',');  // 为 SQL 查询创建占位符

        const query = `
            SELECT followed, COUNT(*) AS follower_count
            FROM follows
            WHERE followed IN (${placeholders})
            GROUP BY followed
        `;
        const rows = await this.connection.execute(query, followedIds);
        return rows;
    }

    /**
     * 查询热点数据
     * @param table 表名
     * @param field 字段名
     * @param value 字段值
     * @param orderBy 排序字段名
     * @param sort 排序方式
     * @param limit 数量
     * @returns 
     */
    async selectHotSpot(
        table: string,
        orderBy: string,
        sort: 'ASC' | 'DESC',  // 仅允许 'ASC' 或 'DESC'
        limit: number,         // 保持为 number 类型
        field?: string,
        value?: any
    ) {
        let query = `SELECT * FROM ${table}`;
        // 仅在 field 和 value 存在时添加 WHERE 子句
        if (field && value !== undefined && value !== null && value !== "") {
            query += ` WHERE ${field} = '${value}'`;
        }
        query += ` ORDER BY ${orderBy} ${sort} LIMIT ${limit};`;
        let [rows] = await this.connection.execute(query);
        return rows;
    }

    /**
     * k线数据
     * @param token_pda_address 
     * @returns 
     */
    async selectKlineData(token_pda_address: string) {
        const query = `SELECT 
            token_pda_address,
            transaction_time_slot,
            IFNULL(@start_market_cap, start_market_cap) AS start_market_cap,
            max_market_cap,
            min_market_cap,
            end_market_cap,
            total_token_amount,
            @start_market_cap := end_market_cap AS new_end_market_cap
        FROM (
            SELECT 
                token_pda_address,
                FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(ts) / 60) * 60) AS transaction_time_slot,
                MAX(market_cap) AS max_market_cap,
                MIN(market_cap) AS min_market_cap,
                SUBSTRING_INDEX(GROUP_CONCAT(market_cap ORDER BY ts), ',', 1) AS start_market_cap,
                SUBSTRING_INDEX(GROUP_CONCAT(market_cap ORDER BY ts DESC), ',', 1) AS end_market_cap,
                SUM(token_amount) AS total_token_amount
            FROM 
                transactions
            WHERE 
                token_pda_address = '${token_pda_address}'
                AND market_cap > 0
            GROUP BY 
                transaction_time_slot, token_pda_address
            ORDER BY 
                transaction_time_slot
        ) AS sorted_data
        CROSS JOIN (SELECT @start_market_cap := NULL) AS init_vars 
        ORDER BY 
            transaction_time_slot;
            `;
        let [rows] = await this.connection.execute(query);
        return rows as any;
    }


    async selectKlineData2() {
        let query = `SELECT 
            DATE(ts) AS date,
            token_pda_address,
            MAX(market_cap) AS max_market_cap,
            MIN(market_cap) AS min_market_cap,
            SUBSTRING_INDEX(GROUP_CONCAT(market_cap ORDER BY ts ASC), ',', 1) AS start_market_cap,
            SUBSTRING_INDEX(GROUP_CONCAT(market_cap ORDER BY ts DESC), ',', 1) AS end_market_cap
        FROM 
            transactions
        GROUP BY 
            DATE(ts), token_pda_address
        ORDER BY 
            date, token_pda_address`
        let [rows] = await this.connection.execute(query);
        return rows as any;
    }


    // 更新频繁交易的数据为1
    async frequentTrans() {
        let query = `UPDATE 
                transactions t1
            JOIN 
                transactions t2
            ON 
                t1.user_address = t2.user_address               -- 同一用户
                AND t1.id <> t2.id                              -- 不同记录
                AND t1.ts < t2.ts                               -- 前一笔交易发生在后一笔之前
                AND TIMESTAMPDIFF(SECOND, t1.ts, t2.ts) <= 5    -- 两笔交易时间间隔小于等于5秒
            SET 
                t1.frequent = 1,                                -- 标记第一笔
                t2.frequent = 1                                 -- 标记第二笔
            WHERE 
                t1.sol_amount < 1
                AND t1.ts >= NOW() - INTERVAL 24 HOUR;`
        let [rows] = await this.connection.execute(query);
        return rows as any;
    }

    // 更新用户为机器人
    async userBot() {
        let query = `UPDATE user_details ud
            JOIN transactions t ON ud.address = t.user_address
            JOIN transactions t2 ON t.user_address = t2.user_address
                AND t.id <> t2.id
                AND t.ts < t2.ts
                AND TIMESTAMPDIFF(SECOND, t.ts, t2.ts) <= 5
            SET ud.is_bot = 1
            WHERE t.sol_amount < 1
        AND t.ts >= NOW() - INTERVAL 1 DAY;`
        let [rows] = await this.connection.execute(query);
        return rows as any;
    }

    // 删除mint地址重复的代币
    async deleteSameMintAddr() {
        let query = `WITH RankedTokens AS (
            SELECT 
                id,
                mint_pda_address,
                ROW_NUMBER() OVER (PARTITION BY mint_pda_address ORDER BY id) AS rn
            FROM token_info
            WHERE mint_pda_address != ''  -- 只对非空的 mint_pda_address 进行分组和排序
            )
            DELETE FROM token_info
            WHERE id IN (
            SELECT id FROM RankedTokens WHERE rn > 1
            );`
        let [rows] = await this.connection.execute(query);
        return rows as any;
    }

    /**
     * 查询 分组(通用)
     * @param table 
     * @param field 
     * @param whereField 
     * @param whereValue 
     * @returns 
     */
    async groupByField(table: string, field: string, whereField?: string, whereValue?: any, page?: number, limit?: number) {
        let query = `SELECT ${field}, COUNT(*) AS count FROM ${table}`;
        let params: any[] = [];
        // 如果有 where 条件，则添加到查询中
        if (whereField && whereValue !== undefined) {
            query += ` WHERE ${whereField} = ?`;
        }
        query += ` GROUP BY ${field};`;
        if (page !== undefined && limit !== undefined) {
            const offset = (page - 1) * limit;
            query += ` LIMIT ${limit} OFFSET ${offset}`;
            // params.push(pageSize, offset);
        }
        params = whereField ? [whereValue] : [];
        const [results] = await this.connection.execute(query, params);
        // execute 方法返回的是一个数组，其中第一个元素是查询结果，第二个元素是元数据。
        const rows = results as Array<{ [key: string]: any }>; // 或者更具体的类型
        // return rows.map(row => row[field]); // 确保使用正确的字段
        return rows;
    }

    // 获取代币的评论列表，并附带用户的点赞状态
    async getCommentsWithLikes(tokenId: number, userId: string) {
        const comments: any = await this.connection.execute(
            `SELECT 
                tc.id AS comment_id,
                cl.user_id IS NOT NULL AS liked_by_user
            FROM 
                token_comments tc
            LEFT JOIN 
                comment_likes cl 
            ON 
                tc.id = cl.comment_id AND cl.user_id = ?
            WHERE 
                tc.token_id = ?`,
            [userId, tokenId]
        );
        return comments[0];
    }

    // mysql>=8.0
    async getTransactionsAvrpri2(tokenPdaAddresses: string[]) {
        if (tokenPdaAddresses.length === 0) return [];
        const rows: any = await this.connection.query(
            `WITH RankedData AS (
                SELECT ave_pri,token_pda_address, ROW_NUMBER() OVER (PARTITION BY token_pda_address ORDER BY ts) AS rn
                FROM transactions
                WHERE token_pda_address IN (?)
                AND transaction_type = 'buy'
            )
            SELECT ave_pri,token_pda_address
            FROM RankedData
            WHERE rn = 1;`,
            [tokenPdaAddresses]
        );
        // let sql = `SELECT ave_pri, token_pda_address, transaction_type
        //         FROM transactions
        //         WHERE token_pda_address IN (?)
        //         AND ts >= NOW() - INTERVAL ${time} ${unit}
        //         AND ts = (
        //             SELECT MIN(ts)
        //             FROM transactions AS t2
        //             WHERE t2.token_pda_address = transactions.token_pda_address
        //             AND t2.ts >= NOW() - INTERVAL ${time} ${unit}
        //         )`
        return rows[0];
    }

    // 批量查询指定时间范围的代币第一笔和最后一笔交易记录
    async getTransactionsAvrpri(tokenPdaAddresses: string[], time: number = 1, unit: string = 'DAY') {
        if (tokenPdaAddresses.length === 0) return [];
        const rows: any = await this.connection.query(
            `SELECT ave_pri, token_pda_address, transaction_type, ts
                FROM transactions AS t1
                WHERE token_pda_address IN (?)
                AND ts >= NOW() - INTERVAL ${time} ${unit}
                AND ts = (
                    SELECT MIN(ts)
                    FROM transactions AS t2
                    WHERE t1.token_pda_address = t2.token_pda_address
                        AND t2.ts >= NOW() - INTERVAL ${time} ${unit}
                )
                UNION ALL
                SELECT ave_pri, token_pda_address, transaction_type, ts
                FROM transactions AS t1
                WHERE token_pda_address IN (?)
                AND ts >= NOW() - INTERVAL ${time} ${unit}
                AND ts = (
                    SELECT MAX(ts)
                    FROM transactions AS t2
                    WHERE t1.token_pda_address = t2.token_pda_address
                        AND t2.ts >= NOW() - INTERVAL ${time} ${unit}
                );`,
            [tokenPdaAddresses, tokenPdaAddresses]
        );
        return rows[0];
    }

    // 查询指定时间内的交易数据
    async getTransactionsInfoByuser(tokenPdaAddresses: string, time: number, unit: string) {
        const rows: any = await this.connection.query(
            `SELECT transaction_type, COUNT(*) AS count, SUM(CAST(token_amount AS DECIMAL(20,10)) * CAST(ave_pri AS DECIMAL(20,10))) AS volumeCount
                FROM transactions
                WHERE user_address = ?
                AND ts >= NOW() - INTERVAL ${time} ${unit}
                GROUP BY 
                transaction_type;`,
            [tokenPdaAddresses]
        );
        return rows[0];
    }

    // 查询创建的代币的交易数量
    async getTransactionsInfoByuserCreated(userId: string, time: number, unit: string) {
        const rows: any = await this.connection.query(
            `SELECT 
                t.transaction_type, 
                COUNT(*) AS count
            FROM 
                transactions t
            JOIN 
                token_info ti ON t.token_pda_address = ti.token_pda_address
            WHERE 
                ti.user_id = ?
                AND t.ts >= NOW() - INTERVAL ${time} ${unit}
            GROUP BY 
                t.transaction_type;`,
            [userId]
        );
        return rows[0];
    }

    // 查询用户持有的代币中上外盘的代币数量
    async getDexCount(table: string, tokenPdaAddresses: string[], time: number, unit: string) {
        if (tokenPdaAddresses.length === 0) return [];
        const rows: any = await this.connection.query(
            `SELECT count(1) AS dexCount
                FROM ${table}
                WHERE token_pda_address IN (?)
                AND created_time >= NOW() - INTERVAL ${time} ${unit} 
                AND is_outside = 1;`,
            [tokenPdaAddresses]
        );
        return rows[0];
    }

    /**
     * 批量查找数据(通用)
     * @param table 
     * @returns 
     */
    async getConditionByIds(table: string, condition: string, conditions: string[], fields: string[], limit?: number, offset?: number, excludeUserIds?: string[]) {
        if (conditions.length === 0) {
            if (excludeUserIds && excludeUserIds.length > 0) {
                const excludePlaceholders = excludeUserIds.map(() => '?').join(',');
                const query = `SELECT ${fields.join(', ')} FROM ${table} WHERE ${condition} NOT IN (${excludePlaceholders}) LIMIT ${limit ?? 10} OFFSET ${offset ?? 0}`;
                const [rows] = await this.connection.execute(query, excludeUserIds);
                return rows;
            } else {
                return []; // 如果没有 excludeUserIds，则返回空数组
            }
        }
        const fieldList = fields.join(', ');
        const placeholders = conditions.map(() => '?').join(',');

        const finalLimit = limit ?? 10; // 默认 limit 为 10
        const finalOffset = offset ?? 0; // 默认 offset 为 0

        let query = `SELECT ${fieldList} FROM ${table} WHERE ${condition} IN (${placeholders})`;
        // 处理排除用户 ID 的逻辑
        if (excludeUserIds && excludeUserIds.length > 0) {
            const excludePlaceholders = excludeUserIds.map(() => '?').join(',');
            query += ` AND user_id NOT IN (${excludePlaceholders})`;
        }
        query += ` LIMIT ${finalLimit} OFFSET ${finalOffset}`;  // 添加 LIMIT 和 OFFSET
        const params = [...conditions, ...(excludeUserIds || [])];
        const [rows] = await this.connection.execute(query, params);
        return rows;
    }

    /**
     * 批量查找用户数据(通用)
     */
    async getUsersByIds(table: string, userIds: string[], fields: string[], limit?: number, offset?: number, excludeUserIds?: string[]) {
        if (userIds.length === 0) {
            if (excludeUserIds && excludeUserIds.length > 0) {
                const excludePlaceholders = excludeUserIds.map(() => '?').join(',');
                const query = `SELECT ${fields.join(', ')} FROM ${table} WHERE user_id NOT IN (${excludePlaceholders}) LIMIT ${limit ?? 10} OFFSET ${offset ?? 0}`;
                const [rows] = await this.connection.execute(query, excludeUserIds);
                return rows;
            } else {
                // 如果没有 excludeUserIds，则返回空数组
                return [];
            }
        }
        const fieldList = fields.join(', ');
        const placeholders = userIds.map(() => '?').join(',');
        const finalLimit = limit ?? 10; // 默认 limit 为 10
        const finalOffset = offset ?? 0; // 默认 offset 为 0

        let query = `SELECT ${fieldList} FROM ${table} WHERE user_id IN (${placeholders})`;
        // 处理排除用户 ID 的逻辑
        if (excludeUserIds && excludeUserIds.length > 0) {
            const excludePlaceholders = excludeUserIds.map(() => '?').join(',');
            query += ` AND user_id NOT IN (${excludePlaceholders})`;
        }

        query += ` LIMIT ${finalLimit} OFFSET ${finalOffset}`;  // 添加 LIMIT 和 OFFSET
        const params = [...userIds, ...(excludeUserIds || [])];
        const [rows] = await this.connection.execute(query, params);
        return rows;
    }

    /**
     * 批量查找用户数据(通用)
     */
    async getUsersByAddress(table: string, addressIds: string[], fields: string[], limit?: number, offset?: number, excludeUserIds?: string[]) {
        if (addressIds.length === 0) {
            if (excludeUserIds && excludeUserIds.length > 0) {
                const excludePlaceholders = excludeUserIds.map(() => '?').join(',');
                const query = `SELECT ${fields.join(', ')} FROM ${table} WHERE address NOT IN (${excludePlaceholders}) LIMIT ${limit ?? 10} OFFSET ${offset ?? 0}`;
                const [rows] = await this.connection.execute(query, excludeUserIds);
                return rows;
            } else {
                // 如果没有 excludeUserIds，则返回空数组
                return [];
            }
        }
        const fieldList = fields.join(', ');
        const placeholders = addressIds.map(() => '?').join(',');
        const finalLimit = limit ?? 10; // 默认 limit 为 10
        const finalOffset = offset ?? 0; // 默认 offset 为 0

        let query = `SELECT ${fieldList} FROM ${table} WHERE address IN (${placeholders})`;
        // 处理排除用户 ID 的逻辑
        if (excludeUserIds && excludeUserIds.length > 0) {
            const excludePlaceholders = excludeUserIds.map(() => '?').join(',');
            query += ` AND address NOT IN (${excludePlaceholders})`;
        }

        query += ` LIMIT ${finalLimit} OFFSET ${finalOffset}`;  // 添加 LIMIT 和 OFFSET
        const params = [...addressIds, ...(excludeUserIds || [])];
        const [rows] = await this.connection.execute(query, params);
        return rows;
    }

    /**
     * 查询
     * @param table 表名
     * @param field 需要查询的字段
     * @param sort 排序 （DESC or ASC）
     * @param limit 限制数量
     */
    async select_order_by(table: string, field: string, sort: string, limit?: number) {
        if (limit) {
            return await this.connection.execute(
                `SELECT * FROM ${table} ORDER BY ${field} ${sort} LIMIT ${limit}`
            )
        }
        else {
            return await this.connection.execute(
                `SELECT * FROM ${table} ORDER BY ${field} ${sort}`
            )
        }
    }
    // SELECT * FROM table_name LIMIT [(page_num-1) * page_size], [page_size];
    // async select_limit(table: string, field: string, sort:string, limit: number){
    //     return await this.connection.execute(
    //         `SELECT * FROM ${table} ORDER BY ${field} ${sort} LIMIT ${limit}`
    //     )
    // }

    /**
     * 删除
     * @param table 
     * @param whereConditions 
     * @returns 
     */
    async delete(table: string, whereConditions: { [key: string]: any }): Promise<{ affectedRows: number }> {
        const whereString = Object.keys(whereConditions)
            .map((field) => `${field} = ?`)
            .join(' AND ');
        const values = Object.values(whereConditions);
        const sql = `DELETE FROM ${table} WHERE ${whereString}`;
        try {
            const [result]: any = await this.connection.execute(sql, values);
            const { affectedRows } = result;
            return { affectedRows };
        } catch (error) {
            console.error('删除时出错:', error);
            throw error;
        }
    }
    // 批量删除
    async deleteBatch(table: string, whereConditions?: any[]): Promise<{ affectedRows: number }> {
        let sql: string;
        let values: any[] = [];

        if (whereConditions && whereConditions.length === 1 && whereConditions[0] === 0) {
            // 删除全部
            sql = `DELETE FROM ${table}`;
        } else if (whereConditions && whereConditions.length > 0) {
            const whereString = whereConditions
                .map(condition => {
                    const conditionString = Object.keys(condition)
                        .map(field => `${field} = ?`)
                        .join(' AND ');
                    values.push(...Object.values(condition));
                    return `(${conditionString})`;
                })
                .join(' OR ');

            sql = `DELETE FROM ${table} WHERE ${whereString}`;
        } else {
            throw new Error("No conditions provided for deletion.");
        }

        try {
            const [result]: any = await this.connection.execute(sql, values);
            const { affectedRows } = result;
            return { affectedRows };
        } catch (error) {
            console.error('删除时出错:', error);
            throw error;
        }
    }

}

export default MySQLUtils;
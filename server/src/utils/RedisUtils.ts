import Redis, { RedisKey, Callback } from 'ioredis';
import { RedisCommandArgument } from '@redis/client/dist/lib/commands'
import { getLog } from './LogUtils';
const logger = getLog("RedisUtils");
class RedisUtils {
    client: Redis;
    private static instance: RedisUtils;
    public static getInstance() {
        if (!RedisUtils.instance) {
            RedisUtils.instance = new RedisUtils();
        }
        return RedisUtils.instance;
    }
    constructor() {
        this.client = Redis.createClient();
        this.client.on('error', (err) => {
            logger.error(err);
        })
    }

    set(key: string, value: number | RedisCommandArgument, seconds?: number) {
        this.client.set(key, value);
        if (seconds)
            this.client.expire(key, seconds);
    }

    setEX(key: string, value: string, expire = 3600) { // 默认过期时间1小时
        return new Promise((resolve, reject) => {
            this.client.set(key, JSON.stringify(value), 'EX', expire, (err, res) => {
                if (err) return reject(err);
                resolve(res);
            });
        });
    }

    get(key: string) {
        return this.client.get(key);
    }

    del(key: string) {
        this.client.del(key);
    }

    async lpush(...args: [
        key: RedisKey,
        ...elements: (string | Buffer | number)[],
        callback: Callback<number>
    ]) {
        await this.client.lpush(...args);
    }

    async lrange(key: RedisKey, start: number | string, stop: number | string) {
        return await this.client.lrange(key, start, stop);
    }
    /***********************有序集合 ************************/
    /**
     * 添加集合值
     * @param key 
     * @param scoreMembers 
     */
    async zadd(...args: [
        key: RedisKey,
        ...scoreMembers: (string | Buffer | number)[],
        callback: Callback<number>
    ]) {
        logger.info("zadd", args);
        try {
            await this.client.zadd(...args)
        }
        catch (err) {
            logger.error(err);
        };
    }
    /**
     * 获取集合长度
     * @param key 
     */
    async zcard(key: RedisKey) {
        logger.info("zcard", key);
        try {
            return await this.client.zcard(key);
        }
        catch (err) {
            logger.error(err);
        };
        return 0;
    }
    /**
     * 获取集合内容的升序
     * @param key 
     * @param min 
     * @param max 
     */
    async zrange(key: RedisKey, min: string | Buffer | number, max: string | Buffer | number) {
        logger.info("zrange", key, min, max);
        try {
            return await this.client.zrange(key, min, max, "WITHSCORES");
        }
        catch (err) {
            logger.error(err);
        };
        return null;
    }
    /**
     * 获取集合内容的降序序
     * @param key 
     * @param min 
     * @param max 
     */
    async zrevrange(key: RedisKey, start: number | string, stop: number | string) {
        logger.info("zrevrange", key, start, stop);
        try {
            return await this.client.zrevrange(key, start, stop, "WITHSCORES");
        }
        catch (err) {
            logger.error(err);
        };
        return null;
    }
    /**
     * 获取合集中，成员的排名（升序）
     * @param key 
     * @param member 
     */
    async zrank(key: RedisKey, member: string | Buffer | number) {
        logger.info("zrank", key, member);
        try {
            return await this.client.zrank(key, member);
        }
        catch (err) {
            logger.error(err);
        };
        return null;
    }
    /**
     *  获取合集中，成员的排名（降序）
     * @param key 
     * @param member 
     */
    async zrevrank(key: RedisKey, member: string | Buffer | number) {
        return await this.client.zrevrank(key, member);
    }
    /**
     * 删除集合中的值
     * @param key 
     * @param member 
     */
    async zrem(...args: [
        key: RedisKey,
        ...members: (string | Buffer | number)[],
        callback: Callback<number>
    ]) {
        return await this.client.zrem(...args);
    }

    /**
     * hash
     * @param key 
     * @param field 
     * @param increment 
     * @returns 
     */
    async hset(key: string, field: string, value: number) {
        try {
            const result = await this.client.hset(key, field, value);
            return result;
        } catch (err) {
            logger.error(err);
        };
    }

    /**
    * hash
    * @param key 
    * @param field 
    * @returns 
    */
    async hget(key: string, field: string) {
        try {
            const result = await this.client.hget(key, field);
            return result;
        } catch (err) {
            logger.error(err);
        };
    }

    /**
     * 增加
     * @param key 
     * @param field 
     * @param amount 
     * @returns 
     */
    async incrementPoints(key: string, field: string, amount: number, expireTime?: number) {
        try {
            const exists = await this.client.hexists(key, field);
            if (!exists) {
                await this.hset(key, field, 0); // 默认设置为0
            }
            const result = await this.client.hincrby(key, field, amount);
            if (expireTime) {
                await this.client.expire(key, expireTime);
            }
            return result;
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * 减少
     * @param key 
     * @param field 
     * @param amount 
     * @returns 
     */
    async decrementPoints(key: string, field: string, amount: number, expireTime?: number) {
        try {
            const exists = await this.client.hexists(key, field);
            if (!exists) {
                await this.hset(key, field, 1); // 默认设置为1
            }
            const result = await this.client.hincrby(key, field, -amount);
            if (expireTime) {
                await this.client.expire(key, expireTime);
            }
            return result;
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * 创建代币使用  计算每日上限
     * @param key 
     * @param userId 
     * @param pointsToAdd 
     * @returns 
     */
    async addPoints(key: string, field: string, pointsToAdd: number) {
        const totalPointsKey = key;
        const dailyPointsKey = `dailyPoints:${key}`;
        // 获取当前每日积分和总积分
        const dailyPoints = await this.client.get(dailyPointsKey) || 0 as any;
        // const totalPoints = await this.client.get(totalPointsKey) || 0;
        // 检查是否超过每日上限
        if (parseInt(dailyPoints) + pointsToAdd > 200) {
            console.log('已达到每日积分上限');
            return;
        }
        const exists = await this.client.hexists(totalPointsKey, field);
        const existsDay = await this.client.hexists(totalPointsKey, field);
        if (!exists) {
            await this.client.hset(totalPointsKey, field, 0); // 默认设置为0
        }
        if (!existsDay) {
            await this.client.set(dailyPointsKey, 0); // 默认设置为0
        }
        await this.client.hincrby(totalPointsKey, field, pointsToAdd); // 累加总积分
        await this.client.incrby(dailyPointsKey, pointsToAdd); // 增加每日积分
        if (dailyPoints === 0) await this.client.expire(dailyPointsKey, 86400); // 8设置每日积分的过期时间为 24 小时
    }


    // kLine
    setHash(key: string, field: string, value: string, expire = 10) { // 设置哈希字段，过期时间（秒）
        return new Promise((resolve, reject) => {
            this.client.hset(key, field, JSON.stringify(value), (err, res) => {
                if (err) return reject(err);
                // 设置过期时间
                this.client.expire(key, expire, (expireErr) => {
                    if (expireErr) return reject(expireErr);
                    resolve(res);
                });
            });
        });
    }
    getHashField(key: string, field: string) {
        return new Promise((resolve, reject) => {
            this.client.hget(key, field, (err, res) => {
                if (err) return reject(err);
                if (!res) return resolve(null);  // 如果没有该字段，返回null
                resolve(JSON.parse(res)); // 解析并返回数据
            });
        });
    }
    mergeData(currentData: any, newData: any) {
        if (!currentData) return newData; // 如果没有当前数据，直接返回新数据
        // 可以根据具体需求修改合并逻辑
        return { ...currentData, ...newData };
    }
    async updateHashData(key: string, field: string, newData: string) {
        const currentData = await this.getHashField(key, field);
        const updatedData = this.mergeData(currentData, newData);
        return this.setHash(key, field, updatedData);
    }
    getAllHashFields(key: string) {
        return new Promise((resolve, reject) => {
            this.client.hgetall(key, (err, res) => {
                if (err) return reject(err);
                const parsedRes = {} as any;
                for (const field in res) {
                    parsedRes[field] = JSON.parse(res[field]);
                }
                resolve(parsedRes);
            });
        });
    }



}
export default RedisUtils;
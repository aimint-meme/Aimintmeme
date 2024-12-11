import { EventEmitter } from "stream";
import MySQLUtils from "../utils/MySQLUtils";
import MySQL from "mysql2/promise";
import { ResultEnumCode, ResultEnumMsg } from "../common/Enum";
import Result from "../common/Result";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import DateUtils from "../utils/DateUtils";
import DataUtils from "../utils/DataUtils";
import axios, { AxiosResponse } from 'axios';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
const keyDirectory = path.join(__dirname, 'keys');

class BackstageService extends EventEmitter {
    mysql: MySQLUtils;
    constructor() {
        super();
        this.mysql = MySQLUtils.getInstance();
    }

    /**
     * 注册
     * @param username 
     * @param password 
     * @returns 
     */
    public async register(username: string, password: string) {

        const userInfo = await this.mysql.selectWhere(
            'admin_users',
            ['*'], // 选择所有列
            ['username'], // 条件字段
            [username]
        );
        if (userInfo.length > 0) {
            return new Result(ResultEnumCode.BadRequest, { result: '用户已存在' });
        }
        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.mysql.insertRecord(
            'admin_users',
            ['username', 'password', 'created_at'],
            [username, hashedPassword, DateUtils.getInstance().getCurrTime()]
        );
        return new Result(ResultEnumCode.Succeed, ResultEnumMsg.Succeed);
    }

    /**
     * 登录
     * @param username 
     * @param password 
     * @returns 
     */
    public async login(username: string, password: string) {
        // const secretKey = 'cb258776681957d67e21455c415b29dc756aa7c5bb59ad8e1059ba1d919b4db2';
        const userInfo = await this.mysql.selectWhere(
            'admin_users',
            ['*'], // 选择所有列
            ['username'], // 条件字段
            [username]
        );
        if (userInfo.length === 0) {
            return new Result(ResultEnumCode.BadRequest, { result: '无效用户' });
        }
        const user = userInfo[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            // 密码错误
            return new Result(ResultEnumCode.BadRequest, ResultEnumMsg.BadRequest);
        }
        // 生成JWT
        // const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '1h' });
        return new Result(ResultEnumCode.Succeed, ResultEnumMsg.Succeed);
    }


    /**
     * 查询
     * @param keyword 
     * @param prompt 
     * @param source 
     * @param status 
     * @param startDate 
     * @param endDate 
     * @param page 
     * @param limit 
     * @returns 
     */
    public async list(
        keyword: string,
        prompt: string,
        source: string,
        status: string,
        startDate: string,
        endDate: string,
        page: number,
        limit: number
    ) {
        if (startDate) {
            endDate = DateUtils.addOneDay(startDate)
        }
        const filters = {
            keyword: keyword ? `%${keyword}%` : null,
            prompt: prompt ? `%${prompt}%` : null,
            source: source || null,
            status: status || null,
            startDate: startDate || null,
            // endDate: endDate || null
        };
        let { rows, total } = await this.mysql.queryWithFilters('hot_trends', filters, limit, page);
        const types = await this.mysql.groupByField('hot_trends', 'source');
        // const resultArray = types.map(item => item.source);
        const resultArray: any[] = [];
        types.forEach(item => {
            item.source.forEach((sourceItem: any) => {
                if (!resultArray.includes(sourceItem)) {
                    resultArray.push(sourceItem);
                }
            });
        });
        rows.forEach(item => {
            item.created_time = DateUtils.formatDate(item.created_time)
            item.updated_time = DateUtils.formatDate(item.updated_time)
        })
        let res = {
            total: total,
            types: resultArray,
            items: DataUtils.toCamelCase(rows)
        }
        return new Result(ResultEnumCode.Succeed, res);
    }

    /**
     * 添加趋势数据
     * @param keyword 
     * @param prompt 
     * @param source 
     * @param status 
     * @returns 
     */
    public async put(
        keyword: string,
        prompt: string,
        source: string,
        status: string
    ) {
        let res = await this.mysql.insertRecord(
            'hot_trends',
            ['keyword', 'prompt', 'source', 'status', 'created_time', 'updated_time'],
            [keyword, prompt, source, status, DateUtils.getInstance().getCurrTime(), DateUtils.getInstance().getCurrTime()]
        );
        return new Result(ResultEnumCode.Succeed, ResultEnumMsg.Succeed);
    }

    /**
     * 添加趋势数据
     * @param id 
     * @param keyword 
     * @param prompt 
     * @param source 
     * @param status 
     * @returns 
     */
    public async edit(
        id: number,
        keyword: string,
        prompt: string,
        source: string,
        status: string = 'active'
    ) {
        const result = await this.mysql.updateData(
            'hot_trends',
            'keyword = ?, prompt = ?, source = ?, status = ?, updated_time = ?',
            'id = ?',
            [keyword, prompt, source, status, DateUtils.getInstance().getCurrTime(), id]
        ) as MySQL.RowDataPacket[];
        if (result && result.length > 0 && result[0].affectedRows > 0) {
            return new Result(ResultEnumCode.Succeed, ResultEnumMsg.Succeed);
        } else {
            return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
        }
    }

    /**
     * 删除趋势数据
     * @param ids 
     * @returns 
     */
    public async delete(
        ids: number[]
    ) {
        let conditions = []
        if (ids.length > 0 && ids[0] == 0) {
            conditions = [0]
        } else {
            conditions = ids.map(id => ({ id }));
        }
        await this.mysql.deleteBatch('hot_trends', conditions);
        return new Result(ResultEnumCode.Succeed, ResultEnumMsg.Succeed);
    }

    /**
     * 状态变更
     * @param ids 
     * @returns 
     */
    public async enable(
        ids: number[],
        enable: string
    ) {
        await this.mysql.updateStatus('hot_trends', ids, enable);
        return new Result(ResultEnumCode.Succeed, ResultEnumMsg.Succeed);
    }

    public async generateKeys(num: number, value: string) {
        try {
            let result = await this.generateKeyPair(num, value) as any;
            return new Result(ResultEnumCode.Succeed, result);
        } catch (error) {
            this.handleError(error);
            return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
        }
    }

    // 生成指定结尾mint并插入数据库
    public generateKeyPair = (num: number, value: string) => {
        let PATH_SOLANA_CLI = process.env.SOLANA_CLI;
        return new Promise((resolve, reject) => {
            // 执行命令
            exec(`${PATH_SOLANA_CLI}solana-keygen grind --ends-with ${value}:${num}`, async (err, stdout, stderr) => {
                if (err) {
                    reject(stderr || err);
                    return;
                }
                if (stderr) {
                    console.error('stderr:', stderr);
                    return;
                }
                // const match = stdout.match(/Wrote keypair to (.*)/);
                const matches = [...stdout.matchAll(/Wrote keypair to (.*?\.json)/g)];
                const jsonFiles = matches.map(match => match[1]); // 提取所有文件路径
                console.log(jsonFiles); // 输出所有提取到的 .json 文件路径
                if (matches && jsonFiles.length > 0) {
                    // const generatedFilePath = match[1];
                    jsonFiles.forEach(item => {
                        fs.readFile(item, 'utf8', async (err, data) => {
                            if (err) {
                                console.error('读取文件失败:', err);
                                return;
                            }
                            try {
                                // 解析文件内容为 JSON
                                const keyPair = JSON.parse(data);
                                let privateKey = keyPair;
                                const fileName = path.basename(item);
                                console.log('生成的密钥文件名:', fileName);
                                // const sourceFile = path.join(__dirname, fileName);
                                const publicKey = path.basename(fileName, path.extname(fileName));
                                await this.mysql.insertRecord(
                                    'token_key',
                                    ['public_key', 'private_key'],
                                    [publicKey, privateKey]
                                );
                            } catch (parseErr) {
                                console.error('解析密钥文件失败:', parseErr);
                            }
                        });
                        // 删除文件
                        fs.unlink(item, (err) => {
                            if (err) {
                                console.error('删除文件失败:', err);
                            } else {
                                console.log('文件删除成功:', item);
                            }
                        });
                    })
                    // console.log('生成的密钥文件路径:', generatedFilePath);

                    // 移动文件
                    // const fileName = path.basename(generatedFilePath);
                    // const targetFile = path.join(keyDirectory, fileName);
                    // // 确保目标目录存在
                    // if (!fs.existsSync(keyDirectory)) {
                    //     fs.mkdirSync(keyDirectory, { recursive: true });
                    // }
                    // // 移动文件
                    // fs.rename(generatedFilePath, targetFile, (err) => {
                    //     if (err) {
                    //         console.error('移动文件失败:', err);
                    //     } else {
                    //         console.log('密钥文件已成功移动到:', targetFile);
                    //     }
                    // });
                    resolve(jsonFiles[1]);
                } else {
                    console.error('无法从输出中提取文件路径');
                }

            });
        });
    };

    // 批量读取json文件并插入数据
    public async insertKeys() {
        try {
            const directoryPath = 'C:\\code\\mintAddress';
            const destinationPath = 'C:\\code\\savedMintaddr';
            fs.readdir(directoryPath, (err, files) => {
                if (err) throw err;
                files.forEach(async file => {
                    if (path.extname(file) === '.json') {
                        const filePath = path.join(directoryPath, file);
                        // 读取 JSON 文件内容
                        fs.readFile(filePath, 'utf-8', async (err, data) => {
                            if (err) throw err;
                            const keyPair = JSON.parse(data);
                            let privateKey = keyPair;
                            const fileName = path.basename(file);
                            console.log('生成的密钥文件名:', fileName);
                            const publicKey = path.basename(fileName, path.extname(fileName));
                            await this.mysql.insertRecord(
                                'token_key',
                                ['public_key', 'private_key'],
                                [publicKey, privateKey]
                            );
                            // 移动文件
                            const destinationFilePath = path.join(destinationPath, file);
                            fs.rename(filePath, destinationFilePath, (err) => {
                                if (err) {
                                    console.error('移动文件失败:', err);
                                } else {
                                    console.log('密钥文件已成功移动到:', destinationFilePath);
                                }
                            });
                            console.log(`文件已移动到: ${destinationFilePath}`);
                        });
                    }
                });
            });
            return new Result(ResultEnumCode.Succeed, {});
        } catch (error) {
            this.handleError(error);
            return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
        }
    }


    private handleError(error: any): void {
        console.error('Error:', error);
        if (axios.isAxiosError(error)) {
            console.error('Error response data:', error.response?.data);
            console.error('Error response status:', error.response?.status);
            console.error('Error response headers:', error.response?.headers);
        } else {
            console.error('Error message:', error.message);
        }
    }
}

export default BackstageService;
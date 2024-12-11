import { EventEmitter } from "stream";
import MySQLUtils from "../utils/MySQLUtils";
import MySQL from "mysql2/promise";
import { ResultEnumCode } from "../common/Enum";
import Result from "../common/Result";
import FormData from 'form-data';
import { HttpsProxyAgent } from 'https-proxy-agent';
import crypto from 'crypto';
import axios, { AxiosResponse } from 'axios';
import OAuth from 'oauth-1.0a';
import fs from 'fs';

// pinata密钥
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;
const PINATA_ENDPOINT = process.env.PINATA_ENDPOINT as string;
const DOMAIN_URL = process.env.DOMAIN_URL as string;
// x 密钥
const consumerKey = '';
const consumerSecret = '';
const accessToken = '';
const tokenSecret = '';

const AUTHORIZATION = process.env.API_KEY;
const ALI_MODEL = process.env.ALI_MODEL as string;

class ThirdPartyService extends EventEmitter {
    mysql: MySQLUtils;
    constructor() {
        super();
        this.mysql = MySQLUtils.getInstance();
    }

    /**
     * 发送推文
     * @param text 推文内容
     * @returns 
     */
    public async sendtweets(text: string) {
        let oauth = new OAuth({
            consumer: {
                key: consumerKey,
                secret: consumerSecret
            },
            signature_method: 'HMAC-SHA1',
            hash_function(base_string, key) {
                return crypto
                    .createHmac('sha1', key)
                    .update(base_string)
                    .digest('base64');
            }
        })
        const token = {
            key: accessToken,
            secret: tokenSecret
        };
        const requestData = {
            url: 'https://api.twitter.com/2/tweets',
            method: 'POST'
        };
        const headers = oauth.toHeader(oauth.authorize(requestData, token));
        const result: AxiosResponse = await axios({
            url: requestData.url,
            method: requestData.method,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            data: { text },
            // httpsAgent: agent,
        });
        return new Result(ResultEnumCode.Succeed, result.data.data);
    }

    async generateImages(userId: string, prompt: string) {
        // 调用相同的 prompt 生成两张图片
        const results = await Promise.all([
            this.generateImage(prompt),
            this.generateImage(prompt),
        ]);
        // let results = await this.generateImage(prompt);
        return new Result(ResultEnumCode.Succeed, results);
    }


    /**
     * 生成图片
     * @param prompt 
     * @returns 
     */
    public async generateImage(prompt: string) {
        const MODEL = 'flux-schnell';
        // const SIZE = '1024*1024';
        const response = await axios.post(ALI_MODEL, {
            model: MODEL,
            input: {
                prompt: prompt
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': AUTHORIZATION,
                'X-DashScope-Async': 'enable',
            },
            // timeout: 10000 // 设置为 10 秒
        });
        const results = response.data;
        const taskId = results.output.task_id; // 假设响应中包含任务 ID
        console.log('Task ID:', taskId);
        let res = await this.pollTask(taskId); // 使用轮询方法
        return new Result(ResultEnumCode.Succeed, res);
    }

    /**
     * 批量生成taskId
     * @param userId 
     * @param prompt 
     * @returns 
     */
    async generateTaskIdBatch(userId: string, prompt: string) {
        // 调用相同的 prompt 生成两张图片
        const results = await Promise.all([
            this.generateTaskId(userId, prompt),
            // this.generateTaskId(userId, prompt),
        ]);
        // let results = await this.generateImage(prompt);
        return new Result(ResultEnumCode.Succeed, results);
    }
    /**
     * 生成taskId
     * @param userId 
     * @param prompt 
     * @returns 
     */
    public async generateTaskId(userId: string, prompt: string) {
        // const MODEL = 'flux-schnell';
        const MODEL = 'wanx-v1';
        // const SIZE = '1024*1024';
        const response = await axios.post(ALI_MODEL, {
            model: MODEL,
            input: {
                prompt: prompt
            },
            parameters: {
                style: "<auto>",
                size: "1024*1024",
                n: 1
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': AUTHORIZATION,
                'X-DashScope-Async': 'enable',
            },
            // timeout: 10000 // 设置为 10 秒
        });
        const results = response.data;
        const taskId = results.output.task_id; // 假设响应中包含任务 ID
        console.log('Task ID:', taskId);
        return { taskId };
    }

    private async pollTask(taskId: string) {
        const maxRetries = 10; // 最大重试次数
        let attempts = 0;
        while (attempts < maxRetries) {
            const result = await this.fetchTask(taskId);
            if (result) return result; // 如果获取到结果，返回 URL
            attempts++;
            const waitTime = this.calculateWaitTime(attempts); // 根据重试次数计算等待时间
            console.log(`Retrying in ${waitTime} ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime)); // 等待
        }
        console.log('Max retries reached. No results found.');
        return null; // 超过最大重试次数，返回 null
    }

    private calculateWaitTime(attempt: number): number {
        return Math.min(5000 * attempt, 30000); // 等待时间：最多 30 秒
    }

    public async fetchTask(taskId: string) {
        try {
            const response = await axios.get(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': AUTHORIZATION,
                }
            });
            const results = response.data?.output?.results;
            const status = response.data?.output?.task_status;
            if (results && results.length > 0 && status === 'SUCCEEDED') {
                console.log(results[0].url);
                let { url } = await this.uploadImageToPinata(results[0].url);
                let resUtl = url === '' ? results[0].url : url;
                return { url: resUtl, status };
                // return { url: results[0].url, status };
            } else {
                return { status };
            }
        } catch (error) {
            this.handleError(error);
            return { status: 'FAILED' };
        }
    }

    async uploadImageToPinata(imageUrl: string) {
        try {
            // const hashToCidMap = new Map();
            // const imageHash = await this.getImageHash(imageUrl);
            // if (hashToCidMap.has(imageHash)) {
            //     const existingCid = hashToCidMap.get(imageHash);
            //     console.log('图片已存在，CID:', existingCid);
            //     return existingCid; // 返回已存在的 CID
            // }
            const response = await axios({
                url: imageUrl,
                method: 'GET',
                responseType: 'stream'
            });
            const urlSegments = imageUrl.split('/');
            const originalFileName = urlSegments[urlSegments.length - 1] || 'downloaded_image.jpg';
            const formData = new FormData();
            formData.append('file', response.data, originalFileName);
            const pinataResponse = await axios.post(PINATA_ENDPOINT, formData, {
                maxContentLength: Infinity,
                headers: {
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET_API_KEY,
                },
            });
            let ipfsHash = '';
            let url = '';
            if (pinataResponse?.data?.IpfsHash) {
                ipfsHash = pinataResponse.data.IpfsHash; // 获取 IpfsHash
                url = `${DOMAIN_URL}${ipfsHash}`;
            }
            return { url };
        } catch (error) {
            console.error('Error uploading image to Pinata:', error);
            return { url: "" };
        }
    }

    async getImageHash(imageUrl: string) {
        const response = await axios({
            url: imageUrl,
            method: 'GET',
            responseType: 'arraybuffer'
        });
        // 计算图片的哈希值
        const hash = crypto.createHash('sha256');
        hash.update(response.data);
        return hash.digest('hex');
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

export default ThirdPartyService;
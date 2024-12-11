import { Express } from "express";
import TokenService from "../service/TokenService";
import { getLog } from "../utils/LogUtils";
import DataUtils from "../utils/DataUtils";
import Result from "../common/Result";
import { ResultEnumCode, ResultEnumMsg } from "../common/Enum";
import VerifyUtils from "../utils/VerifyUtils";
import RedisUtils from "../utils/RedisUtils";
// import axios from 'axios';
// import multer from 'multer';
// import FormData from 'form-data';
// import { HttpsProxyAgent } from 'https-proxy-agent';


// const PINATA_API_KEY = process.env.PINATA_API_KEY;
// const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;
// const PINATA_ENDPOINT = process.env.PINATA_ENDPOINT as string;
// const DOMAIN_URL = process.env.DOMAIN_URL as string;

// const storage = multer.memoryStorage(); // 使用内存存储
// const upload = multer({ storage });

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // 文件保存目录
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname)); // 使用时间戳命名文件
//     }
// });
// const upload = multer({
//     storage, limits: {
//         fileSize: 5 * 1024 * 1024 // 限制文件大小为 5MB
//     },
// });

const logger = getLog("TokenControllers");

class TokenControllers {
    tokenService: TokenService;
    constructor(app: Express) {
        this.tokenService = new TokenService();
        this.initialize(app);
    }
    public initialize(app: Express) {
        // app.post("/token/search", async (req, res) => {
        //     if (!req.body || !req.body.keyword) {//所有数据都是空
        //         res.send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
        //         return;
        //     }
        //     const result = await this.tokenService.tokenSearch(req.body.keyword);
        //     res.send(DataUtils.serialize(result));
        // });
        /**
         * 代币排行榜
         * ody需要携带参数 当前页page 当前页要展示的数据条数size
         */
        app.post("/token/rank", async (req, res) => {
            if (!req.body || !req.body.page || !req.body.size) {//所有数据都是空
                res.send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
                return;
            }
            const result = await this.tokenService.tokenRank(req.body.page, req.body.size);
            res.send(DataUtils.serialize(result));
        })
        /**
         * 代币基础信息（地址，名称，icon等）
         * body需要携带参数 代币地址 address
         */
        app.post("/token", async (req, res) => {
            if (!req.body || !req.body.address) {//所有数据都是空
                res.send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
                return;
            }
            const result = await this.tokenService.token(req.body.naddress);
            res.send(DataUtils.serialize(result));
        })
        /**
         * 代币详情
         * body需要携带参数 代币地址 address
         */
        // app.post("/token/details", async (req, res) => {
        //     if (!req.body || !req.body.address) {//所有数据都是空
        //         res.send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
        //         return;
        //     }
        //     const result = await this.tokenService.tokenDetails(req.body.naddress);
        //     res.send(DataUtils.serialize(result));
        // })
        /**
         * 代币交易历史
         * body需要携带参数 代币地址 address
         */
        app.post("/token/history", async (req, res) => {
            if (!req.body || !req.body.address) {//所有数据都是空
                res.send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
                return;
            }
            const result = await this.tokenService.tokenHistory(req.body.naddress);
            res.send(DataUtils.serialize(result));
        })
        /**
         * 代币评论
         * body需要携带参数 代币地址 address
         */
        // app.post("/token/topic", async (req, res) => {
        //     if (!req.body || !req.body.address) {//所有数据都是空
        //         res.send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
        //         return;
        //     }
        //     const result = await this.tokenService.tokenTopic(req.body.naddress);
        //     res.send(DataUtils.serialize(result));
        // })
        /**
         * 创建代币
         * headers需要携带参数 token
         * body需要携带参数 name symbol icon
         */
        app.post("/token/create", async (req, res) => {
            const json = JSON.parse(JSON.stringify(req.headers));
            if (!json.token) {//检测钱包是否连接过
                res.send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorWalletNotConnect)));
                return;
            }
            if (!req.body || !req.body.name || !req.body.symbol || !req.body.icon) {//所有数据都是空
                res.send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
                return;
            }
            try {
                const result = await this.tokenService.tokenCreate(req.body.name, req.body.symbol, req.body.icon, VerifyUtils.getInstance().verifyToken(json.token));
                res.send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        })


        /******************************************************************************/
        /************************************ 测试 ************************************/
        /******************************************************************************/
        app.post("/token/zadd", async (req, res) => {
            RedisUtils.getInstance().zadd(req.body.key, req.body.score, req.body.value)
            res.send(DataUtils.serialize(new Result()));
        });
        app.post("/token/zrange", async (req, res) => {
            const start = (req.body.page - 1) * req.body.size
            const end = (req.body.page - 1) * req.body.size + (req.body.size - 1)
            console.log(start, end)
            const result = await RedisUtils.getInstance().zrevrange(req.body.key, start, end);
            console.log("result", result);
            res.send(DataUtils.serialize(new Result(ResultEnumCode.Succeed, result)));
        });
        app.post("/token/zcard", async (req, res) => {
            const result = await RedisUtils.getInstance().zcard(req.body.key)
            res.send(DataUtils.serialize(new Result(ResultEnumCode.Succeed, result)));
        });
        app.post("/token/zrank", async (req, res) => {
            const result = await RedisUtils.getInstance().zrank(req.body.key, req.body.member)
            res.send(DataUtils.serialize(new Result(ResultEnumCode.Succeed, result)));
        });


        /**
         * 生成代币
         */
        app.post("/token/generateToken", async (req, res) => {
            const json = JSON.parse(JSON.stringify(req.headers));
            let userId = json.userid;
            let {
                name,
                ticker,
                description,
                image = '',
                token_symbol = '',
                x_link = '',
                teltgram_link = '',
                discord_link = '',
                user_website = '',
                mintPdaAddress = '',
                tokenPdaAddress = ''
            } = req.body;
            if (!name || !ticker || !description || !userId) {
                logger.error(req.body);
                res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
                return;
            }
            try {
                let result = { data: {}, code: 200 } as any
                if (mintPdaAddress === '') { // 分享创建
                    result = await this.tokenService.generateToken(
                        userId,
                        name,
                        ticker,
                        description,
                        image,
                        token_symbol,
                        x_link,
                        teltgram_link,
                        discord_link,
                        user_website,
                        mintPdaAddress,
                        tokenPdaAddress
                    );
                    // if (result.code == 200) {
                    //     await this.tokenService.topic(userId, result.data.id, `${name}($${ticker})-${description}`, image);
                    // }
                } else { // 直接创建  只做代币信息的更新
                    result = await this.tokenService.updateTokenInfo2(userId, mintPdaAddress, tokenPdaAddress, x_link, teltgram_link, user_website, user_website);
                }
                let datalog = {
                    userId,
                    name,
                    ticker,
                    description,
                    image,
                    token_symbol,
                    x_link,
                    teltgram_link,
                    discord_link,
                    user_website,
                    mintPdaAddress,
                    tokenPdaAddress
                }
                logger.info('/token/generateToken', datalog);
                result.data = { id: result.data.id }
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });

        /**
         * 更新代币字段
         */
        app.post("/token/updateTokenInfo", async (req, res) => {
            const json = JSON.parse(JSON.stringify(req.headers));
            // if (!json.userid) {
            //     res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorWalletNotConnect)));
            //     return;
            // }
            let userId = json.userid;
            let {
                id,
                mintPdaAddress,
                tokenPdaAddress
            } = req.body;
            logger.info('/token/updateTokenInfo', { id, mintPdaAddress, tokenPdaAddress });
            try {
                const result = await this.tokenService.updateTokenInfo(userId, id, mintPdaAddress, tokenPdaAddress);
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });

        /**
         * 代币列表
         */
        app.post("/token/list", async (req, res) => {
            const json = JSON.parse(JSON.stringify(req.headers));
            // if (!json.userid) {
            //     res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorWalletNotConnect)));
            //     return;
            // }
            let userId = json.userid;
            let {
                type,
                page = 1,
                limit = 10,
                orderBy = "created_time",
                orderDirection = 'DESC', // 'ASC' | 'DESC'
                time,
                unit,
                marketCap,
                volume,
                following,
                completed,
                completing,
                spam,
                solPrice,
                searchTerm // 模糊匹配
            } = req.body;
            if (limit > 100) limit = 100;
            try {
                if (time === '') time = 30;
                if (unit === '') unit = 'DAY';
                const result = await this.tokenService.tokenList(type, userId, page, limit, time, unit, orderBy, orderDirection, marketCap, volume, following, completed, completing, spam, solPrice, searchTerm);
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });

        /**
         * 代币详情
         */
        app.post("/token/details", async (req, res) => {
            const json = JSON.parse(JSON.stringify(req.headers));
            // if (!json.userid) {
            //     res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorWalletNotConnect)));
            //     return;
            // }
            let userId = json.userid;
            const {
                id = 1
            } = req.body;
            if (!req.body || !req.body.id) {
                res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
                return;
            }
            try {
                const result = await this.tokenService.tokenDetails(userId, id);
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });

        /**
         * 涨幅
         */
        app.post("/token/getMarkup", async (req, res) => {
            const json = JSON.parse(JSON.stringify(req.headers));
            let userId = json.userid;
            const {
                tokenId, // 代币id
                time,
                unit
            } = req.body;
            if (!req.body || !req.body.tokenId) {
                res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
                return;
            }
            try {
                const result = await this.tokenService.getMarkup(userId, tokenId, time, unit);
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });

        app.post("/token/getTokenId", async (req, res) => {
            const json = JSON.parse(JSON.stringify(req.headers));
            let userId = json.userid;
            const {
                mintPdaAddress, // 代币mintaddr
            } = req.body;
            if (!req.body || !req.body.mintPdaAddress) {
                res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
                return;
            }
            try {
                const result = await this.tokenService.getTokenId(userId, mintPdaAddress);
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });

        /**
         * 代币模糊搜索
         */
        app.post("/token/search", async (req, res) => {
            const json = JSON.parse(JSON.stringify(req.headers));
            // if (!json.userid) {
            //     res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorWalletNotConnect)));
            //     return;
            // }
            let userId = json.userid;
            let {
                searchTerm,
                page = 1,
                limit = 10
            } = req.body;
            if (limit > 100) limit = 100;
            try {
                if (!req.body) {//所有数据都是空
                    res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
                    return;
                }
                const result = await this.tokenService.tokenSearch(userId, searchTerm, page, limit);
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });

        /**
         * 初始化代币，返回mint地址
         */
        app.post("/token/initMint", async (req, res) => {
            const json = JSON.parse(JSON.stringify(req.headers));
            let userId = json.userid;
            let {
            } = req.body;
            try {
                let result = await this.tokenService.backMint();
                logger.info('/token/initMint', result);
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });

        /**
         * 测试使用（不对外）
         */
        app.post("/token/backMintTest", async (req, res) => {
            const json = JSON.parse(JSON.stringify(req.headers));
            let userId = json.userid;
            let {
            } = req.body;
            try {
                let result = await this.tokenService.backMintTest();
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });

        /**
         * 代币评论列表
         */
        app.post("/token/topicList", async (req, res) => {
            console.log(req.headers)
            const json = JSON.parse(JSON.stringify(req.headers));
            // if (!json.userid) {
            //     res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorWalletNotConnect)));
            //     return;
            // }
            let userId = json.userid || '';
            if (!req.body || !req.body.tokenId) {//所有数据都是空
                res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
                return;
            }
            let {
                tokenId,
                page = 1,
                limit = 10,
                orderBy,
                orderDirection
            } = req.body;
            if (limit > 100) limit = 100;
            //TODO 获取个人中心数据
            try {
                const result = await this.tokenService.topicList(userId, Number(tokenId), page, limit, orderBy, orderDirection);
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });

        /**
         * 代币评论列表
         */
        app.post("/token/topicListTop", async (req, res) => {
            console.log(req.headers)
            const json = JSON.parse(JSON.stringify(req.headers));
            let userId = json.userid;
            if (!req.body || !req.body.tokenId) {//所有数据都是空
                res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
                return;
            }
            let {
                tokenId,
                page = 1,
                limit = 10,
                orderBy,
                orderDirection
            } = req.body;
            if (limit > 100) limit = 100;
            //TODO 获取个人中心数据
            try {
                const result = await this.tokenService.topicListTop(userId, Number(tokenId), page, limit, orderBy, orderDirection);
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });

        /**
         * 代币评论
         */
        // app.post("/token/topic", upload.fields([{ name: 'image' }]), async (req, res) => {
        app.post("/token/topic", async (req, res) => {
            console.log(req.headers)
            const json = JSON.parse(JSON.stringify(req.headers));
            // if (!json.userid) {
            //     res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
            //     return;
            // }
            let userId = json.userid;
            let {
                tokenId,
                content,
                image = ''
            } = req.body;
            if (!tokenId || !content) {
                res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
                return;
            }
            //TODO 获取个人中心数据
            try {
                // const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
                // if (files) {
                //     const file = files['image'] ? files['image'][0] : ''; // 获取 avatar 文件
                //     logger.info('topic->file', file);
                //     if (file) {
                //         const formData = new FormData();
                //         formData.append('file', file.buffer, { filename: file.originalname });
                //         // 上传文件到 Pinata
                //         logger.info('topic->headers', {
                //             pinata_api_key: PINATA_API_KEY,
                //             pinata_secret_api_key: PINATA_SECRET_API_KEY,
                //         });
                //         logger.info('topic->formData', formData)
                //         const response = await axios.post(PINATA_ENDPOINT, formData, {
                //             maxContentLength: Infinity,
                //             headers: {
                //                 pinata_api_key: PINATA_API_KEY,
                //                 pinata_secret_api_key: PINATA_SECRET_API_KEY,
                //             },
                //             // httpsAgent: agent,
                //         });
                //         logger.info('topic->response', response)
                //         let ipfsHash = '';
                //         if (response.data.IpfsHash) {
                //             ipfsHash = response.data.IpfsHash; // 获取 IpfsHash
                //             image = `${DOMAIN_URL}${ipfsHash}`;
                //         }
                //     }
                // }
                logger.info('/token/topic', { userId, tokenId: Number(tokenId), content, image });
                const result = await this.tokenService.topic(userId, Number(tokenId), content, image);
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });


        /**
         * trades
         */
        app.post("/token/trades", async (req, res) => {
            const json = JSON.parse(JSON.stringify(req.headers));
            // if (!json.userid) {
            //     res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorWalletNotConnect)));
            //     return;
            // }
            let userId = json.userid;
            if (!req.body || !req.body.tokenId) {//所有数据都是空
                res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
                return;
            }
            let {
                tokenId,
                page = 1,
                limit = 10
            } = req.body;
            //TODO 获取个人中心数据
            if (limit > 100) limit = 100;
            try {
                const result = await this.tokenService.trades(userId, Number(tokenId), page, limit);
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });

        /**
         * 代币持有者列表
         */
        app.post("/token/holder", async (req, res) => {
            const json = JSON.parse(JSON.stringify(req.headers));
            // if (!json.userid) {
            //     res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorWalletNotConnect)));
            //     return;
            // }
            let userId = json.userid;
            if (!req.body) {
                res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
                return;
            }
            let {
                tokenId,
                page = 1,
                limit = 10
            } = req.body;
            //TODO 获取个人中心数据
            if (limit > 100) limit = 100;
            try {
                const result = await this.tokenService.holder(userId, Number(tokenId), page, limit);
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });


        /**
         * k线图
         */
        app.post("/token/kLine", async (req, res) => {
            const json = JSON.parse(JSON.stringify(req.headers));
            // if (!json.userid) {
            //     res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorWalletNotConnect)));
            //     return;
            // }
            let userId = json.userid;
            if (!req.body || !req.body.tokenId) {//所有数据都是空
                res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
                return;
            }
            let {
                tokenId,
                page = 1,
                limit = 10
            } = req.body;
            //TODO 获取个人中心数据
            if (limit > 100) limit = 100;
            try {
                const result = await this.tokenService.kLine(Number(tokenId), page, limit);
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });


        /**
         * 获取sql转美元系数
         */
        app.post("/token/sqlPrice", async (req, res) => {
            try {
                const result = await this.tokenService.sqlPrice();
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });

        /**
         * 当前代币的最新价格
         */
        app.post("/token/nowAvePri", async (req, res) => {
            let {
                mintAddr
            } = req.body;
            try {
                const result = await this.tokenService.nowAvePri(mintAddr);
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });
    }
}

export default TokenControllers;
import { Express } from "express";
import ThirdPartyService from "../service/ThirdPartyService";
import DataUtils from "../utils/DataUtils";
import { getLog } from "../utils/LogUtils";
import Result from "../common/Result";
import { ResultEnumCode, ResultEnumMsg } from "../common/Enum";
const logger = getLog("ThirdPartyService");


class ThirdPartyControllers {
    thirdPartyService: ThirdPartyService;
    constructor(app: Express) {
        this.thirdPartyService = new ThirdPartyService();
        this.initialize(app);
    }
    public initialize(app: Express) {
        app.post('/api/tweets', async (req, res) => {
            const json = JSON.parse(JSON.stringify(req.headers));
            // if (!json.userid) {//检测钱包是否连接过
            //     res.send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorWalletNotConnect)));
            //     return;
            // }
            const tweetContent = req.body.text;
            try {
                if (tweetContent) {
                    const result = await this.thirdPartyService.sendtweets(tweetContent);
                    res.status(result.code).send(DataUtils.serialize(result));
                } else {
                    logger.error(req.body)
                    res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
                }
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });

        app.post('/api/generateImage', async (req, res) => {
            const json = JSON.parse(JSON.stringify(req.headers));
            // if (!json.userid) {//检测钱包是否连接过
            //     res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorWalletNotConnect)));
            //     return;
            // }
            let userId = json.userid;
            const { prompt } = req.body; // 获取用户输入的文本
            try {
                if (prompt) {
                    const result = await this.thirdPartyService.generateImages(userId, prompt);
                    res.status(result.code).send(DataUtils.serialize(result));
                } else {
                    logger.error(req.body)
                    res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
                }
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });

        app.post('/api/generateTaskId', async (req, res) => {
            const json = JSON.parse(JSON.stringify(req.headers));
            // if (!json.userid) {//检测钱包是否连接过
            //     res.send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorWalletNotConnect)));
            //     return;
            // }
            let userId = json.userid;
            const { prompt } = req.body; // 获取用户输入的文本
            try {
                if (prompt) {
                    const result = await this.thirdPartyService.generateTaskIdBatch(userId, prompt);
                    res.status(result.code).send(DataUtils.serialize(result));
                } else {
                    logger.error(req.body)
                    res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
                }
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });

        /**
         * 获取图片
         */
        app.post('/api/getImage', async (req, res) => {
            const json = JSON.parse(JSON.stringify(req.headers));
            // if (!json.userid) {
            //     res.send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorWalletNotConnect)));
            //     return;
            // }
            let userId = json.userid;
            const { taskId } = req.body;
            try {
                if (taskId) {
                    const result = await this.thirdPartyService.fetchTask(taskId);
                    res.status(200).send(DataUtils.serialize(new Result(ResultEnumCode.Succeed, result)));
                } else {
                    logger.error(req.body)
                    res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
                }
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });
    }

}

export default ThirdPartyControllers;
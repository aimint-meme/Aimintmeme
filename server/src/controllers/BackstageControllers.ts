import { Express } from "express";
import BackstageService from "../service/BackstageService";
import DataUtils from "../utils/DataUtils";
import { getLog } from "../utils/LogUtils";
import Result from "../common/Result";
import { ResultEnumCode, ResultEnumMsg } from "../common/Enum";
const logger = getLog("BackstageControllers");
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
// 指定密钥保存目录
const keyDirectory = path.join(__dirname, 'keys');

class BackstageControllers {
    backStageService: BackstageService;
    constructor(app: Express) {
        this.backStageService = new BackstageService();
        this.initialize(app);
    }
    public initialize(app: Express) {
        /**
         * 生成mintPdaAddress,私钥
         */
        app.post('/generate/keys', async (req, res) => {
            let {
                num = 1,
                value = 'm'
            } = req.body;
            try {
                const result = await this.backStageService.generateKeys(num, value);
                res.status(200).send(DataUtils.serialize(new Result(ResultEnumCode.Succeed, result)));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });

        /**
         * 内部使用
         */
        app.post('/generateKeys/insertData', async (req, res) => {
            try {
                const result = await this.backStageService.insertKeys();
                res.status(200).send(DataUtils.serialize(new Result(ResultEnumCode.Succeed, result)));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });

        /**
         * 注册
         */
        app.post("/backstage/register", async (req, res) => {
            let {
                username,
                password
            } = req.body;
            try {
                const result = await this.backStageService.register(username, password);
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });


        /**
         * 登录
         */
        app.post("/backstage/login", async (req, res) => {
            let {
                username,
                password
            } = req.body;
            try {
                const result = await this.backStageService.login(username, password);
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });


        /**
         * 趋势列表
         */
        app.post("/trend/list", async (req, res) => {
            let {
                keyword,
                prompt,
                source,
                status,
                startDate,
                endDate,
                page = 1,
                limit = 10
            } = req.body;
            try {
                const result = await this.backStageService.list(keyword, prompt, source, status, startDate, endDate, page, limit);
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });

        /**
         * 添加
         */
        app.post("/trend/put", async (req, res) => {
            let {
                keyword,
                prompt,
                source,
                status = "active"
            } = req.body;
            if (!req.body || !req.body.keyword) {//所有数据都是空
                res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
                return;
            }
            try {
                const result = await this.backStageService.put(keyword, prompt, source, status);
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });

        /**
         * 编辑
         */
        app.post("/trend/edit", async (req, res) => {
            let {
                id,
                keyword,
                prompt,
                source,
                status
            } = req.body;
            try {
                const result = await this.backStageService.edit(id, keyword, prompt, source, status);
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }
        });


        /**
         * 删除
         */
        app.post("/trend/delete", async (req, res) => {
            let {
                ids
            } = req.body;
            try {
                const result = await this.backStageService.delete(ids);
                res.status(result.code).send(DataUtils.serialize(result));
            } catch (error) {
                logger.error("", error);
                console.log(error);
                res.status(500).send(DataUtils.serialize(new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError)));
                return new Result(ResultEnumCode.ServerError, ResultEnumMsg.ServerError);
            }

        });

        /**
         * 编辑
         */
        app.post("/trend/enable", async (req, res) => {
            let {
                ids,
                enable
            } = req.body;
            if (!req.body || !req.body.enable || !['active', 'inactive'].includes(req.body.enable)) {
                res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorParam)));
                return;
            }
            try {
                const result = await this.backStageService.enable(ids, enable);
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

export default BackstageControllers;
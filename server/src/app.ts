import express from "express";
import WebSocket from "ws";
import "./common/Config";
import UserControllers from "./controllers/UserControllers";
import { getLog } from "./utils/LogUtils";
import TokenControllers from "./controllers/TokenControllers";
import HotspotControllers from "./controllers/HotspotControllers";
import BackstageControllers from "./controllers/BackstageControllers";
import ThirdPartyControllers from "./controllers/ThirdPartyControllers";
import TokenService from "./service/TokenService";
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import Result from "./common/Result";
import DataUtils from "./utils/DataUtils";
import { ResultEnumCode } from "./common/Enum";
import VerifyUtils from "./utils/VerifyUtils";
import RequestUtils from "./utils/RequestUtils";
import { Console } from "console";
import cors from "cors";
import cron from 'node-cron'; // 定时任务库
import listenForTokenCreations from "./tokenListener";
import RedisUtils from "./utils/RedisUtils";
// import { createProxyMiddleware } from "http-proxy-middleware"

const app = express();
app.use(cors());
// swagger
const swaggerDefinition = {
    info: {
        title: 'AIMint API',
        version: '1.0.0',
        description: 'Swagger 接口文档',
    },
    // host: 'localhost:6666',
    // basePath: '/',
};

// options for the swagger docs
const options = {
    // import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // path to the API docs
    apis: ['./docs/swagger*.yaml'],
};

// initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);
// serve swagger
app.get('/swagger.json', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());
// app.use('/uploads', express.static('uploads'));

const logger = getLog("app");
//后台登陆验证
app.use('/admin', async (req, res, next) => {
    console.log("admin", req.url)
    const igonreList = RequestUtils.getInstance().getIgoreList();
    const url = req.url.replace(/(.*)\//, '$1');//去掉结尾的斜杠，如果有多余的斜杠
    const found = igonreList.find(value => value == url);
    if (found) {
        next();
    }
    else {
        if (!req.body || !req.body.account || !req.body.password) {
            logger.error(req.body);
            res.send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorAccountOrPasswordNotNull)));
        }
        else {
            if (VerifyUtils.getInstance().verifyAdmin(req.body.account, req.body.password)) {
                next();
            }
            else {
                logger.error(req.body);
                res.send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorAccountOrPassword)));
            }
        }
    }
})
//客户端验证
app.use('/', async (req, res, next) => {
    console.log("front", req.url)
    const igonreList = RequestUtils.getInstance().getIgoreList();
    // const url = req.url.replace(/(.*)\//, '$1');//去掉结尾的斜杠，如果有多余的斜杠
    const url = req.url;
    const found = igonreList.find(value => value == url);
    if (found) {
        next();
    }
    else {
        const json = JSON.parse(JSON.stringify(req.headers));
        if (json.userid && await VerifyUtils.getInstance().verifyUserid(json.userid)) {
            next();
        } else {
            logger.error(req.headers);
            res.status(400).send(DataUtils.serialize(Result.ResultError(ResultEnumCode.ErrorWalletNotConnect)));
        }
    }
})
new UserControllers(app);
new TokenControllers(app);
new HotspotControllers(app);
new BackstageControllers(app);
new ThirdPartyControllers(app);


listenForTokenCreations()

// 全局异常处理
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error.message);
    logger.log('Uncaught Exception:', error.message);
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    logger.log('Uncaught Rejection:', reason);
});

const server = app.listen(process.env.PORT, () => {
    const log = `Server Start ${process.env.NODE_ENV} Prot:${process.env.PORT}`
    console.log(log)
    logger.info(log);
})

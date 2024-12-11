import { ResultEnumCode, ResultEnumMsg } from "../common/Enum";

class ResultUtils {
    private static instance: ResultUtils;
    public static getInstance() {
        if (!ResultUtils.instance) {
            ResultUtils.instance = new ResultUtils();
        }
        return ResultUtils.instance;
    }

    msg: Map<number, string>;
    constructor() {
        this.msg = new Map();
        this.msg.set(ResultEnumCode.ErrorSQL, ResultEnumMsg.ErrorSQL)
        this.msg.set(ResultEnumCode.ErrorParam, ResultEnumMsg.ErrorParam)
        this.msg.set(ResultEnumCode.ErrorAccountOrPasswordNotNull, ResultEnumMsg.ErrorAccountOrPasswordNotNull)
        this.msg.set(ResultEnumCode.ErrorAccountOrPassword, ResultEnumMsg.ErrorAccountOrPassword)
        this.msg.set(ResultEnumCode.ErrorWalletNotConnect, ResultEnumMsg.ErrorWalletNotConnect)
        this.msg.set(ResultEnumCode.ErrorTokenExpired, ResultEnumMsg.ErrorTokenExpired)
        this.msg.set(ResultEnumCode.ErrorSignature, ResultEnumMsg.ErrorSignature)
        this.msg.set(ResultEnumCode.ErrorInitMint, ResultEnumMsg.ErrorInitMint)
    }
}

export default ResultUtils;
import { getLog } from "../utils/LogUtils";
import ResultUtils from "../utils/ResultUtils"
import { ResultEnumCode } from "./Enum";

const logger = getLog("Result");
class Result<T> {
    code: number;
    // message: string;
    data: T;
    
    constructor(code?: number, data?: T) {
        this.code = code ? code : 200;
        // this.message = message ? message : "";
        this.data = data ? data : "" as any;
        if(code && code != ResultEnumCode.Succeed){
            logger.error(code, data)
        }
    }

    static ResultError(code:number){
        return new Result(code, ResultUtils.getInstance().msg.get(code))
    }
}

export default Result;
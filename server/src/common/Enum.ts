export enum ResultEnumCode {
    Succeed = 200,
    BadRequest = 400,
    ServerError = 500,
    ErrorSQL = 10001,//查询sql错误
    ErrorParam,// = 10002,//参数错误
    ErrorAccountOrPasswordNotNull,//参数错误
    ErrorAccountOrPassword,//参数错误
    ErrorWalletNotConnect,//钱包没有连接
    ErrorTokenExpired,//钱包没有连接
    ErrorSignature,//签名异常
    ErrorInitMint,// 初始化公钥异常
}
export enum ResultEnumMsg {
    Succeed = "Succeed",
    ErrorSQL = "sql error!",
    BadRequest = "Bad Request",
    ServerError = "Internal Server Error",
    ErrorParam = "Param error!",
    ErrorAccountOrPasswordNotNull = "Account or Password cannot be empty!",//参数错误
    ErrorAccountOrPassword = "Account or Password is incorrect!",//参数错误
    ErrorWalletNotConnect = "Wallet not connected!",//钱包没有连接
    ErrorTokenExpired = "Token expired!",
    ErrorSignature = "Signature error!",//签名错误
    ErrorInitMint = "InitMint error!",
}
import bs58 from "bs58"
import nacl from "tweetnacl";
import MySQLUtils from "../utils/MySQLUtils";
// import jwt from 'jsonwebtoken';
class VerifyUtils {
    private static instance: VerifyUtils;
    public static getInstance() {
        if (!VerifyUtils.instance) {
            VerifyUtils.instance = new VerifyUtils();
        }
        return VerifyUtils.instance;
    }
    /**
     * 验证用户钱包
     * @param token 用户携带过来的token
     */
    verifyWallet(address: string, signature: string) {
        console.log(address, signature)
        const message = `Hello ${address}, Welcome to AIMint!`;
        const verify = nacl.sign.detached.verify(
            new TextEncoder().encode(message),
            bs58.decode(signature),
            bs58.decode(address)
        )
        console.log(verify)
        return verify//返回钱包地址
    }

    verifyToken(token: string) {
        //TODO 从Redis中查找是否登陆，如果没有登陆，或者失效，返回空字符串
        return "123123"//返回钱包地址
    }

    // 验证userid
    async verifyUserid(userid: string) {
        const [user] = await MySQLUtils.getInstance().select('user_details', '\`user_id\`=?', [userid]) as any;
        if (user.length === 0) return false;
        return true;
    }

    /**
     * 验证后台管理员账号，验证通过后返回一个token
     * @param account  账号
     * @param password 密码
     */
    verifyAdmin(account: string, password: string) {

        return "123123";
    }
}

export default VerifyUtils;
class RequestUtils {
    private static instance: RequestUtils;
    public static getInstance() {
        if (!RequestUtils.instance) {
            RequestUtils.instance = new RequestUtils();
        }
        return RequestUtils.instance;
    }

    msg: Array<string>;
    constructor() {
        this.msg = new Array();
        // this.msg.push()
    }

    getIgoreList(){
        const str:string | undefined = process.env.VERIFICATION_IGNORE;
        if(str){
            const space = RequestUtils.getInstance().replaceAll(str,' ', '');
            return space.split(',')
        }
        return [];
    }
    replaceAll(str: string, find: string, replace: string): string {
        return str.replace(new RegExp(find, 'g'), replace);
    }
}
export default RequestUtils;
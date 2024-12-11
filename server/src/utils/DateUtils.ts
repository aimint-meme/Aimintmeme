import moment from "moment";

class DateUtils {
    private static instance: DateUtils;
    public static getInstance() {
        if (!DateUtils.instance) {
            DateUtils.instance = new DateUtils();
        }
        return DateUtils.instance;
    }

    public getCurrTime() {
        return moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    }



    /**
     * 日期格式转化
     * @param isoString 世家
     * @param timeZone 时区
     * @returns 
     */
    static formatDate(isoString: string, timeZone?: string): string {
        const date = new Date(isoString);
        // 获取指定时区的时间
        const options: Intl.DateTimeFormatOptions = {
            timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        const localDate = new Date(date.toLocaleString('en-US', options));
        // 获取年、月、日、时、分、秒
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，所以要 +1
        const day = String(localDate.getDate()).padStart(2, '0');
        const hours = String(localDate.getHours()).padStart(2, '0');
        const minutes = String(localDate.getMinutes()).padStart(2, '0');
        const seconds = String(localDate.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    static formatDate2(isoString: string, timeZone?: string): string {
        const date = new Date(isoString);
        // 获取指定时区的时间
        const options: Intl.DateTimeFormatOptions = {
            timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        const localDate = new Date(date.toLocaleString('en-US', options));
        // 获取年、月、日、时、分、秒
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，所以要 +1
        const day = String(localDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    //计算时间差
    static calculateTimeDifference(date1Str: string, date2Str: string) {
        const date1 = new Date(date1Str) as any;
        const date2 = new Date(date2Str) as any;
        // 计算时间差（毫秒）
        const timeDiff = date2 - date1;
        const diffInMinutes = Math.floor(timeDiff / (1000 * 60)); // 转换为分钟
        const diffInHours = Math.floor(timeDiff / (1000 * 60 * 60)); // 转换为小时
        const diffInDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // 转换为天数
        return {
            minutes: diffInMinutes,
            hours: diffInHours,
            days: diffInDays
        };
    }

    // 获取当前时间
    static getCurrentFormattedTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以要加1
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    // 加一天
    static addOneDay(dateString: string) {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);// 加一天
        return date.toISOString().split('T')[0]; // 只保留日期部分
    }

    // 减少一天
    static redeceOneDay(dateString: string) {
        const date = new Date(dateString);
        date.setDate(date.getDate() - 1);// 加一天
        return date.toISOString().split('T')[0]; // 只保留日期部分
    }

    // 时间戳转为UTC时间
    static convertToMySQLDateTimeUTC(milliseconds: number) {
        const date = new Date(milliseconds);
        // slice(0, 19) 取前 19 个字符，去掉了毫秒和时区信息，结果是 YYYY-MM-DDTHH:mm:ss。
        return date.toISOString().slice(0, 19).replace('T', ' ');
        // return date.toISOString().replace('T', ' ');
    }

    // 时间戳转为服务器时间
    static convertToMySQLDateTime(milliseconds: number) {
        const date = new Date(milliseconds);
        // 获取本地时间各部分
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const secondsPart = String(date.getSeconds()).padStart(2, '0');
        // 拼接 MySQL DATETIME 格式
        return `${year}-${month}-${day} ${hours}:${minutes}:${secondsPart}`;
    }
}

export default DateUtils;
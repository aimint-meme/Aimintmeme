import Result from "../common/Result";
import axios from 'axios';

class DataUtils {
    /**
     * 对象转JSON
     * @param data 
     */
    static serialize(data: Result<any>) {
        return JSON.stringify(data);
    }
    /**
     * JSON转对象
     * @param json 
     */
    static unserialize(json: string) {
        return JSON.parse(json);
    }

    /**
     * 字段转为驼峰格式
     * @param rows []
     * @returns 
     */
    static toCamelCase(rows: Array<{ [key: string]: any }>) {
        const camelCase = (str: string) => {
            return str.replace(/(_\w)/g, (matches) => matches[1].toUpperCase());
        };
        const resultArray = rows.map(item => {
            return Object.keys(item).reduce((acc, key) => {
                acc[camelCase(key)] = item[key];
                return acc;
            }, {} as Record<string, any>); // 使用 Record<string, any> 指定返回对象的类型
        });
        return resultArray;
    }

    /**
     * 去除数据中的指定字段，支持单个对象和数组
     * @param data 需要处理的对象或对象数组
     * @param fields 要移除的字段名数组
     * @returns 处理后的对象或数组，去掉指定字段
     */
    static removeFields<T extends Record<string, any> | Record<string, any>[]>(data: T, fields: string[]): T {
        if (Array.isArray(data)) {
            // 如果 data 是数组，对每个对象进行移除指定字段处理
            return data.map(item => {
                const newItem = { ...item } as Record<string, any>; // 确保 newItem 是对象类型
                fields.forEach(field => {
                    delete newItem[field];
                });
                return newItem;
            }) as T;
        } else if (data && typeof data === 'object') {
            // 如果 data 是单个对象，移除指定字段
            const newItem = { ...data } as Record<string, any>; // 确保 newItem 是对象类型
            fields.forEach(field => {
                delete newItem[field];
            });
            return newItem as T;
        }
        return data; // 如果 data 不是对象或数组，直接返回原始数据
    }


    static parseLog(log: string) {
        const regex = /(\w+):([^,]+)/g;
        const result: any = {};
        let match;
        while ((match = regex.exec(log)) !== null) {
            const key = match[1].trim();
            const value = match[2].trim();
            result[key] = value;
        }
        return result;
    }


    // poolSolBalance
    static convertToPercentage(value: number) {
        // return (value * 100).toFixed(2) + '%';
        return (value).toFixed(4) + '%';
    }

    static calculateValue(percentage: number, quantity: number) {
        if (percentage === 100) {
            return 4;
        } else if (percentage > 60 && percentage < 100) {
            return 6;
        } else if (percentage > 20 && percentage <= 60) {
            return 5;
        } else if (percentage > 0 && percentage <= 20) {
            return 2;
        } else if (percentage === 0 && quantity === 0) {
            return 3;
        } else {
            return 1;
        }
    }

    static compareValues(startValue: string, currentValue: string) {
        const start = parseFloat(startValue);
        const current = parseFloat(currentValue);

        // 计算变化量
        const change = current - start;

        // 判断变化并计算百分比
        let percentageChange: any;
        if (start === 0) {
            percentageChange = current === 0 ? 0 : current; // 特殊情况处理
        } else {
            percentageChange = (change / start) * 100 as number;
        }

        // 格式化输出
        if (percentageChange > 0) {
            return `+${percentageChange.toFixed(2)}%`; // 增长
        } else if (percentageChange < 0) {
            return `${percentageChange.toFixed(2)}%`; // 降低
        } else {
            return '0%'; // 不变
        }
    }

    static setColour(markup: string, poolSolBalance: number = 1, marketCap: number = 0) {
        let colour;
        // 判断markup是否以+开头
        if (markup.startsWith('+')) {
            colour = poolSolBalance === 0 && marketCap > 0 ? 1 : 3; // + 开头，balance 是否为 0
        } else if (markup.startsWith('-')) {
            colour = poolSolBalance === 0 && marketCap > 0 ? 1 : 2; // 设置为2
        } else if (markup === '0%') {
            colour = poolSolBalance === 0 && marketCap > 0 ? 1 : 4; // 设置为4
        } else {
            colour = 5; // 或者根据需求设置为其他值
        }
        return {
            markup,
            colour
        };
    }

    static formatKLine(data: any) {
        const lastValues = {
            t: [data.t[data.t.length - 1]],
            o: [data.o[data.o.length - 1]],
            h: [data.h[data.h.length - 1]],
            l: [data.l[data.l.length - 1]],
            c: [data.c[data.c.length - 1]],
            v: [data.v[data.v.length - 1]],
            s: data.s
        };
        return lastValues
    }

    static async fetchSolPrice() {
        try {
            const response = await axios.get('https://frontend-api.pump.fun/sol-price');
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching SOL price:', error);
        }
    }

    static async fetchTokenUri(uri: string) {
        if (!uri) {
            console.error('Error: URI is required');
            return {};
        }
        try {
            const response = await axios.get(uri);
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching SOL price:', error);
            return {};
        }
    }

    static async getTokenHolders(minAddress: string) {
        try {
            const response = await axios.get(`https://api.solscan.io/token/holders?tokenAddress=${minAddress}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            console.log('Token Holders:', response.data);
        } catch (error) {
            console.error('Error fetching token holders:', error);
        }
    }

}
export default DataUtils;
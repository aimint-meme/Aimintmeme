import { configure, getLogger } from "log4js";

configure({
    appenders:{
        access:{
            type: 'dateFile',
            filename: './logs/file.log',
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true,
            layout:{
                type:'basic'
            },
            numBackups: 4
        }
    },
    categories:{
        default:{
            appenders :['access'],
            level: 'info'
        }
    }
})
export function getLog(category = 'Access'){
    return getLogger(category)
}
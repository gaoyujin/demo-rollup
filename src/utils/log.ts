import * as log4js from "log4js";

//logger 是log4js的实例
log4js.configure({
  appenders: { cheese: { type: "file", filename: "swaggerTots.log" } },
  categories: { default: { appenders: ["cheese"], level: "info" } },
});
export const logger = log4js.getLogger();
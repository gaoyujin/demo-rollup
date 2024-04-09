import { defineConfig } from "../models/swaggerConfig"
import { logger } from "../utils/log"
import { isValidUrl } from "../utils/pattern"

// 验证参数
function validateConfig(swaggerUrl: string) {
  if (!swaggerUrl) {
    logger.error("swaggerUrl is required")
    return false
  }

  if (!isValidUrl(swaggerUrl)) {
    logger.error("swaggerUrl must be URL")
    return false
  }

  return true
}

export class SwaggerToTypescript {
  swaggerUrl: string = ''
  configData: defineConfig = {}

  constructor(swaggerUrl: string, callback: Function) {
    debugger
    if (!validateConfig(swaggerUrl)) {
      return
    }

    if (callback) {
      // 处理完成回调
      try {
        callback();   
      }catch (error) {
          logger.error("callback error:", error)
      }
    }
  }
}
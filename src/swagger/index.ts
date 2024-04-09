import { DefineConfig } from '../models/swaggerConfig'
import { logger } from '../utils/log'
import { isValidUrl } from '../utils/pattern'
import { defaultConfig, getConfigInfo } from './config'
import { getSwaggerInfo } from './swagger'

// 验证参数
function validateConfig(swaggerUrl: string) {
  if (!swaggerUrl) {
    logger.error('swaggerUrl is required')
    return false
  }

  if (!isValidUrl(swaggerUrl)) {
    logger.error('swaggerUrl must be URL')
    return false
  }

  return true
}

export class SwaggerToTypescript {
  swaggerUrl: string = ''
  configData: DefineConfig = {}

  constructor(swaggerUrl: string, callback: Function) {
    // 验证参数
    if (!validateConfig(swaggerUrl)) {
      return
    }

    // 读取配置信息
    this.swaggerUrl = swaggerUrl
    this.configData = {
      ...defaultConfig,
      ...getConfigInfo(),
    }
    logger.info('configData:', JSON.stringify(this.configData))
    
    // 获取swagger信息
    getSwaggerInfo(this.swaggerUrl, this.configData)

    if (callback) {
      // 处理完成回调
      try {
        callback()
      } catch (error) {
        logger.error('callback error:', error)
      }
    }
  }
}

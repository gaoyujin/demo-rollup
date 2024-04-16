import { DefineConfig } from '../models/swaggerConfig'
import { logger } from '../utils/log'
import { isValidUrl } from '../utils/pattern'
import { defaultConfig, getConfigInfo } from './config'
import { createServiceDir, createServiceFile, getSwaggerInfo } from './swagger'

// 验证参数
function validateParams(swaggerUrl: string) {
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
    if (!validateParams(swaggerUrl)) {
      return
    }

    // 读取配置信息
    this.swaggerUrl = swaggerUrl
    this.configData = {
      ...defaultConfig,
    }

    const settingInfo: DefineConfig = getConfigInfo()
    if (settingInfo) {
      this.configData.excludePaths = settingInfo.excludePaths
        ? settingInfo.excludePaths
        : this.configData.excludePaths

      this.configData.includePaths = settingInfo.includePaths
        ? settingInfo.includePaths
        : this.configData.includePaths

      this.configData.isHttps = settingInfo.isHttps
        ? settingInfo.isHttps
        : this.configData.isHttps

      this.configData.swaggerVersion = settingInfo.swaggerVersion
        ? settingInfo.swaggerVersion
        : this.configData.swaggerVersion

      this.configData.serverNameSettings = settingInfo.serverNameSettings
        ? settingInfo.serverNameSettings
        : this.configData.serverNameSettings

      this.configData.fileSettings!.api = settingInfo.fileSettings?.api
        ? settingInfo.fileSettings?.api
        : this.configData.fileSettings!.api

      this.configData.fileSettings!.model = settingInfo.fileSettings?.model
        ? settingInfo.fileSettings?.model
        : this.configData.fileSettings!.model

      this.configData.fileSettings!.topAlias = settingInfo.fileSettings
        ?.topAlias
        ? settingInfo.fileSettings?.topAlias
        : this.configData.fileSettings!.topAlias

      this.configData.fileSettings!.topDirPath = settingInfo.fileSettings
        ?.topDirPath
        ? settingInfo.fileSettings?.topDirPath
        : this.configData.fileSettings!.topDirPath

      this.configData.fileSettings!.extNameType = settingInfo.fileSettings
        ?.extNameType
        ? settingInfo.fileSettings?.extNameType
        : this.configData.fileSettings!.extNameType

      this.configData.fileSettings!.content = settingInfo.fileSettings?.content
        ? settingInfo.fileSettings?.content
        : this.configData.fileSettings!.content
    }

    logger.info('configData:', JSON.stringify(this.configData))

    // swagger 信息处理
    this.handleSwaggerInfo(this.swaggerUrl, this.configData)

    if (callback) {
      // 处理完成回调
      try {
        callback()
      } catch (error) {
        logger.error('callback error:', error)
      }
    }
  }

  // swagger 信息处理
  async handleSwaggerInfo(url: string, configData: DefineConfig) {
    // 获取swagger信息
    const resSwagger = await getSwaggerInfo(url, configData)

    if (!resSwagger) {
      return
    } else {
      // 验证版本号
      if (
        resSwagger.swagger != this.configData.swaggerVersion ||
        resSwagger.swagger !== '2.0'
      ) {
        console.error(
          'version not match, only support swagger version: 2.0',
          'serverInfo:' + resSwagger.swagger,
          'configInfo:' + this.configData.swaggerVersion
        )
        return
      }

      // 创建服务目录
      const dirRes = createServiceDir(resSwagger, configData)
      if (!dirRes) {
        return
      }

      // 创建服务的Controller
      const controllerRes = createServiceFile(resSwagger, configData)
      if (!controllerRes) {
        return
      }

      // 获取所有的Controller的接口信息

      // 处理每个tag
      //for (const tag of resSwagger.tags) {
      //}
    }
  }
}

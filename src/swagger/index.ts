import { Swagger } from '../models/swagger'
import { DefineConfig } from '../models/swaggerConfig'
import { logger } from '../utils/log'
import { isValidUrl } from '../utils/pattern'
import { defaultConfig, getConfigInfo, writeConfigInfo } from './config'
import { createServiceDir, createServiceFile, getSwaggerInfo } from './swagger'
import axios from 'axios'

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

// 获取服务信息
export async function getServiceInfo(
  swaggerInfo: Swagger,
  configData: DefineConfig
) {
  try {
    if (
      !configData ||
      !configData.nodeServe ||
      !configData.nodeServe.url ||
      !swaggerInfo.info.title
    ) {
      return
    }

    const url =
      configData.nodeServe.url +
      `/serve/getByName?name=${swaggerInfo.info.title}`
    const response = await axios.get(url)
    if (!response) {
      console.error('getByName is err')
    } else {
      if (response.status == 200) {
        // 拿到swagger数据
        configData.nodeServe.serverData = response.data.data

        await getControllerInfo(configData)
      } else {
        console.error("can't fond getByName method")
      }
    }
  } catch (e: any) {
    console.error('error:' + e.message)
  }
}

// 获取Controller信息
export async function getControllerInfo(configData: DefineConfig) {
  try {
    if (!configData || !configData.nodeServe || !configData.nodeServe.url) {
      return
    }

    const url =
      configData.nodeServe.url +
      `/controller/queryByServe?code=${configData.nodeServe.serverData.code}`
    const response = await axios.get(url)
    if (!response) {
      console.error('queryByServe is err')
    } else {
      if (response.status == 200) {
        // 拿到swagger数据
        configData.nodeServe.controllerData = response.data.data

        await getMethodInfo(configData)
      } else {
        console.error("can't fond queryByServe controller")
      }
    }
  } catch (e: any) {
    console.error('error:' + e.message)
  }
}

// 组合所有Controller
function processControllerCode(configData: DefineConfig) {
  try {
    // 检查 configData 是否为空或未定义
    if (!configData) {
      return
    }
    // 检查 configData.nodeServe 是否为空或未定义
    if (!configData.nodeServe) {
      return
    }
    // 检查 configData.nodeServe.url 是否为空或未定义
    if (!configData.nodeServe.url) {
      return
    }
    // 检查 configData.nodeServe.controllerData 是否为空或未定义
    if (
      !configData.nodeServe.controllerData ||
      !Array.isArray(configData.nodeServe.controllerData)
    ) {
      return
    }
    // 使用 map 方法生成代码字符串
    const codes = configData.nodeServe.controllerData
      .map((controller) => controller.code)
      .join(',')

    return codes
  } catch (e) {
    // 使用 console.error 而不是 console.log，以避免在错误信息中暴露堆栈跟踪
    console.error('Error processing controller code:', e.message)
  }
}

// 获取Method信息
export async function getMethodInfo(configData: DefineConfig) {
  try {
    if (!configData || !configData.nodeServe || !configData.nodeServe.url) {
      return
    }

    const codes = processControllerCode(configData)

    const url =
      configData.nodeServe.url + `/method/queryByController?codes=${codes}`
    const response = await axios.post(url)
    if (!response) {
      console.error('queryByController is err')
    } else {
      if (response.status == 200) {
        // 拿到swagger数据
        configData.nodeServe.methodData = response.data.data
      } else {
        console.error("can't fond queryByController method")
      }
    }
  } catch (e: any) {
    console.error('error:' + e.message)
  }
}

// 获取Node服务信息
export function getNodeServiceInfo(configData: DefineConfig) {
  if (configData.nodeServe && configData.nodeServe.url) {
    try {
    } catch (error) {
      logger.error('get node serve info error:', error)
    }
  }
}

export class SwaggerToTypescript {
  swaggerUrl: string = ''
  configData: DefineConfig = {}

  constructor(swaggerUrl: string, cmd: any, callback: Function) {
    console.log('swaggerUrl:', cmd)
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
    writeConfigInfo(this.configData, settingInfo)
    logger.info('configData:', JSON.stringify(this.configData))

    // swagger 信息处理
    this.handleSwaggerInfo(this.swaggerUrl, this.configData, cmd)

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
  async handleSwaggerInfo(url: string, configData: DefineConfig, cmd: any) {
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
      if (cmd.mode) {
        // 根据配置获取Node服务信息
        await getServiceInfo(resSwagger, configData)
      }

      // 创建服务的Controller
      const controllerRes = createServiceFile(resSwagger, configData)
      if (!controllerRes) {
        return
      }

      console.info('swagger 信息处理完成')
    }
  }
}

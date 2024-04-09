import { Swagger } from '../models/swagger'
import { DefineConfig } from '../models/swaggerConfig'
import { logger } from '../utils/log'
import axios from 'axios'

// 获取真正的swaggerUrl
export const getSwaggerUrl = (url: string, configData: DefineConfig) => {
  const httpUrl = url.split('://')
  const urlArr = httpUrl[1].split('/')
  var swaggerUrl = httpUrl[0] + '://' + urlArr[0] + '/v2/api-docs'
  if (!configData.isHttps) {
    swaggerUrl = swaggerUrl.replace('https', 'http')
  }

  return swaggerUrl
}

// 根据url 获取swagger信息
export const getSwaggerInfo = (url: string, configData: DefineConfig) => {
  const swaggerUrl = getSwaggerUrl(url, configData)
  axios.get(swaggerUrl).then((response: any) => {
    try {
      if (response.status == 200) {
        // 拿到swagger数据
        const swagger: Swagger = response.data
        logger.info('swaggerInfo:',JSON.stringify(swagger))

      } else {
        console.error("can't fond swagger api-docs")
      }
    } catch (e: any) {
      console.error('error:' + e.message)
    }
  })
}

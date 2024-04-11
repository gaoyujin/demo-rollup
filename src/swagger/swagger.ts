import { logger } from './../utils/log';
import { Swagger, SwaggerInfo } from '../models/swagger'
import { DefineConfig } from '../models/swaggerConfig'
import { ContentStyle } from '../models/swaggerEnum'
// import { logger } from '../utils/log'
import { createFile, makeDirSync } from '../utils/file'
import axios from 'axios'
import path from 'path'
import fs from 'fs'
import {getControllerPaths} from './swaggerPaths'

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
export const getSwaggerInfo = async (
  url: string,
  configData: DefineConfig
): Promise<Swagger | undefined> => {
  const swaggerUrl = getSwaggerUrl(url, configData)
  let resSwagger: Swagger | undefined = undefined
  try {
    const response = await axios.get(swaggerUrl)
    if (!response) {
      console.error('response is undefined')
    } else {
      if (response.status == 200) {
        // 拿到swagger数据
        resSwagger = response.data
        //logger.info('swaggerInfo:', JSON.stringify(resSwagger))
      } else {
        console.error("can't fond swagger api-docs")
      }
    }
  } catch (e: any) {
    console.error('error:' + e.message)
  }

  return resSwagger
}

// 获取服务配置文件名称
export const getServiceConfigFileName = (
  configInfo: SwaggerInfo,
  configData: DefineConfig
) => {
  // 获取目录名称
  let serviceName = configInfo.title

  if (
    configData.serverNameSettings &&
    configData.serverNameSettings.length > 0
  ) {
    const filter = configData.serverNameSettings.find(
      (item) => item.name === configInfo.title
    )
    if (filter && filter.fileName) {
      serviceName = filter.fileName
    }
  }

  return serviceName
}

// 获取文件生成的路径
export const createFilePath = (
  configInfo: SwaggerInfo,
  configData: DefineConfig
) => {
  // 获取目录名称
  let serviceName = getServiceConfigFileName(configInfo, configData)

  const modelPath =
    process.cwd() +
    path.sep +
    configData.fileSettings?.topDirPath +
    path.sep +
    configData.fileSettings?.model.dirName +
    path.sep +
    serviceName
  const apiPath =
    process.cwd() +
    path.sep +
    configData.fileSettings?.topDirPath +
    path.sep +
    configData.fileSettings?.api.dirName +
    path.sep +
    serviceName
  configData.runDataInfo!.modelPath = modelPath
  configData.runDataInfo!.apiPath = apiPath

  console.log('modelPath:', modelPath)
  console.log('apiPath:', apiPath)

  // 创建实体的目录
  if (
    !configData.fileSettings?.content ||
    configData.fileSettings?.content === ContentStyle.all ||
    configData.fileSettings?.content === ContentStyle.onlyModel
  ) {
    makeDirSync(modelPath)
  }

  // 创建api的目录
  if (
    !configData.fileSettings?.content ||
    configData.fileSettings?.content === ContentStyle.all ||
    configData.fileSettings?.content === ContentStyle.onlyApi
  ) {
    makeDirSync(apiPath)
  }
}

// 创建服务目录
export const createServiceDir = (
  swaggerInfo: Swagger,
  configData: DefineConfig
): Boolean => {
  if (!swaggerInfo.info || !swaggerInfo.info.title) {
    console.error('swaggerInfo.info.title is undefined')
    return false
  }

  if (!swaggerInfo.info || !swaggerInfo.info.title) {
    console.error('swaggerInfo.info.title is undefined')
    return false
  }

  // swagger的Info信息
  const dataInfo: SwaggerInfo = swaggerInfo.info

  // 获取目录名称
  createFilePath(dataInfo, configData)

  return true
}

// 创建服务文件
export const createServiceFile = (
  swaggerInfo: Swagger,
  configData: DefineConfig
): Boolean => {
  // 验证tags对象
  if (!swaggerInfo.tags || swaggerInfo.tags.length === 0) {
    console.error('swagger tags is empty')
    return false
  }

  const paths = []
  // 获取tags路径
  for (let i = 0; i < swaggerInfo.tags.length; i++) {
    const item = swaggerInfo.tags[i]
    if (!item.description) {
      console.error('swagger tags.description is empty, i=' + i)
      continue
    }

    // 设置tag的对象
    getControllerPaths(swaggerInfo,configData,item.name)
    
    // 创建controller的路径
    const arrStr = item.description.split(' ')
    paths.push(arrStr.join('') + '.ts')
  }

  logger.info('runDataInfo:', JSON.stringify(configData.runDataInfo))

  for (let i = 0; i < paths.length; i++) {
    const pathStr = paths[i]

    // 创建实体的文件
    if (
      !configData.fileSettings?.content ||
      configData.fileSettings?.content === ContentStyle.all ||
      configData.fileSettings?.content === ContentStyle.onlyModel
    ) {
      const fileDir = configData.runDataInfo!.modelPath + path.sep + pathStr
      try {
        // 异步检查
        fs.access(fileDir, fs.constants.F_OK, (err) => {
          if (err) {
            console.error('文件或目录不存在')
            createFile(fileDir, 'AAAA')
            return
          }
          // 文件或目录存在
          console.log('文件或目录存在')
          createFile(fileDir, 'BBBB')
        })
      } catch (err) {
        console.error('文件或目录不存在')
      }
    }

    // 创建api的文件
    if (
      !configData.fileSettings?.content ||
      configData.fileSettings?.content === ContentStyle.all ||
      configData.fileSettings?.content === ContentStyle.onlyApi
    ) {
      //makeDirSync(configData.runDataInfo!.apiPath + path.sep + pathStr)
      // to do
      console.log('create api file')
    }
  }

  return true
}

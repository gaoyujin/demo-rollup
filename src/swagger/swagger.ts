import { ApiCacheData, Swagger, SwaggerInfo } from '../models/swagger'
import { DefineConfig } from '../models/swaggerConfig'
import { ContentStyle } from '../models/swaggerEnum'
// import { logger } from '../utils/log'
import { accessFile, makeDirSync } from '../utils/file'
import axios from 'axios'
import path from 'path'
import {
  getApiContent,
  getApiHookContent,
  getControllerPaths,
  getModelContent,
  processRefItem,
} from './swaggerPaths'

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
  configData.runDataInfo!.importPath =
    configData.fileSettings!.topAlias +
    '/' +
    configData.fileSettings?.model.dirName +
    '/' +
    serviceName
  configData.runDataInfo!.hookImportPath =
    configData.fileSettings!.topAlias +
    '/' +
    configData.fileSettings?.api.dirName +
    '/' +
    serviceName

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

// 根据tags，整理数据
export const getTagsData = (swaggerInfo: Swagger, configData: DefineConfig) => {
  const pathsType: string[] = []
  const pathNamesType: string[] = []
  const result = {
    paths: pathsType,
    pathNames: pathNamesType,
  }

  // 获取tags路径
  for (let i = 0; i < swaggerInfo.tags.length; i++) {
    const item = swaggerInfo.tags[i]
    if (!item.description) {
      console.error('swagger tags.description is empty, i=' + i)
      continue
    }

    // 排除的Controller
    const controllerName = item.description.split(' ').join('')
    if (
      configData.excludeTags?.includes(item.name) ||
      configData.excludeTags?.includes(controllerName) ||
      configData.excludeTags?.includes(item.description)
    ) {
      continue
    }

    // 包含或者配置为空
    if (
      !configData.includeTags ||
      configData.includeTags.length < 1 ||
      (configData.includeTags &&
        (configData.includeTags.includes(item.name) ||
          configData.includeTags.includes(controllerName) ||
          configData.includeTags.includes(item.description)))
    ) {
      const arrStr = item.description.split(' ')

      // 设置tag的对象
      getControllerPaths(swaggerInfo, configData, item.name)

      // 创建controller的路径
      result.paths.push(arrStr.join('') + '.ts')
      result.pathNames.push(item.name)
    }
  }

  return result
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

  // 根据tags，整理数据
  const tagsResult = getTagsData(swaggerInfo, configData)
  const paths = tagsResult.paths
  const pathNames = tagsResult.pathNames
  //logger.info('runDataInfo:', JSON.stringify(configData.runDataInfo))

  // 处理关联实体的数据
  processRefItem(swaggerInfo)

  // 创建实体时，创建API的相关信息
  const cacheApiData: Record<string, ApiCacheData>[] = []

  for (let i = 0; i < paths.length; i++) {
    const pathStr = paths[i] // controller的英文名称
    const pathNameStr = pathNames[i] // controller的名称
    const pathHookStr = pathStr.replace('.ts', '') + 'Hook.ts' // controller的名称

    // 创建实体的文件
    if (
      !configData.fileSettings?.content ||
      configData.fileSettings?.content === ContentStyle.all ||
      configData.fileSettings?.content === ContentStyle.onlyModel
    ) {
      // controller的实体路径
      const fileDir = configData.runDataInfo!.modelPath + path.sep + pathStr
      // 获取实体文件
      const content = getModelContent(
        swaggerInfo,
        configData,
        pathNameStr,
        cacheApiData
      )
      // 创建实体文件
      accessFile(fileDir, content, configData)
    }

    // 创建api的文件
    if (
      !configData.fileSettings?.content ||
      configData.fileSettings?.content === ContentStyle.all
    ) {
      // controller的API路径
      const fileDir = configData.runDataInfo!.apiPath + path.sep + pathStr

      // 获取API文件
      const content = getApiContent(
        swaggerInfo,
        configData,
        pathNameStr,
        cacheApiData,
        pathStr.replace('.ts', '')
      )
      // 创建API文件
      accessFile(fileDir, content, configData)

      // controller的API路径
      const hookDir = configData.runDataInfo!.apiPath + path.sep + pathHookStr

      const hookContent = getApiHookContent(
        swaggerInfo,
        configData,
        pathNameStr,
        cacheApiData,
        pathStr.replace('.ts', '')
      )

      // 创建API文件
      accessFile(hookDir, hookContent, configData)
    }
  }

  return true
}

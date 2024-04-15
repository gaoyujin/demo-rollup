import {
  DataCache,
  MethodPath,
  Swagger,
  SwaggerMethod,
} from '../models/swagger'
import { DefineConfig } from '../models/swaggerConfig'
import { ParameterIn } from '../models/swaggerEnum'
import { getParameterInfo, getResponseInfo } from './swaggerDefinitions'

// 根据tag，获取controller的path
export const getControllerPaths = (
  swaggerInfo: Swagger,
  configData: DefineConfig,
  tag: string
): Boolean => {
  if (!swaggerInfo.paths) {
    return false
  }

  let returnData: Record<string, Record<string, SwaggerMethod>>[] = []
  for (const key in swaggerInfo.paths) {
    if (!Object.prototype.hasOwnProperty.call(swaggerInfo.paths, key)) {
      continue
    }

    const dataInfo = swaggerInfo.paths[key]
    if (!dataInfo) {
      continue
    }

    for (const method in dataInfo) {
      if (!Object.prototype.hasOwnProperty.call(dataInfo, method)) {
        continue
      }

      const methodInfo = dataInfo[method]
      if (!methodInfo) {
        continue
      }

      if (methodInfo.tags && methodInfo.tags.includes(tag)) {
        let pathInfo: Record<string, Record<string, SwaggerMethod>> = {}
        pathInfo[key] = dataInfo
        returnData.push(pathInfo)
      }
    }
  }

  // 设置 controller下的接口集合
  if (
    !Object.prototype.hasOwnProperty.call(
      configData.runDataInfo!.tagAndPath,
      tag
    )
  ) {
    configData.runDataInfo!.tagAndPath![tag] = []
  }
  configData.runDataInfo!.tagAndPath![tag] = returnData

  return true
}

// 创建parameter的model
export const createParameterModel = (methodPath: MethodPath): string => {
  let content = ''
  if (!methodPath.data) {
    console.error('methodPath.data is null')
    return content
  }
  if (!methodPath.data.parameters) {
    console.error('methodPath.data.parameters is null')
    return content
  }

  for (let i = 0; i < methodPath.data.parameters.length; i++) {
    const params = methodPath.data.parameters[i]
    if (params.in === ParameterIn.empty || params.in === ParameterIn.header) {
      continue
    }

    // query 类型的参数
    if (params.in === ParameterIn.query) {
      if (methodPath.url!.includes('&')) {
        methodPath.url =
          methodPath.url + '?' + params.name + '=${' + params.name + '}'
      } else {
        methodPath.url = methodPath.url + '&' + params.name
      }
    }

    // body 类型的参数
    if (params.in === ParameterIn.body) {
    }
  }

  return content
}

// 根据path，生成model内容
export const getModelContent = (
  swaggerInfo: Swagger,
  configData: DefineConfig,
  pathName: string
): string => {
  if (!configData.runDataInfo?.tagAndPath) {
    console.error('tagAndPath is null')
    return ''
  }

  if (!configData.runDataInfo?.tagAndPath[pathName]) {
    console.error('tagAndPath property [' + pathName + '] is null')
    return ''
  }

  const listMethods = configData.runDataInfo?.tagAndPath[pathName]
  if (!listMethods || listMethods.length < 1) {
    console.error('paths [' + pathName + '] is null')
    return ''
  }

  let resultParameterHtml = ''
  let resultResponseHtml = ''
  let cache: DataCache = {
    parameters: [],
    responses: [],
  }
  for (let i = 0; i < listMethods.length; i++) {
    const methodInfo = listMethods[i]
    const methodPath = setPathData(methodInfo)

    // 获取参数的实体信息
    getParameterInfo(swaggerInfo, methodPath, cache)
    if (
      methodPath.data &&
      methodPath.data.parameters &&
      methodPath.data.parameters.length > 0
    ) {
      for (let k = 0; k < methodPath.data.parameters.length; k++) {
        if (methodPath.data.parameters[k].schemaContent) {
          resultParameterHtml =
            resultParameterHtml + methodPath.data.parameters[k].schemaContent
        }
      }
    }

    // 获取返回的实体信息
    getResponseInfo(swaggerInfo, methodPath, cache)
    if (
      methodPath.data &&
      methodPath.data.responses &&
      Object.keys(methodPath.data.responses).length > 0
    ) {
      for (let k = 0; k < Object.keys(methodPath.data.responses).length; k++) {
        const key = Object.keys(methodPath.data.responses)[k]
        if (methodPath.data.responses[key].schemaContent) {
          resultResponseHtml =
            resultResponseHtml + methodPath.data.responses[key].schemaContent
        }
      }
    }
  }
  return resultParameterHtml + resultResponseHtml
}

// 设置path信息
export const setPathData = (
  methodInfo: Record<string, Record<string, SwaggerMethod>>
): MethodPath => {
  let urlData: Record<string, SwaggerMethod> = {}
  let methodData: SwaggerMethod | undefined = undefined
  let pathData: MethodPath = {}

  // 获取Url
  let methodUrl = ''
  for (const key in methodInfo) {
    if (!methodUrl) {
      methodUrl = key
      urlData = methodInfo[key]
      break
    }
  }

  // 获取method
  let methodKey = ''
  if (urlData) {
    for (const key in urlData) {
      if (!methodKey) {
        methodKey = key.toLocaleUpperCase()
        methodData = urlData[key]
        break
      }
    }
  }

  pathData.url = methodUrl
  pathData.method = methodKey
  pathData.data = methodData

  return pathData
}

// 处理definition的信息
export const processRefItem = (swaggerInfo: Swagger) => {
  if (!swaggerInfo.definitions) {
    return
  }

  for (const key in swaggerInfo.definitions) {
    const definitionInfo = swaggerInfo.definitions[key]
    if (definitionInfo['properties']) {
      const propertyInfo = definitionInfo['properties']
      for (const p_key in propertyInfo) {
        const property = propertyInfo[p_key]
        if (property['$ref']) {
          const refInfo = property['$ref']
          // 设置关联实体名称
          const refType = refInfo.split('/').pop()
          property['$refType'] = refType
        } else if (property['items']) {
          const itemInfo = property['items']
          if (itemInfo['$ref']) {
            const refInfo = itemInfo['$ref']
            // 设置关联实体名称
            const refType = refInfo.split('/').pop()
            itemInfo.type = refType
          }
        }
      }
    }
  }
}

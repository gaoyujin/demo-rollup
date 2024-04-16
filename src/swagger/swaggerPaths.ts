import ejs from 'ejs'
import {
  ApiCacheData,
  DataCache,
  MethodPath,
  Swagger,
  SwaggerMethod,
} from '../models/swagger'
import { DefineConfig } from '../models/swaggerConfig'
import { ParameterIn } from '../models/swaggerEnum'
import {
  capitalizeFirstLetter,
  getParameterInfo,
  getResponseInfo,
} from './swaggerDefinitions'
import { getApiTemp } from './template'

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

// 初始化API的参数内容
export const initApiParameter = (
  methodPath: MethodPath,
  configData: DefineConfig
): ApiCacheData => {
  const apiCache: ApiCacheData = {
    summary: '',
    url: '',
    method: '',
    methodTitle: '',
    parameters: [],
    responseName: '',
  }

  apiCache.method = methodPath.method
  apiCache.url = methodPath.url
  apiCache.summary = methodPath.data!.summary
  apiCache.methodTitle = getApiName(methodPath, configData)

  return apiCache
}

// 获取接口的名称
export const getApiName = (
  methodPath: MethodPath,
  configData: DefineConfig
) => {
  if (configData.fileSettings?.api.nameMode === 'operationId')
    return methodPath.data!.operationId.split('Using')[0]
  else {
    const level = configData.fileSettings?.api.urlLevel
      ? configData.fileSettings?.api.urlLevel
      : 2

    const arrUrl = methodPath.url?.split('/')
    let result = ''
    if (arrUrl!.length < level) {
      for (let i = 0; i < arrUrl!.length; i++) {
        const str = arrUrl![i]
        if (i === 0) {
          result = str
        } else {
          if (str) result = result + capitalizeFirstLetter(str)
        }
      }
    } else {
      for (let i = 0; i < level; i++) {
        const str = arrUrl![arrUrl!.length - i - 1]
        if (i === level - 1) {
          result = str + result
        } else {
          if (str) result = capitalizeFirstLetter(str) + result
        }
      }
    }

    return result
  }
}

// 根据path，生成model内容
export const getModelContent = (
  swaggerInfo: Swagger,
  configData: DefineConfig,
  pathName: string,
  cacheApiData: Record<string, ApiCacheData>[]
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
    const apiCache = initApiParameter(methodPath, configData)

    // 获取参数的实体信息
    getParameterInfo(swaggerInfo, methodPath, cache, apiCache)
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
    getResponseInfo(swaggerInfo, methodPath, cache, apiCache)
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

    // 记录接口的参数和返回信息
    const tempApi: Record<string, ApiCacheData> = {}
    const strKey = apiCache.url as string
    tempApi[strKey] = apiCache
    cacheApiData.push(tempApi)
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

// 根据path，生成Api内容
export const getApiContent = (
  swaggerInfo: Swagger,
  configData: DefineConfig,
  pathName: string,
  cacheApiData: Record<string, ApiCacheData>[],
  controllerName: string
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

  let importHtml = ''
  let resultHtml = ''
  for (let i = 0; i < listMethods.length; i++) {
    const methodInfo = listMethods[i]
    const methodPath = setPathData(methodInfo)

    if (!cacheApiData) {
      console.error('cacheApiData is null')
      break
    }

    // 找到接口的参数和返回信息
    const findItem = cacheApiData.find(
      (item) => Object.keys(item)[0] === methodPath.url
    )

    if (!findItem) {
      console.error('ApiCacheData is not find')
      continue
    }

    const apiData = findItem[Object.keys(findItem)[0]]
    if (!apiData) {
      console.error('apiData is not find')
      continue
    }

    if (!apiData.responseName) {
      apiData.responseName = 'void'
    }

    const fileTemp = getApiTemp()
    const strHtml = ejs.render(fileTemp, {
      data: apiData,
    })

    // 获取import关联信息
    const newImportHtml = getImportContent(apiData, importHtml)
    if (newImportHtml) {
      if (importHtml) {
        importHtml = importHtml + ', '
      }
      importHtml = importHtml + newImportHtml
    }

    resultHtml = resultHtml + strHtml
  }

  const importPath = configData.runDataInfo!.importPath + '/' + controllerName
  const importResultHtml =
    'import { ' +
    importHtml +
    " } from '" +
    importPath +
    "' \r\n" +
    configData.fileSettings!.axiosImportContent +
    ' \r\n\r\n' +
    'export const DOMAIN = ""; \r\n\r\n'

  return importResultHtml + resultHtml
}

// 获取import关联信息
export const getImportContent = (
  cacheApi: ApiCacheData,
  importHtml: string
) => {
  // 获取参数的import关联信息
  let resultImportHtml = ''
  if (cacheApi.parameters && cacheApi.parameters.length > 0) {
    for (let i = 0; i < cacheApi.parameters.length; i++) {
      if (
        (', ' + importHtml + ',').includes(
          ', ' + cacheApi.parameters[i].model + ','
        )
      ) {
        continue
      } else {
        if (resultImportHtml && !resultImportHtml.endsWith(',')) {
          resultImportHtml = resultImportHtml + ', '
        }
        resultImportHtml = resultImportHtml + cacheApi.parameters[i].model
      }
    }
  }
  if (cacheApi.responseName === 'LeadListResponse') {
    console.log('LeadListResponse')
  }
  if (
    cacheApi.responseName &&
    !(', ' + importHtml + ',').includes(', ' + cacheApi.responseName + ',')
  ) {
    // 获取返回信息的import关联信息
    if (resultImportHtml && !resultImportHtml.endsWith(',')) {
      resultImportHtml = resultImportHtml + ', '
    }
    resultImportHtml = resultImportHtml + cacheApi.responseName
  }

  // return 'import { ' + resultImportHtml + " } from '" + importPath + "'"
  return resultImportHtml
}

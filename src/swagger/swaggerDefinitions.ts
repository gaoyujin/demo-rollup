import {
  ApiCacheData,
  DataCache,
  DefinitionInfo,
  ResponseInfo,
} from './../models/swagger'
import { MethodPath, Swagger, SwaggerParameter } from '../models/swagger'
import { ParameterIn } from '../models/swaggerEnum'
import { getModelTemp } from './template'
import ejs from 'ejs'
import { logger } from '../utils/log'

// 获取parameter信息
export const getParameterInfo = (
  swaggerInfo: Swagger,
  methodPath: MethodPath,
  cache: DataCache,
  apiCache: ApiCacheData
) => {
  if (!methodPath.data) {
    console.error(methodPath.url, 'methodPath.data is null')
    return
  }

  if (!methodPath.data.parameters) {
    console.error(methodPath.url, 'methodPath.data.parameters is null')
    return
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
    if (params.in === ParameterIn.body && params.schema) {
      getParameterSchema(params, swaggerInfo, methodPath, cache, apiCache)
    }

    if (params.in === ParameterIn.path) {
      // 缓存后，给API使用
      apiCache.parameters!.push({
        required: params.required,
        name: params.name,
        model: params.type,
        in: params.in,
      })
    }
  }

  return
}

// 获取实体参数信息
export const getParameterSchema = (
  parameter: SwaggerParameter,
  swaggerInfo: Swagger,
  methodPath: MethodPath,
  cache: DataCache,
  apiCache: ApiCacheData
) => {
  if (!parameter.schema) {
    return
  }

  const refStr = parameter.schema.$ref
  if (!refStr) {
    const type = parameter.schema.type
    if (type) {
      // 缓存后，给API使用
      apiCache.parameters!.push({
        required: parameter.required,
        name: parameter.name,
        model: type,
        in: parameter.in,
      })
    }
    return
  }

  // 获取参数名称
  const parameterName = refStr.split('/').pop()
  if (!parameterName) {
    return
  }
  // 处理过的实体跳过
  if (cache.parameters.includes(parameterName)) {
    return
  }

  if (parameterName.includes('«')) {
    // 独立实体
  } else {
    //cache.parameters.push(parameterName)

    // 缓存后，给API使用
    apiCache.parameters!.push({
      required: parameter.required,
      name: parameter.name,
      model: parameterName,
      in: parameter.in,
    })

    getParameterContent(
      parameterName,
      parameter,
      swaggerInfo,
      methodPath,
      cache
    )
  }
}

// 获取参数的Content
export const getParameterContent = (
  parameterName: string,
  parameter: SwaggerParameter,
  swaggerInfo: Swagger,
  methodPath: MethodPath,
  cache: DataCache
) => {
  if (
    !swaggerInfo.definitions ||
    Object.keys(swaggerInfo.definitions).length < 1
  ) {
    return
  }

  const definition = swaggerInfo.definitions[parameterName]
  if (!definition) {
    return
  }

  if (!parameterName || cache.parameters.includes(parameterName)) {
    return
  }

  try {
    // 初始化数据
    if (!parameter.schemaContent) {
      parameter.schemaContent = ''
    }
    cache.parameters.push(parameterName)
    const fileTemp = getModelTemp()
    const strHtml = ejs.render(fileTemp, {
      url: methodPath.url,
      method: methodPath.method,
      data: methodPath.data,
      title: parameterName,
      definition,
    })

    parameter.schemaContent = strHtml

    // 迭代的实体添加
    setParameterDefinitionRef(
      definition,
      parameter,
      swaggerInfo,
      methodPath,
      cache
    )
  } catch (err) {
    console.info(
      'getParameterContent',
      JSON.stringify({
        url: methodPath.url,
        method: methodPath.method,
        data: methodPath.data,
        title: parameterName,
        definition,
      })
    )
    console.error(err.message)
  }
}

// 处理参数实体引用实体
export const setParameterDefinitionRef = (
  definition: DefinitionInfo,
  parameter: SwaggerParameter,
  swaggerInfo: Swagger,
  methodPath: MethodPath,
  cache: DataCache
) => {
  if (!definition || !definition.properties) {
    return
  }

  const keys = Object.keys(definition.properties)
  if (!keys || keys.length < 1) {
    return
  }
  try {
    let allHtml = ''
    const fileTemp = getModelTemp()
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const property = definition.properties[key]
      let typeName = ''
      if (property.$ref && property.$refType) {
        typeName = property.$refType
      } else if (property.items && property.items.$ref && property.items.type) {
        typeName = property.items.type
      }

      if (!typeName || cache.parameters.includes(typeName)) {
        continue
      }

      const typeDefinition = swaggerInfo.definitions[typeName]
      if (!typeDefinition) {
        continue
      }

      cache.parameters.push(typeName)
      const strHtml = ejs.render(fileTemp, {
        url: methodPath.url,
        method: methodPath.method,
        data: methodPath.data,
        title: typeName,
        definition: typeDefinition,
      })

      allHtml = allHtml + strHtml

      // 迭代的实体添加
      setParameterDefinitionRef(
        typeDefinition,
        parameter,
        swaggerInfo,
        methodPath,
        cache
      )
    }

    parameter.schemaContent = parameter.schemaContent + allHtml
  } catch (err) {
    console.info(
      'setParameterDefinitionRef',
      JSON.stringify({
        url: methodPath.url,
        method: methodPath.method,
        data: methodPath.data,
      })
    )
    console.error(err.message)
  }
}

// 获取response信息
export const getResponseInfo = (
  swaggerInfo: Swagger,
  methodPath: MethodPath,
  cache: DataCache,
  apiCache: ApiCacheData
) => {
  if (!methodPath.data) {
    console.error(methodPath.url, 'methodPath.data is null')
    return
  }

  if (!methodPath.data.responses) {
    console.error(methodPath.url, 'methodPath.data.responses is null')
    return
  }

  for (let i = 0; i < Object.keys(methodPath.data.responses).length; i++) {
    const key = Object.keys(methodPath.data.responses)[i]
    const response = methodPath.data.responses[key]

    // 返回的实体对象
    if (response.schema && key === '200') {
      // 缓存后，给API使用
      apiCache.responseName = setApiResponseName(response)

      getResponseSchema(response, swaggerInfo, methodPath, cache, apiCache)
    }
  }

  return
}

// 设置接口的返回对象名称
export const setApiResponseName = (response: ResponseInfo) => {
  if (!response.schema) {
    return 'void'
  }

  const refStr = response.schema.$ref
  if (!refStr) {
    if (response.schema.type) {
      return response.schema.type
    } else {
      return 'void'
    }
  }

  // 获取参数名称
  const responseName = refStr.split('/').pop()
  if (responseName) {
    return getResponseName(responseName)
  }

  return 'void'
}

// 返回的实体对象
export const getResponseSchema = (
  response: ResponseInfo,
  swaggerInfo: Swagger,
  methodPath: MethodPath,
  cache: DataCache,
  apiCache: ApiCacheData
) => {
  if (!response.schema) {
    return
  }

  const refStr = response.schema.$ref
  if (!refStr) {
    return
  }

  // 获取参数名称
  const responseName = refStr.split('/').pop()
  if (!responseName) {
    return
  }
  // 处理过的实体跳过
  if (cache.responses.includes(responseName)) {
    return
  }

  if (responseName.includes('«')) {
    // 独立实体
    cache.responses.push(responseName)
    getResponseContent(
      responseName,
      response,
      swaggerInfo,
      methodPath,
      cache,
      apiCache
    )

    // 获取下一层的返回实体名称
    setResponseNestObject(
      responseName,
      response,
      methodPath,
      swaggerInfo,
      cache,
      apiCache
    )
  } else {
    cache.responses.push(responseName)
    getResponseContent(
      responseName,
      response,
      swaggerInfo,
      methodPath,
      cache,
      apiCache
    )
  }
}

// 获取返回体的Content
export const getResponseContent = (
  responseName: string,
  response: ResponseInfo,
  swaggerInfo: Swagger,
  methodPath: MethodPath,
  cache: DataCache,
  apiCache: ApiCacheData
) => {
  if (
    !swaggerInfo.definitions ||
    Object.keys(swaggerInfo.definitions).length < 1
  ) {
    return
  }

  const definition = swaggerInfo.definitions[responseName]
  if (!definition) {
    return
  }

  // 初始化数据
  if (!response.schemaContent) {
    response.schemaContent = ''
  }
  try {
    const fileTemp = getModelTemp()

    // 设置返回对象
    if (
      definition.properties &&
      definition.properties.hasOwnProperty('resultCode')
    ) {
      apiCache.result = true
    } else {
      apiCache.result = false
    }

    const realName = getResponseName(responseName)
    const strHtml = ejs.render(fileTemp, {
      url: methodPath.url,
      method: methodPath.method,
      data: methodPath.data,
      title: realName,
      definition,
    })

    response.schemaContent = response.schemaContent + strHtml

    // 迭代的实体添加
    setResponseDefinitionRef(
      definition,
      response,
      swaggerInfo,
      methodPath,
      cache
    )
  } catch (err) {
    logger.error(
      'getResponseContent',
      JSON.stringify({
        url: methodPath.url,
        method: methodPath.method,
        data: methodPath.data,
        definition,
      })
    )
    console.error(err.message)
  }
}

// 处理返回体的名字
export const getResponseName = (responseName: string) => {
  const strArr = responseName.split('«')

  if (!strArr || strArr.length < 1) {
    return responseName
  }

  let realName = ''
  for (let i = 0; i < strArr.length; i++) {
    const str = strArr[i]
    let tempName = str
    if (str.includes('»')) {
      tempName = str.split('»')[0]
    }

    realName = realName + capitalizeFirstLetter(tempName)
  }

  return realName
}

// 获取下一层的返回实体名称
// 去除的层数level
export const getNextResponseName = (responseName: string, level: number) => {
  const strArr = responseName.split('«')

  if (!strArr || strArr.length < 1 || level >= strArr.length) {
    return responseName
  }

  let realName = ''
  for (let i = strArr.length - 1; i >= level; i--) {
    const str = strArr[i]
    let tempName = str
    if (str.includes('»')) {
      tempName = str.split('»')[0]
    }

    if (realName) {
      realName = tempName + '«' + realName + '»'
    } else {
      realName = realName + tempName
    }
  }

  return realName
}

// 第一个字母变成大写
export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// 设置返回实体嵌套的对象
export const setResponseNestObject = (
  responseName: string,
  response: ResponseInfo,
  methodPath: MethodPath,
  swaggerInfo: Swagger,
  cache: DataCache,
  apiCache: ApiCacheData
) => {
  const strArr = responseName.split('«')
  let count = 1
  const allResponseKeys = Object.keys(swaggerInfo.definitions)
  while (count < strArr.length) {
    const nextResponseName = getNextResponseName(responseName, count)
    if (cache.responses.includes(nextResponseName)) {
      count = count + 1
    } else {
      const findItem = allResponseKeys.find((item) => item === nextResponseName)
      if (findItem) {
        // 实体绑定到同一个返回实体对象上
        cache.responses.push(nextResponseName)
        getResponseContent(
          nextResponseName,
          response,
          swaggerInfo,
          methodPath,
          cache,
          apiCache
        )
      }
      count = count + 1
    }
  }
}

// 处理返回实体引用实体
export const setResponseDefinitionRef = (
  definition: DefinitionInfo,
  response: ResponseInfo,
  swaggerInfo: Swagger,
  methodPath: MethodPath,
  cache: DataCache
) => {
  if (!definition || !definition.properties) {
    return
  }

  const keys = Object.keys(definition.properties)
  if (!keys || keys.length < 1) {
    return
  }

  let allHtml = ''
  const fileTemp = getModelTemp()
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const property = definition.properties[key]
    let typeName = ''
    if (property.$ref && property.$refType) {
      typeName = property.$refType
    } else if (property.items && property.items.$ref && property.items.type) {
      typeName = property.items.type
    }

    if (!typeName || cache.responses.includes(typeName)) {
      continue
    }

    const typeDefinition = swaggerInfo.definitions[typeName]
    if (!typeDefinition) {
      continue
    }
    try {
      cache.responses.push(typeName)
      const strHtml = ejs.render(fileTemp, {
        url: methodPath.url,
        method: methodPath.method,
        data: methodPath.data,
        title: getResponseName(typeName),
        definition: typeDefinition,
      })

      allHtml = allHtml + strHtml

      // 迭代的实体添加
      setResponseDefinitionRef(
        typeDefinition,
        response,
        swaggerInfo,
        methodPath,
        cache
      )
    } catch (err) {
      console.info(
        'setResponseDefinitionRef',
        JSON.stringify({
          url: methodPath.url,
          method: methodPath.method,
          data: methodPath.data,
          title: typeName,
          definition: typeDefinition,
        })
      )
      console.error(err.message)
    }
  }

  response.schemaContent = response.schemaContent + allHtml
}

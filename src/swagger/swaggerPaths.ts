import { Swagger, SwaggerMethod } from '../models/swagger'
import { DefineConfig } from '../models/swaggerConfig'

// 根据tag，获取controller的path
export const getControllerPaths = (
  swaggerInfo: Swagger,
  configData: DefineConfig,
  tag: string
): Boolean => {
  if (!swaggerInfo.paths) {
    return false
  }

  let returnData: Record<string, SwaggerMethod>[] = []
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
        returnData.push(dataInfo)
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

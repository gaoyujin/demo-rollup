import { DefineConfig } from '../models/swaggerConfig'
import path from 'path'
import fs from 'fs'
import JSON5 from 'json5'
import { ContentStyle } from '../models/swaggerEnum'
import { getConfigTemplate } from './template'

export const defaultConfig: DefineConfig = {
  swaggerVersion: '2.0', // 支持的swagger版本
  includeTags: [], // 包含的Controller (空是所有，配置了，就匹配配置内容)
  excludeTags: ['前端API接口-销售线索'], // 排除的Controller (高优先级)
  fileSettings: {
    extNameType: 'ts', // 生产文件后缀名 只支持ts
    content: ContentStyle.all, // 生产文件的内容  all:全部  onlyModel:只生成实体  onlyApi:只生成api
    topDirPath: 'src', // 生成文件的基础路径
    topAlias: '/@',
    axiosImportContent: "import { http } from '/@/utils/http'",
    messageImportContent:
      "import { errorMessage } from '/@/utils/message/index'",
    model: {
      dirName: 'models', // 实体生成的文件夹名称 默认根目录下"models"
      createMode: 'overwrite', // 生产文件的模式  add:追加  overwrite:覆盖 默认是覆盖
    },
    api: {
      dirName: 'apis', // 实体生成的文件夹名称 默认根目录下"models"
      createMode: 'overwrite', // 生产文件的模式  add:追加  overwrite:覆盖 默认是覆盖
      nameMode: 'url', // 生成接口的名称的模式：operationId 、url
      urlLevel: 2, // 截取名称的层级 默认是2
      requestMethod: 'lowerCase', // 请求类型的大小写模式：lowerCase、upperCase，默认是lowerCase
      domainName: [], // 多服务时，服务别名映射
    },
  }, // 生产文件的操作
  serverNameSettings: [], // 服务文件夹名称映射
  isHttps: false, // 是否使用https
  nodeServe: {
    url: '',
  },
  runDataInfo: {
    modelPath: '',
    apiPath: '',
    tagAndPath: {},
  },
}

// 读取配置信息
export function getConfigInfo(): DefineConfig {
  const filePath = path.join(process.cwd(), 'swagger2ts.jsonc')
  if (fs.existsSync(filePath)) {
    const configData = fs.readFileSync(filePath).toString()
    return JSON5.parse(configData)
  } else {
    return {}
  }
}

// 写入配置信息
export function writeConfigInfo(
  configData: DefineConfig,
  settingInfo: DefineConfig
) {
  if (settingInfo) {
    configData.excludeTags = settingInfo.excludeTags
      ? settingInfo.excludeTags
      : configData.excludeTags

    configData.includeTags = settingInfo.includeTags
      ? settingInfo.includeTags
      : configData.includeTags

    configData.isHttps = settingInfo.isHttps
      ? settingInfo.isHttps
      : configData.isHttps

    configData.swaggerVersion = settingInfo.swaggerVersion
      ? settingInfo.swaggerVersion
      : configData.swaggerVersion

    configData.serverNameSettings = settingInfo.serverNameSettings
      ? settingInfo.serverNameSettings
      : configData.serverNameSettings

    if (settingInfo.fileSettings?.api) {
      configData.fileSettings!.api.createMode = settingInfo.fileSettings?.api
        .createMode
        ? settingInfo.fileSettings?.api.createMode
        : configData.fileSettings!.api.createMode

      configData.fileSettings!.api.dirName = settingInfo.fileSettings?.api
        .dirName
        ? settingInfo.fileSettings?.api.dirName
        : configData.fileSettings!.api.dirName

      configData.fileSettings!.api.domainName = settingInfo.fileSettings?.api
        .domainName
        ? settingInfo.fileSettings?.api.domainName
        : configData.fileSettings!.api.domainName

      configData.fileSettings!.api.nameMode = settingInfo.fileSettings?.api
        .nameMode
        ? settingInfo.fileSettings?.api.nameMode
        : configData.fileSettings!.api.nameMode

      configData.fileSettings!.api.requestMethod = settingInfo.fileSettings?.api
        .requestMethod
        ? settingInfo.fileSettings?.api.requestMethod
        : configData.fileSettings!.api.requestMethod

      configData.fileSettings!.api.urlLevel = settingInfo.fileSettings?.api
        .urlLevel
        ? settingInfo.fileSettings?.api.urlLevel
        : configData.fileSettings!.api.urlLevel
    }

    if (settingInfo.fileSettings?.model) {
      configData.fileSettings!.model.createMode = settingInfo.fileSettings
        ?.model.createMode
        ? settingInfo.fileSettings?.model.createMode
        : configData.fileSettings!.model.createMode

      configData.fileSettings!.model.dirName = settingInfo.fileSettings?.model
        .dirName
        ? settingInfo.fileSettings?.model.dirName
        : configData.fileSettings!.model.dirName
    }

    if (settingInfo.nodeServe && settingInfo.nodeServe.url) {
      configData.nodeServe!.url = settingInfo.nodeServe.url
    }

    configData.fileSettings!.topAlias = settingInfo.fileSettings?.topAlias
      ? settingInfo.fileSettings?.topAlias
      : configData.fileSettings!.topAlias

    configData.fileSettings!.axiosImportContent = settingInfo.fileSettings
      ?.axiosImportContent
      ? settingInfo.fileSettings?.axiosImportContent
      : configData.fileSettings!.axiosImportContent

    configData.fileSettings!.messageImportContent = settingInfo.fileSettings
      ?.messageImportContent
      ? settingInfo.fileSettings?.messageImportContent
      : configData.fileSettings!.messageImportContent

    configData.fileSettings!.topDirPath = settingInfo.fileSettings?.topDirPath
      ? settingInfo.fileSettings?.topDirPath
      : configData.fileSettings!.topDirPath

    configData.fileSettings!.extNameType = settingInfo.fileSettings?.extNameType
      ? settingInfo.fileSettings?.extNameType
      : configData.fileSettings!.extNameType

    configData.fileSettings!.content = settingInfo.fileSettings?.content
      ? settingInfo.fileSettings?.content
      : configData.fileSettings!.content
  }
}

// 配置文件初始化
export function initConfigInfo() {
  // 配置文件信息
  const fileContent = getConfigTemplate()
  const fileDir = process.cwd() + path.sep + 'swagger2ts.jsonc'
  fs.writeFile(fileDir, fileContent, (err) => {
    // 创建失败
    if (err) {
      console.error(`创建配置文件失败：${err}`)
    } else {
      // 创建成功
      console.info(`创建配置文件成功`)
    }
  })
}

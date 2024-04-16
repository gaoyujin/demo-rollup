import { DefineConfig } from '../models/swaggerConfig'
import path from 'path'
import fs from 'fs'
import { ContentStyle } from '../models/swaggerEnum'

export const defaultConfig: DefineConfig = {
  swaggerVersion: '2.0', // 支持的swagger版本
  includePaths: [], // 包含的请求路径 （空是所有，配置了，就匹配配置内容）
  excludePaths: [], // 排除的请求路径
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
    },
  }, // 生产文件的操作
  serverNameSettings: [], // 服务文件夹名称映射
  isHttps: false, // 是否使用https
  runDataInfo: {
    modelPath: '',
    apiPath: '',
    tagAndPath: {},
  },
}

// 读取配置信息
export function getConfigInfo(): DefineConfig {
  const filePath = path.join(process.cwd(), 'swagger2ts.json')
  if (fs.existsSync(filePath)) {
    const configData = fs.readFileSync(filePath).toString()
    return JSON.parse(configData)
  } else {
    return {}
  }
}

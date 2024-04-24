import { SwaggerMethod } from './swagger'
import { ContentStyle } from './swaggerEnum'

export type DefineConfig = {
  swaggerVersion?: string // 支持的swagger版本
  includeTags?: string[] // 包含的请求路径 （空是所有，配置了，就匹配配置内容）
  excludeTags?: string[] // 排除的请求路径
  fileSettings?: FileSetting // 生产文件的操作
  serverNameSettings?: ServerNameConfig[] // 服务文件夹名称映射
  isHttps?: boolean // 是否是https
  runDataInfo?: RunData
}

export type FileSetting = {
  extNameType?: string // 生产文件后缀名 只支持ts
  content?: ContentStyle // 生产文件的内容  all:全部  onlyModel:只生成实体  onlyApi:只生成api
  topDirPath?: string // 生产文件夹的路径 默认根目录下"src"
  topAlias?: string // 根目录别名 默认根目录下"/@"
  axiosImportContent?: string // axios引入内容
  messageImportContent?: string // message引入内容
  model: ModelConfig // 实体配置
  api: ApiConfig // api配置
}

export type ServerNameConfig = {
  name?: string
  fileName?: string
}

export type ModelConfig = {
  dirName?: string // 实体生成的文件夹名称 默认根目录下"models"
  createMode?: string // 生产文件的模式  add:追加  overwrite:覆盖 默认是覆盖
}

export type ApiConfig = {
  dirName?: string // 实体生成的文件夹名称 默认根目录下"models"
  createMode?: string // 生产文件的模式  add:追加  overwrite:覆盖 默认是覆盖
  nameMode?: string // 生成接口的名称的模式：operationId 、url
  urlLevel?: number // 截取名称的层级 默认是2
  requestMethod?: string //
}

// 运行生成的数据
export type RunData = {
  modelPath?: string
  apiPath?: string
  importPath?: string
  hookImportPath?: string
  tagAndPath?: Record<string, Record<string, Record<string, SwaggerMethod>>[]>
}

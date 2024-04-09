export type DefineConfig = {
  swaggerVersion?: string, // 支持的swagger版本
  includePaths?: string[], // 包含的请求路径 （空是所有，配置了，就匹配配置内容）
  excludePaths?: string[], // 排除的请求路径
  fileSettings?: FileSetting,// 生产文件的操作
  nameSettings?: NameConfig[], // 服务文件夹名称映射
  isHttps?: boolean, // 是否是https
}

export type FileSetting = {
  extNameType?: string, // 生产文件后缀名 只支持ts
  createMode?: string, // 生产文件的模式  add:追加  overwrite:覆盖
  content?: string, // 生产文件的内容  all:全部  onlyModel:只生成实体  onlyApi:只生成api
}

export type NameConfig = {
  name?: string,
  fileName?: string
}
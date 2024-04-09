export type defineConfig = {
  swaggerVersion?: '2.0', // 支持的swagger版本
  includePaths?: [''], // 包含的请求路径 （空是所有，配置了，就匹配配置内容）
  excludePaths?: [], // 排除的请求路径
  fileSettings?: {
    extNameType: 'ts', // 生产文件后缀名 只支持ts
    createMode: 'overwrite', // 生产文件的模式  add:追加  overwrite:覆盖
    content: 'all', // 生产文件的内容  all:全部  onlyModel:只生成实体  onlyApi:只生成api
  },// 生产文件的操作
  nameSettings?: [{
    name: '盛心付PC版BFF',
    fileName: 'ff'
  }], // 服务文件夹名称映射
}
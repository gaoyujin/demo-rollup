import path from 'path'
import fs from 'fs'

// 获取model的模版
export const getModelTemp = () => {
  const tempPath =
    process.cwd() +
    path.sep +
    'templates' +
    path.sep +
    'default' +
    path.sep +
    'models.ejs'

  const tempData: Buffer = fs.readFileSync(tempPath)
  return tempData.toString()
}


// 获取Api的模版
export const getApiTemp = () => {
  const tempPath =
    process.cwd() +
    path.sep +
    'templates' +
    path.sep +
    'default' +
    path.sep +
    'api.ejs'

  const tempData: Buffer = fs.readFileSync(tempPath)
  return tempData.toString()
}


// 获取ApiHook的模版
export const getApiHookTemp = () => {
  const tempPath =
    process.cwd() +
    path.sep +
    'templates' +
    path.sep +
    'default' +
    path.sep +
    'useApi.ejs'

  const tempData: Buffer = fs.readFileSync(tempPath)
  return tempData.toString()
}

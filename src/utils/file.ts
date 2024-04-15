import fs from 'fs'
import path from 'path'
import { DefineConfig } from '../models/swaggerConfig'

// 创建目录
export const makeDirSync = (filePath: string) => {
  let items = filePath.split(path.sep)
  for (let i = 1; i <= items.length; i++) {
    let dir = items.slice(0, i).join(path.sep)
    if (!dir) {
      continue
    }
    try {
      fs.accessSync(dir)
    } catch (err) {
      fs.mkdirSync(dir)
    }
  }
}

// 创建model实体对象
export const accessFile = (
  fileDir: string,
  content: string,
  configData: DefineConfig
) => {
  try {
    // 异步检查
    fs.access(fileDir, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('文件或目录不存在')
        createFile(fileDir, content)
        return
      }
      // 文件或目录存在
      //console.log('文件或目录存在')
      if (configData.fileSettings?.model.createMode === 'overwrite') {
        createFile(fileDir, content)
      } else {
        appendFile(fileDir, content)
      }
    })
  } catch (err) {
    console.error('文件或目录不存在')
  }
}

// 创建文件
export const createFile = (filePath: string, fileContent: string) => {
  fs.writeFile(filePath, fileContent, (err: any) => {
    // 创建失败
    if (err) {
      return console.error(`创建失败：${err}`)
    }
  })
}

// 追加文件内容
export const appendFile = (filePath: string, fileContent: string) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return console.error(err)
    }

    // 修改文件内容
    const modifiedData = data + fileContent

    // 写回文件
    fs.writeFile(filePath, modifiedData, 'utf8', (writeErr) => {
      if (writeErr) {
        return console.error(`追加失败：${writeErr}`)
      }
    })
  })
}

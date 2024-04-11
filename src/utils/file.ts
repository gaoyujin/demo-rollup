import fs from 'fs'
import path from 'path'

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

// 创建文件
export const createFile = (filePath: string, fileContent: string) => {
  fs.writeFile(filePath, fileContent, (err: any) => {
    // 创建失败
    if (err) {
      console.log(`创建失败：${err}`)
    }
  })
}

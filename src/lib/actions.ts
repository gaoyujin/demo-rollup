import { SwaggerToTypescript } from '../swagger'
import { initConfigInfo } from '../swagger/config'

// 配置文件初始化
export const initConfig = () => {
  // 1.提示信息
  console.info('初始配置文件......')

  // 2.创建配置文件
  initConfigInfo()
}

// 根据swagger，创建相关代码
export const createCode = async (swaggerUrl: string, cmd: any[]) => {
  try {
    // 1.提示信息
    console.info('根据swaggerUrl创建代码开始......')

    if (!swaggerUrl) {
      console.error('swaggerUrl不能为空')
      return
    }

    // 调用处理函数
    new SwaggerToTypescript(swaggerUrl, cmd, () => {
      console.info('解析运行了......')
    })
  } catch (err) {
    console.error(`根据swaggerUrl创建代码异常:${err.message}`)
  }
}

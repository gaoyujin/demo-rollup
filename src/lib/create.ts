import { Command } from 'commander'
import * as todo from './actions'

export const createCommands = (program: Command) => {
  program.command('i').description('初始化配置文件').action(todo.initConfig)
  program.command('init').description('初始化配置文件').action(todo.initConfig)

  program
    .command('u <swaggerUrl>')
    .description('根据Url地址生成代码')
    // 子命令支持的属性，可以通过 $ dzm-cli create -h 查询对应的 option 配置项
    .option('-m, --mode, 是否生成node服务调用')
    .action((value, cmd) => {
      todo.createCode(value, cmd)
    })
  program
    .command('url <swaggerUrl>')
    .description('根据Url地址生成代码')
    .action(todo.createCode)
}

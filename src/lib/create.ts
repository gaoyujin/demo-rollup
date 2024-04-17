import { Command } from 'commander'
import * as todo from './actions'

export const createCommands = (program: Command) => {
  program.command('i').description('初始化配置文件').action(todo.initConfig)
  program.command('init').description('初始化配置文件').action(todo.initConfig)

  program
    .command('u <swaggerUrl>')
    .description('根据Url地址生成代码')
    .action(todo.createCode)
  program
    .command('url <swaggerUrl>')
    .description('根据Url地址生成代码')
    .action(todo.createCode)
}

import { Command } from 'commander'
import { helpOptions } from './lib/help'
import { createCommands } from './lib/create'

const program = new Command()

// 定义显示模块的版本号
program.version(require('../package.json').version)

// 给help增加其他选项
helpOptions(program)

// 创建命令
createCommands(program)

// 解析终端指令
program.parse(process.argv)

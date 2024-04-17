import { Command } from 'commander'

// helpTipInfo
function helpTipInfo() {
  console.log('')
  console.log('usage')
  console.log('   s2t -V')
  console.log('   s2t --version')
  console.log('   s2t i')
  console.log('   s2t init')
  console.log('   s2t u')
  console.log('   s2t url')
  console.log('   swagger2-tools -V')
  console.log('   swagger2-tools --version')
  console.log('   swagger2-tools i')
  console.log('   swagger2-tools init')
  console.log('   swagger2-tools u')
  console.log('   swagger2-tools url')
}

export const helpOptions = (program: Command) => {
  program.on('--help', helpTipInfo)
  program.on('--h', helpTipInfo)
}

import { test } from 'vitest'
import { SwaggerToTypescript } from '../swagger'

test('test transform', () => {
  new SwaggerToTypescript(
    'http://shengxinmanagement.sdptest.shengpay.com/swagger-ui.html#',
    () => {
      console.log('运行了')
    }
  )
})

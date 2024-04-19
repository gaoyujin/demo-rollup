// index.ts
// import { SwaggerToTypescript } from './swagger'

// new SwaggerToTypescript(
//   'http://shengxinmanagement.sdptest.shengpay.com/swagger-ui.html#',
//   () => {
//     console.log('运行了')
//   }
// )

// new SwaggerToTypescript('http://mqmp.sdptest.shengpay.com/doc.html#', () => {
//   console.log('运行了')
// })

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

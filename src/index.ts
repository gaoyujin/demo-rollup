// index.ts
import { SwaggerToTypescript } from './swagger'

// new SwaggerToTypescript(
//   'http://marketingtmk.sdptest.shengpay.com/swagger-ui.html#',
//   () => {
//     console.log('运行了')
//   }
// )

new SwaggerToTypescript('http://mqmp.sdptest.shengpay.com/doc.html#', () => {
  console.log('运行了')
})

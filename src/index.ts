// index.ts
import { SwaggerToTypescript } from "./swagger"

new SwaggerToTypescript(
  'http://10.241.81.77:8080/swagger-ui.html#',
  () => {
    console.log('运行了')
  }
)
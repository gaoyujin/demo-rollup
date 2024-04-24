# swagger2-tools

该工具支持 swagger-ui 和 Knife4j 的后端接口，转换为 ts 格式的 model、api、apiHook。

## 工具介绍

- 目前只支持 swagger 2.0
- 可以选择生成相关的文件，包含 model、api、apiHook

## 安装

```bash
npm install -g swagger2-tools
```

## 命令说明

cd 到你的工作目录，执行:

```bash
s2t --help // 查看命令说明
s2t i // 初始化配置文件
s2t init // 初始化配置文件
s2t u http://XXX/swagger-ui.html  // 把url对应的swagger生成相关的model、api、apiHook
s2t url http://XXX/swagger-ui.html // 把url对应的swagger生成相关的model、api、apiHook
```

## swagger2ts.jsonc 配置说明

默认是可以不做任何修改的

| 属性               | 说明                                                                                                 | 默认值 |
| ------------------ | ---------------------------------------------------------------------------------------------------- | ------ |
| swaggerVersion     | 支持的 swagger 版本                                                                                  | "2.0"  |
| includeTags        | 包含的 Controller。空是所有，配置了就匹配配置内容(swagger-ui 中 Controller 的中文名称或者英文都支持) | []     |
| excludeTags        | 排除的 Controller (高优先级)                                                                         | []     |
| fileSettings       | model 和 Api 生成规则配置(FileSetting 对象)                                                          | {}     |
| serverNameSettings | swagger 的服务名称(映射英文名称)                                                                     | []     |
| isHttps            | 是否使用 https 获取 swagger 信息                                                                     | false  |

## FileSetting 对象 说明

| 属性                 | 说明                                         | 默认值                                                  |
| -------------------- | -------------------------------------------- | ------------------------------------------------------- |
| content              | 生产文件的内容 all:全部 onlyModel:只生成实体 | "all"                                                   |
| topDirPath           | 生产文件夹的路径 默认根目录下"src"           | "src"                                                   |
| topAlias             | api 和 hook 引用对象的前缀别名               | "/@"                                                    |
| axiosImportContent   | axios 引用文本                               | "import { http } from '/@/utils/http'"                  |
| messageImportContent | errorMessage 函数的引用文本                  | "import { errorMessage } from '/@/utils/message/index'" |
| model                | 接口实体的生成配置(ModelConfig 对象)         | {}                                                      |
| api                  | 接口 http 调用配置(ApiConfig 对象)           | {}                                                      |

## ModelConfig 对象 说明

| 属性       | 说明                                                                | 默认值      |
| ---------- | ------------------------------------------------------------------- | ----------- |
| dirName    | 实体生成的文件夹名称 默认根目录下"models"                           | "models"    |
| createMode | 生产文件的模式 add:追加 overwrite:覆盖 默认是覆盖（目前追加不支持） | "overwrite" |

## ApiConfig 对象 说明

| 属性          | 说明                                                                | 默认值      |
| ------------- | ------------------------------------------------------------------- | ----------- |
| dirName       | 实体生成的文件夹名称 默认根目录下"apis"                             | "apis"      |
| createMode    | 生产文件的模式 add:追加 overwrite:覆盖 默认是覆盖（目前追加不支持） | "overwrite" |
| nameMode      | 生成接口的名称的模式：operationId 、url                             | "url"       |
| urlLevel      | 截取名称的层级 默认是 2                                             | 2           |
| requestMethod | 请求类型的大小写模式：lowerCase、upperCas                           | lowerCase   |

## Model 生成代码 demo

```javascript
/** 交易统计 POST /pc/statistics/trade */
export type GroupByVO = {
  /* 收款金额 */
  amount: number,
  /* 收款笔数 */
  count: number,
  /* 时间 */
  text: string,
}
/** 交易统计 POST /pc/statistics/trade */
export type TradeStatisticsVO = {
  /* 新增渠道商 */
  agencyAddCount: number,
  /* 活跃渠道商 */
  agencyCount: number,
  /* 新增商户数量 */
  merchantAddCount: number,
  /* 活跃商户数量 */
  merchantCount: number,
  /* 交易图表数据 */
  orderChartList: GroupByVO[],
  /* 退款图表数据 */
  refundChartList: GroupByVO[],
  /* 渠道商top10数据 */
  top10Agencies: Top10Data[],
  /* 商户top10数据 */
  top10Merchants: Top10Data[],
  /* 门店top10数据 */
  top10Stores: Top10Data[],
  /* 渠道商总数 */
  totalAgencyCount: number,
  /* 商户总数量 */
  totalMerchantCount: number,
  /* 收款总金额 */
  totalOrderAmount: number,
  /* 收款总笔数 */
  totalOrderCount: number,
  /* 收款总手续费 */
  totalOrderFeeAmount: number,
  /* 退款金额 */
  totalRefundAmount: number,
  /* 退款总笔数 */
  totalRefundCount: number,
  /* 退款总手续费 */
  totalRefundFeeAmount: number,
}

/** 交易统计 POST /pc/statistics/trade */
export type CommonResponseTradeStatisticsVO = {
  /*  */
  errorCode: string,
  /*  */
  errorCodeDes: string,
  /* 业务对象 */
  item: TradeStatisticsVO,
  /*  */
  resultCode: string,
}
```

## Api 生成代码 demo

```javascript
import {
  TradeStatisticsRequest,
  CommonResponseTradeStatisticsTop10VO,
  CommonResponseTradeStatisticsVO,
} from '/@/models/ServerName/StatisticsController'
import { http } from '/@/utils/http'

export const DOMAIN = ''

/**
 * 交易统计
 * @returns CommonResponseTradeStatisticsVO
 */
export const statisticsTrade = (
  data: {},
  config?: any
): Promise<CommonResponseTradeStatisticsVO> => {
  return http.request('POST', DOMAIN + '/pc/statistics/trade', {
    data,
    ...config,
  })
}
```

## ApiHook 生成代码 demo

```javascript
import { CommonResponseTradeStatisticsVO } from '/@/models/ServerName/StatisticsController'
import { statisticsTrade } from '/@/apis/ServerName/StatisticsController'
import { errorMessage } from '/@/utils/message/index'

/**
 * 交易统计
 * @returns CommonResponseTradeStatisticsVO
 */
export const useStatisticsTrade = async (
  config?: any
): Promise<CommonResponseTradeStatisticsVO | undefined> => {
  try {
    const result = await statisticsTrade({}, config)
    if (result.resultCode.toUpperCase() != 'SUCCESS') {
      errorMessage('交易统计操作失败，原因：' + result.errorCodeDes)
      return undefined
    } else {
      return result
    }
  } catch (e) {
    errorMessage('交易统计操作失败，信息：' + e.message)
    return undefined
  }
}
```

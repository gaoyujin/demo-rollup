import { ParameterIn, ParameterType } from "./swaggerEnum";

// 描述说明
export type SwaggerInfo = {
  description: string;
  version: string;
  title: string;
}
// Controller 描述
export type SwaggerTag = {
  name: string;
  description: string;
}

export type SwaggerParameter = {
  name: string;
  in: ParameterIn;
  description: string;
  required: boolean;
  type: ParameterType;
  enum: string[];
}

export type SchemaInfo = {
  $ref?: string;
  type?: ParameterType;
  format?: string;
}

export type ResponseInfo = {
  description?: string;
  schema?: SchemaInfo;
}

export type SwaggerMethod = {
  tags: string[];
  summary: string;
  operationId: string;
  consumes: string[];
  produces: string[];
  parameters: SwaggerParameter;
  responses: Record<string, ResponseInfo>;
  deprecated: boolean;
}

export type PropertyInfo = {
  type?: string;
  description?: string;
  enum?: string[];
  $ref?: string;
}

export type DefinitionInfo = {
  type: ParameterType;
  title: string;
  properties: Record<string, PropertyInfo>;
}

export type Swagger = {
  swagger: string;
  info: SwaggerInfo;
  host: string;
  basePath: string;
  tags: SwaggerTag[];
  paths: Record<string, Record<string, SwaggerMethod>>;
  definitions: Record<string, DefinitionInfo>;
}
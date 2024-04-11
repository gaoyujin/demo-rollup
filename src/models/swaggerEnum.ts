export enum ParameterIn {
  empty = '',
  body = 'body',
  query = 'query',
  header = 'header',
  formData= 'formData',
}

export enum ParameterType {
  string = 'string',
  integer = 'integer',
  boolean = 'boolean',
  file = 'file',
  object='object'
}

export enum ContentStyle {
  all = 'all',
  onlyModel = 'onlyModel',
  onlyApi='onlyApi'
}
// 是否是URL
export function isValidUrl(urlString: string) {
  try {
    new URL(urlString) // Node.js v10+
    return true
  } catch (e) {
    return false
  }
}

// 是否包含中文
export function containsChinese(str: string) {
  return /[\u4e00-\u9fa5]/.test(str)
}

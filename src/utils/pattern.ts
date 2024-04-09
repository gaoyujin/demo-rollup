// 是否是URL
export function isValidUrl(urlString: string) {
  try {
    new URL(urlString); // Node.js v10+
    return true;
  } catch (e) {
    return false;
  }
}
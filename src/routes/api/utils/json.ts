/**
 * 解析JSON字符串，如果解析失败则返回默认值
 * @param jsonStr JSON字符串
 * @param defaultValue 默认值
 * @returns 解析后的对象或默认值
 */
export const parseJsonField = <T>(jsonStr: string | null, defaultValue: T): T => {
  if (!jsonStr) return defaultValue;
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    return defaultValue;
  }
};

/**
 * 序列化对象为JSON字符串
 * @param data 需要序列化的对象
 * @param defaultValue 默认值
 * @returns JSON字符串
 */
export const stringifyJsonField = (data: any, defaultValue: string = '[]'): string => {
  if (typeof data === 'string') return data;
  try {
    return JSON.stringify(data);
  } catch (e) {
    return defaultValue;
  }
};

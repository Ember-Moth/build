import CryptoJS from 'crypto-js';
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';
import MD5 from 'crypto-js/md5';
import { customAlphabet } from 'nanoid';

/**
 * 使用提供的密钥加密数据
 * @param data 需要加密的数据
 * @param key 加密密钥
 * @returns 加密后的数据（格式：iv:加密内容，均为base64编码）
 */
export function encrypt(data: string, key: string): string {
  // 确保密钥长度为32字节（256位）
  const paddedKey = key.padEnd(32, '0').slice(0, 32);

  // 创建随机初始化向量
  const iv = CryptoJS.lib.WordArray.random(16);

  // 创建密钥
  const keyWordArray = CryptoJS.enc.Utf8.parse(paddedKey);

  // 加密数据
  const encrypted = CryptoJS.AES.encrypt(data, keyWordArray, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  // 返回格式：iv:encrypted (都是base64编码)
  return `${CryptoJS.enc.Base64.stringify(iv)}:${encrypted.toString()}`;
}

/**
 * 使用提供的密钥解密数据
 * @param encryptedData 加密的数据（格式：iv:加密内容）
 * @param key 解密密钥
 * @returns 解密后的原始数据
 */
export function decrypt(encryptedData: string, key: string): string {
  // 分割iv和加密内容
  const [ivBase64, encryptedBase64] = encryptedData.split(':');

  if (!ivBase64 || !encryptedBase64) {
    throw new Error('加密数据格式无效');
  }

  // 确保密钥长度为32字节（256位）
  const paddedKey = key.padEnd(32, '0').slice(0, 32);

  // 从base64还原iv
  const iv = CryptoJS.enc.Base64.parse(ivBase64);

  // 创建密钥
  const keyWordArray = CryptoJS.enc.Utf8.parse(paddedKey);

  // 解密数据
  const decrypted = CryptoJS.AES.decrypt(encryptedBase64, keyWordArray, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * 生成 Cryptomus API 签名
 * 模拟 cryptomus-js 库的签名生成方法
 */
export const generateCryptomusSign = (
  payload: Record<string, any>,
  apiKey: string,
  jsonUnescape: boolean = false,
): string => {
  // 转换为JSON字符串并替换反斜杠
  const jsonStr = jsonUnescape
    ? JSON.stringify(payload).replace(/\\/g, '/')
    : JSON.stringify(payload);

  // 使用 crypto-js 进行 Base64 编码（等同于 Buffer.from(jsonStr).toString("base64")）
  const base64Data = Base64.stringify(Utf8.parse(jsonStr));

  // 计算 MD5 哈希
  return MD5(base64Data + apiKey).toString();
};

/**
 * 验证 Cryptomus Webhook 签名
 * @param params 包含 IP 地址和请求内容的参数
 * @param apiKey 用于验证签名的 API 密钥
 * @returns 验证结果，true 表示验证通过，false 表示验证失败
 */
export const verifyWebhookSignature = (
  body: Record<string, any> & { sign?: string },
  apiKey: string,
) => {
  const sign = generateCryptomusSign(body, apiKey, true);
  // 验证签名
  if (body.sign && typeof body.sign === 'string' && sign !== body.sign) {
    return {
      valid: false,
      message: `签名验证失败，期望签名：${sign}`,
    };
  }

  return {
    valid: true,
    message: '签名验证通过',
  };
};

/**
 * 生成随机密钥
 * @param length 生成密钥的长度
 * @returns
 */
export const generateRandomSecret = (length = 25) => {
  const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', length);
  return nanoid()
    .match(/.{1,5}/g)!
    .join('-');
};

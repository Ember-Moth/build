import type { RequestHandler } from '@builder.io/qwik-city';
import MD5 from 'crypto-js/md5';
import { errorResponse, successResponse } from '../utils/api-response';

export const onGet: RequestHandler = async ({ request, json, env }) => {
  try {
    // 从请求头获取 API 密钥
    const apiKeyMd5 = request.headers.get('x-api-key');

    if (!apiKeyMd5) {
      json(200, errorResponse(401, '未提供 API 密钥'));
      return;
    }

    // 计算环境变量中 API_KEY 的 MD5 值
    const configuredApiKey = env.get('API_KEY') || '';
    const configuredApiKeyMd5 = MD5(configuredApiKey).toString();

    // 比较请求头中的MD5值和环境变量计算出的MD5值
    if (apiKeyMd5 !== configuredApiKeyMd5) {
      json(200, errorResponse(401, '无效的 API 密钥'));
      return;
    }

    // API 密钥有效，返回成功响应
    json(200, successResponse({ authorized: true }, 'API 密钥验证成功'));
  } catch (error) {
    json(
      200,
      errorResponse(
        500,
        `API 密钥验证失败: ${error instanceof Error ? error.message : '未知错误'}`,
      ),
    );
  }
};

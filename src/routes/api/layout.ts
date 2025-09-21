import { type RequestHandler } from '@builder.io/qwik-city';
import MD5 from 'crypto-js/md5';
import { errorResponse } from './utils/api-response';

/**
 * 无需API密钥验证的路由列表
 * path: 路由路径
 * methods: 允许的HTTP方法，如果为空则表示所有方法都允许
 */
const unprotectedRoutes = [
  { path: '/api/atuh' },
  { path: '/api/project', methods: ['GET'] },
  { path: '/api/secret/validate', methods: ['POST'] },
  { path: '/api/task', methods: ['GET'] },
  { path: '/api/actions' },
  { path: '/api/order' },
  { path: '/api/payment/webhook' },
];

/**
 * API请求中间件，处理API密钥验证
 */
export const onRequest: RequestHandler = async (requestEvent) => {
  const { request, json, env, sharedMap, error, url } = requestEvent;

  // 检查是否为不受保护的路由
  const isUnprotectedRoute = unprotectedRoutes.some(
    (route) =>
      url.pathname.includes(route.path) &&
      (!route.methods || route.methods.length === 0 || route.methods.includes(request.method)),
  );

  if (isUnprotectedRoute) {
    sharedMap.set('apiKeyValid', true);
    return;
  }

  // 验证API密钥
  const apiKeyMd5 = request.headers.get('x-api-key');

  if (!apiKeyMd5) {
    throw error(401, '未提供 API 密钥');
  }

  const configuredApiKey = env.get('API_KEY') || '';
  const configuredApiKeyMd5 = MD5(configuredApiKey).toString();

  if (apiKeyMd5 !== configuredApiKeyMd5) {
    json(200, errorResponse(401, '无效的 API 密钥'));
    return;
  }

  // API 密钥有效，请求可以继续处理
  sharedMap.set('apiKeyValid', true);
};

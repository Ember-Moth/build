import type { RequestHandler } from '@builder.io/qwik-city';
import { eq } from 'drizzle-orm';
import { parseJsonField } from '~/routes/api/utils/json';
import { getDB } from '~drizzle/client';
import type { PaymentConfig } from '~drizzle/schema/projects';
import { projects } from '~drizzle/schema/projects';
import { secrets } from '~drizzle/schema/secrets';
import { verifyWebhookSignature } from '../../utils/crypto';

/**
 * 创建项目密钥
 */
const createProjectSecret = async (
  db: any,
  projectId: number,
  secretValue: string,
  orderType: string,
  quantity: number,
): Promise<boolean> => {
  try {
    // 设置密钥参数
    const secretName = `api-key-${Date.now()}`;
    let description = '';

    // 根据订单类型设置描述
    if (orderType === 'monthly') {
      description = '通过支付自动生成的API密钥 - 月付订阅';
    } else if (orderType === 'yearly') {
      description = '通过支付自动生成的API密钥 - 年付订阅';
    } else {
      description = '通过支付自动生成的API密钥 - 次数付费';
    }

    let maxCalls = null;
    let expiresAt = null;

    // 根据订单类型设置不同的限制
    if (orderType === 'monthly') {
      // 月付订阅：设置过期时间
      const monthsToAdd = quantity;
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + monthsToAdd);
      expiresAt = expiryDate.toISOString();
    } else if (orderType === 'yearly') {
      // 年付订阅：设置过期时间
      const yearsToAdd = quantity;
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + yearsToAdd);
      expiresAt = expiryDate.toISOString();
    } else if (orderType === 'per_use') {
      // 次数付费：设置最大调用次数
      maxCalls = quantity;
    }

    // 插入密钥记录
    await db.insert(secrets).values({
      name: secretName,
      value: secretValue,
      description: description,
      project_id: projectId,
      max_calls: maxCalls,
      expires_at: expiresAt,
      last_used_at: null,
    });

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * 获取项目的支付配置
 */
const getProjectPaymentConfig = async (
  db: any,
  projectId: number,
): Promise<{
  cryptomus?: {
    api_key: string;
    merchant_id: string;
  };
} | null> => {
  try {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    if (project && project.payment_config) {
      const config = parseJsonField<PaymentConfig>(project.payment_config, {});
      return config as any;
    }

    return null;
  } catch (error) {
    return null;
  }
};

/**
 * 处理支付成功后的逻辑
 */
const handlePaymentSuccess = async (db: any, payload: any): Promise<boolean> => {
  try {
    const additionalData = payload.additional_data ? JSON.parse(payload.additional_data) : {};

    if (
      !additionalData.project_id ||
      !additionalData.order_type ||
      !additionalData.quantity ||
      !additionalData.secret
    ) {
      return false;
    }

    const projectId = additionalData.project_id;
    const orderType = additionalData.order_type;
    const quantity = additionalData.quantity;
    const secret = additionalData.secret;

    return await createProjectSecret(db, projectId, secret, orderType, quantity);
  } catch (error) {
    return false;
  }
};

/**
 * POST请求处理函数 - Cryptomus 支付回调处理
 */
export const onPost: RequestHandler = async ({ request, json, env }) => {
  try {
    // 获取请求体
    const body = (await request.json()) as any;

    // 从请求体中提取项目ID (从additional_data中)
    let projectId: number | undefined;
    let projectApiKey: string | undefined;

    try {
      if (body.additional_data) {
        const additionalData = JSON.parse(body.additional_data);
        projectId = additionalData.project_id;
      }
    } catch (error) {
      // 静默处理解析错误
    }

    // 如果有项目ID，获取项目的支付配置
    const db = getDB(env);
    if (projectId) {
      const paymentConfig = await getProjectPaymentConfig(db, projectId);
      if (paymentConfig?.cryptomus?.api_key) {
        projectApiKey = paymentConfig.cryptomus.api_key;
      }
    }

    const apiKey = projectApiKey;

    if (!apiKey) {
      json(400, { status: 'error', message: '未设置API密钥，无法验证请求' });
      return;
    }
    if (!body.sign) {
      json(404, { status: 'error', message: '签名参数缺失' });
      return;
    }
    const { valid, message } = verifyWebhookSignature({ request: body }, apiKey);

    if (!valid) {
      json(401, { status: 'error', message: message });
      return;
    }

    // 检查支付状态
    if (!['paid', 'paid_over'].includes(body.status)) {
      json(200, { status: 'received' });
      return;
    }

    // 处理支付成功的逻辑
    const success = await handlePaymentSuccess(db, body);

    if (success) {
      json(200, { status: 'success' });
    } else {
      json(405, {
        status: 'error',
        message: '支付数据处理失败，请检查参数是否完整',
      });
    }
  } catch (error) {
    json(500, {
      status: 'error',
      message: `服务器内部错误: ${error instanceof Error ? error.message : '未知错误'}`,
    });
  }
};

import type { RequestHandler } from '@builder.io/qwik-city';
import { eq } from 'drizzle-orm';
import { getDB } from '~drizzle/client';
import type { PaymentConfig, Pricing } from '~drizzle/schema/projects';
import { projects } from '~drizzle/schema/projects';
import { errorResponse, successResponse } from '../utils/api-response';
import { generateCryptomusSign, generateRandomSecret } from '../utils/crypto';
import { parseJsonField } from '../utils/json';

/**
 * 调用 Cryptomus API 创建支付订单
 */
const createCryptomusPayment = async (
  env: any,
  orderData: {
    project_id: number;
    project_name: string;
    order_type: 'monthly' | 'per_use' | 'yearly';
    quantity: number;
    unit_price: number;
    total_amount: number;
    currency?: string;
    return_url?: string;
    secret?: string;
    payment_config: {
      cryptomus?: {
        api_key: string;
        merchant_id: string;
      };
    };
  },
) => {
  // 从项目支付配置中获取API密钥和商户ID
  const apiKey = orderData.payment_config.cryptomus?.api_key;
  const merchantId = orderData.payment_config.cryptomus?.merchant_id;

  if (!apiKey || !merchantId) {
    throw new Error('Cryptomus API 配置缺失');
  }

  // 构建唯一订单ID (使用时间戳+随机数+项目ID)
  const timestamp = Date.now();
  const randomValue = Math.floor(Math.random() * 10000);
  const uniqueOrderId = `${orderData.project_id}-${orderData.order_type}-${timestamp}-${randomValue}`;

  const currency = orderData.currency || 'USD';

  // 使用客户端提供的返回URL，如果没有则使用默认URL
  const returnUrl = orderData.return_url
    ? `${orderData.return_url}?order_id=${uniqueOrderId}`
    : `${env.APP_URL || 'https://api.bygga.app'}/payment/success?order_id=${uniqueOrderId}`;
  // 准备请求数据
  const orderTypeText =
    orderData.order_type === 'monthly'
      ? '月付'
      : orderData.order_type === 'yearly'
        ? '年付'
        : '次数付费';

  const cryptomusData = {
    amount: orderData.total_amount.toString(),
    currency,
    order_id: uniqueOrderId,
    url_return: returnUrl,
    url_callback: `${env.APP_URL || 'https://api.bygga.app'}/api/payment/webhook`,
    is_payment_multiple: false,
    lifetime: 3600, // 订单有效期（秒）
    description: `${orderData.project_name} - ${orderTypeText} x ${orderData.quantity}`,
    additional_data: JSON.stringify({
      project_id: orderData.project_id,
      order_type: orderData.order_type,
      quantity: orderData.quantity,
      unit_price: orderData.unit_price,
      return_url: orderData.return_url,
      secret: orderData.secret,
    }),
  };

  const sign = generateCryptomusSign(cryptomusData, apiKey);

  // 发送请求到 Cryptomus API
  const response = await fetch('https://api.cryptomus.com/v1/payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      merchant: merchantId,
      sign: sign,
    },
    body: JSON.stringify(cryptomusData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Cryptomus API 错误: ${JSON.stringify(errorData)}`);
  }

  const result = (await response.json()) as any;

  if (result.state !== 0) {
    throw new Error(`Cryptomus 支付创建失败: ${JSON.stringify(result)}`);
  }

  return {
    ...result.result,
    order_id: uniqueOrderId,
    project_id: orderData.project_id,
    order_type: orderData.order_type,
    quantity: orderData.quantity,
    unit_price: orderData.unit_price,
    total_amount: orderData.total_amount,
    return_url: returnUrl,
  };
};

/**
 * POST请求处理函数 - 创建订单
 */
export const onPost: RequestHandler = async ({ json, parseBody, env }) => {
  try {
    // 解析请求体
    const body = (await parseBody()) as {
      project_id: number;
      order_type: 'monthly' | 'per_use' | 'yearly';
      quantity?: number;
      return_url?: string;
    };

    // 验证必填字段
    if (!body.project_id) {
      json(200, errorResponse(400, '项目ID不能为空'));
      return;
    }

    if (!['monthly', 'per_use', 'yearly'].includes(body.order_type)) {
      json(200, errorResponse(400, "订单类型必须是 'monthly'、'yearly' 或 'per_use'"));
      return;
    }

    // 验证数量参数
    const quantity = body.quantity && body.quantity > 0 ? Math.floor(body.quantity) : 1;
    if (body.quantity !== undefined && body.quantity <= 0) {
      json(200, errorResponse(400, '数量必须大于0'));
      return;
    }

    // 获取项目信息
    const db = getDB(env);
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, body.project_id),
    });

    if (!project) {
      json(200, errorResponse(404, '项目不存在'));
      return;
    }

    // 解析项目定价信息
    const pricing = project.pricing ? parseJsonField<Pricing>(project.pricing, {}) : {};

    if (!pricing) {
      json(200, errorResponse(400, '项目未设置价格信息'));
      return;
    }

    // 解析支付配置信息
    const payment_config = project.payment_config
      ? parseJsonField<PaymentConfig>(project.payment_config, {})
      : {};

    // 根据订单类型确定单价
    let unitPrice = 0;
    if (body.order_type === 'monthly' && pricing.monthly) {
      unitPrice = pricing.monthly;
    } else if (body.order_type === 'yearly' && pricing.yearly) {
      unitPrice = pricing.yearly;
    } else if (body.order_type === 'per_use' && pricing.per_use) {
      unitPrice = pricing.per_use;
    } else {
      json(
        200,
        errorResponse(
          400,
          `项目未设置${
            body.order_type === 'monthly' ? '月' : body.order_type === 'yearly' ? '年' : '次数'
          }价格`,
        ),
      );
      return;
    }

    // 计算总金额
    const totalAmount = unitPrice * quantity;

    const secret = generateRandomSecret();

    // 调用 Cryptomus API 创建支付订单
    try {
      const paymentData = await createCryptomusPayment(env, {
        project_id: body.project_id,
        project_name: project.name,
        order_type: body.order_type,
        quantity: quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        return_url: body.return_url,
        secret: secret,
        payment_config: payment_config as any,
      });

      json(
        200,
        successResponse(
          {
            project_id: body.project_id,
            project_name: project.name,
            order_type: body.order_type,
            quantity: quantity,
            unit_price: unitPrice,
            total_amount: totalAmount,
            payment_url: paymentData.url,
            return_url: paymentData.return_url,
            payment_details: {
              uuid: paymentData.uuid,
              order_id: paymentData.order_id,
              status: 'pending',
              currencies: paymentData.currencies,
            },
          },
          '支付链接创建成功',
        ),
      );
    } catch (error) {
      console.error('支付创建失败:', error);
      json(
        200,
        errorResponse(500, `支付创建失败: ${error instanceof Error ? error.message : '未知错误'}`),
      );
    }
  } catch (error) {
    console.error('订单创建失败:', error);
    json(
      200,
      errorResponse(500, `订单创建失败: ${error instanceof Error ? error.message : '未知错误'}`),
    );
  }
};

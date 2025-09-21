import type { RequestHandler } from '@builder.io/qwik-city';
import { eq } from 'drizzle-orm';
import { getDB } from '~drizzle/client';
import { projects } from '~drizzle/schema';
import type { PaymentConfig } from '~drizzle/schema/projects';
import { errorResponse, successResponse } from '../../utils/api-response';
import { generateCryptomusSign } from '../../utils/crypto';
import { parseJsonField } from '../../utils/json';

/**
 * 通过 Cryptomus API 查询支付订单状态
 */
const getPaymentStatus = async (
  paymentId: string,
  isUuid: boolean = true,
  paymentConfig?: any,
): Promise<any> => {
  const apiKey = paymentConfig?.cryptomus?.api_key;
  const merchantId = paymentConfig?.cryptomus?.merchant_id;

  if (!apiKey || !merchantId) {
    throw new Error('Cryptomus API 配置缺失');
  }

  // 准备请求数据
  const requestData = isUuid ? { uuid: paymentId } : { order_id: paymentId };

  const sign = generateCryptomusSign(requestData, apiKey);

  // 发送请求到 Cryptomus API
  const response = await fetch('https://api.cryptomus.com/v1/payment/info', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      merchant: merchantId,
      sign: sign,
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Cryptomus API 错误: ${JSON.stringify(errorData)}`);
  }

  const result = (await response.json()) as any;

  if (result.state !== 0) {
    throw new Error(`查询支付状态失败: ${JSON.stringify(result)}`);
  }

  return result.result;
};

/**
 * 解析订单ID参数，确定是UUID还是自定义订单ID
 */
const parseOrderId = (id: string): { paymentId: string; isUuid: boolean; projectId?: number } => {
  // UUID格式通常是 8-4-4-4-12 的格式，共 36 字符 (包括连字符)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const isUuid = uuidPattern.test(id);

  // 如果不是UUID，尝试解析项目ID
  let projectId: number | undefined;
  if (!isUuid) {
    const parts = id.split('-');
    if (parts.length >= 2) {
      projectId = parseInt(parts[0], 10);
    }
  }

  return {
    paymentId: id,
    isUuid,
    projectId,
  };
};

/**
 * GET请求处理函数 - 获取订单状态
 */
export const onGet: RequestHandler = async ({ params, query, json, platform }) => {
  try {
    // 验证订单ID参数
    if (!params.id) {
      json(200, errorResponse(400, '订单ID不能为空'));
      return;
    }

    // 解析订单ID，确定是UUID还是自定义订单ID
    const { paymentId, isUuid, projectId } = parseOrderId(params.id);

    // 从查询参数中获取项目ID，如果订单ID中没有项目ID
    const queryProjectId = query.get('project_id');
    const finalProjectId = projectId || (queryProjectId ? parseInt(queryProjectId, 10) : undefined);

    // 如果有项目ID，获取项目的支付配置
    let paymentConfig;
    if (finalProjectId) {
      try {
        const db = getDB(platform.env);
        const project = await db.query.projects.findFirst({
          where: eq(projects.id, finalProjectId),
          columns: {
            payment_config: true,
          },
        });

        if (project?.payment_config) {
          paymentConfig = parseJsonField<PaymentConfig>(project.payment_config, {});
        }
      } catch (error) {
        console.error('获取项目支付配置失败:', error);
      }
    }

    try {
      // 调用 Cryptomus API 获取支付状态
      const paymentData = await getPaymentStatus(paymentId, isUuid, paymentConfig);

      // 解析 additional_data 中存储的项目信息
      let additionalData = {} as any;
      if (paymentData.additional_data) {
        try {
          additionalData = JSON.parse(paymentData.additional_data);
        } catch (e) {
          console.error('解析 additional_data 失败:', e);
        }
      }

      // 如果订单ID包含项目信息（格式为：`${project_id}-${order_type}-${timestamp}-${randomValue}`）
      // 则从订单ID中提取项目ID和订单类型
      let projectInfo = {};
      if (!isUuid && paymentData.order_id) {
        const parts = paymentData.order_id.split('-');
        if (parts.length >= 2) {
          projectInfo = {
            project_id: parseInt(parts[0], 10),
            order_type: parts[1],
          };
        }
      }
      if (!['paid', 'paid_over'].includes(paymentData.status)) {
        delete additionalData.secret;
      }

      // 组装响应数据
      const responseData = {
        payment_id: isUuid ? paymentData.uuid : paymentData.order_id,
        status: paymentData.status,
        amount: paymentData.amount,
        currency: paymentData.currency,
        payment_url: paymentData.url,
        created_at: paymentData.created_at,
        updated_at: paymentData.updated_at || paymentData.updated,
        paid_at: paymentData.paid_at || null,
        ...projectInfo,
        ...additionalData,
      };

      json(200, successResponse(responseData));
    } catch (error) {
      console.error('获取支付订单失败:', error);
      json(
        200,
        errorResponse(
          404,
          `订单不存在或查询失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ),
      );
    }
  } catch (error) {
    console.error('查询订单状态失败:', error);
    json(
      200,
      errorResponse(
        500,
        `查询订单状态失败: ${error instanceof Error ? error.message : '未知错误'}`,
      ),
    );
  }
};

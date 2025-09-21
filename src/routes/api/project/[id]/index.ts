import { type RequestHandler } from '@builder.io/qwik-city';
import { eq } from 'drizzle-orm';
import { parse } from 'valibot';
import {
  errorResponse,
  filterSensitiveData,
  successResponse,
} from '~/routes/api/utils/api-response';
import { parseJsonField, stringifyJsonField } from '~/routes/api/utils/json';
import { getDB } from '~drizzle/client';
import { projects, updateProjectSchema, type Project } from '~drizzle/schema/projects';
import { workflows } from '~drizzle/schema/workflows';

/**
 * GET请求处理函数 - 获取单个项目详情
 */
export const onGet: RequestHandler = async ({ env, params, json, sharedMap, request }) => {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      json(200, errorResponse(400, '无效的项目ID'));
      return;
    }

    // 检查API密钥验证状态
    const isApiKeyValid = !!request.headers.get('x-api-key') && !!sharedMap.get('apiKeyValid');

    const result = await getDB(env).select().from(projects).where(eq(projects.id, id));

    if (result.length === 0) {
      json(200, errorResponse(404, '项目不存在'));
      return;
    }

    // 处理JSON字符串字段
    const project = {
      ...result[0],
      deploy_methods: parseJsonField(result[0].deploy_methods, []),
      environment: parseJsonField(result[0].environment, []),
      pricing: parseJsonField(result[0].pricing, {}),
      payment_config: parseJsonField(result[0].payment_config, {}),
    };

    // 过滤敏感信息
    const filteredProject = filterSensitiveData(project, isApiKeyValid);

    json(200, successResponse(filteredProject, '获取项目成功'));
  } catch (error) {
    json(200, errorResponse(500, '获取项目失败', error));
  }
};

/**
 * PUT请求处理函数 - 更新项目
 */
export const onPut: RequestHandler = async ({ env, params, parseBody, json }) => {
  try {
    const db = getDB(env);

    const id = Number(params.id);
    if (isNaN(id)) {
      json(200, errorResponse(400, '无效的项目ID格式'));
      return;
    }

    // 检查项目是否存在
    const exists = await db.select().from(projects).where(eq(projects.id, id));
    if (exists.length === 0) {
      json(200, errorResponse(404, '项目不存在'));
      return;
    }

    const body = (await parseBody()) as Partial<Project>;

    // 如果更新了工作流ID，确认关联的工作流存在
    if (body.workflow_id) {
      const workflowExists = await db
        .select()
        .from(workflows)
        .where(eq(workflows.id, body.workflow_id));

      if (workflowExists.length === 0) {
        json(200, errorResponse(400, '关联的工作流不存在'));
        return;
      }
    }

    // 处理复杂类型字段
    if (body.deploy_methods !== undefined) {
      body.deploy_methods = stringifyJsonField(body.deploy_methods);
    }

    if (body.environment !== undefined) {
      body.environment = stringifyJsonField(body.environment);
    }

    if (body.pricing !== undefined) {
      body.pricing = stringifyJsonField(body.pricing);
    }

    if (body.payment_config !== undefined) {
      body.payment_config = stringifyJsonField(body.payment_config);
    }

    // 添加更新时间
    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    try {
      // 验证更新数据
      const validated = parse(updateProjectSchema, updateData);

      // 执行更新
      const updated = await db
        .update(projects)
        .set(validated)
        .where(eq(projects.id, id))
        .returning();

      // 处理返回结果
      const result = {
        ...updated[0],
        deploy_methods: parseJsonField(updated[0].deploy_methods, []),
        environment: parseJsonField(updated[0].environment, []),
        pricing: parseJsonField(updated[0].pricing, {}),
        payment_config: parseJsonField(updated[0].payment_config, {}),
      };

      json(200, successResponse(result, '更新项目成功'));
    } catch (e) {
      json(200, errorResponse(400, '数据验证失败', e));
    }
  } catch (error) {
    json(200, errorResponse(500, '更新项目失败', error));
  }
};

/**
 * DELETE请求处理函数 - 删除项目
 */
export const onDelete: RequestHandler = async ({ env, params, json }) => {
  try {
    const db = getDB(env);

    const id = Number(params.id);
    if (isNaN(id)) {
      json(200, errorResponse(400, '无效的项目ID格式'));
      return;
    }

    const exists = await db.select().from(projects).where(eq(projects.id, id));
    if (exists.length === 0) {
      json(200, errorResponse(404, '项目不存在'));
      return;
    }

    await db.delete(projects).where(eq(projects.id, id));
    json(200, successResponse(null, '删除项目成功'));
  } catch (error) {
    json(200, errorResponse(500, '删除项目失败', error));
  }
};

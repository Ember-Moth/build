import type { RequestHandler } from '@builder.io/qwik-city';
import { and, desc, eq, like } from 'drizzle-orm';
import { parse } from 'valibot';
import {
  errorResponse,
  filterSensitiveData,
  paginatedResponse,
  successResponse,
} from '~/routes/api/utils/api-response';
import { parseJsonField, stringifyJsonField } from '~/routes/api/utils/json';
import { getDB } from '~drizzle/client';
import type { CreateProject } from '~drizzle/schema/projects';
import { createProjectSchema, projects } from '~drizzle/schema/projects';
import { workflows } from '~drizzle/schema/workflows';

/**
 * 处理项目数据，解析JSON字段
 */
const processProjectData = (project: any) => {
  return {
    ...project,
    deploy_methods: parseJsonField(project.deploy_methods, []),
    environment: parseJsonField(project.environment, []),
    pricing: parseJsonField(project.pricing, {}),
    payment_config: parseJsonField(project.payment_config, {}),
  };
};

/**
 * GET请求处理函数 - 获取项目列表
 */
export const onGet: RequestHandler = async ({ env, query, json, sharedMap, request }) => {
  try {
    // 检查API密钥验证状态
    const isApiKeyValid = !!request.headers.get('x-api-key') && !!sharedMap.get('apiKeyValid');

    const db = getDB(env);

    // 解析分页和过滤参数
    const hasPageParams = query.has('page') || query.has('size');
    const page = hasPageParams ? Math.max(1, parseInt(query.get('page') || '1')) : null;
    const size = hasPageParams
      ? Math.max(1, Math.min(100, parseInt(query.get('size') || '10')))
      : null;
    const name = query.get('name') || '';
    const workflow_id = query.get('workflow_id') ? parseInt(query.get('workflow_id')!) : undefined;

    // 构建查询条件
    const whereConditions = [];
    if (name) whereConditions.push(like(projects.name, `%${name}%`));
    if (workflow_id) whereConditions.push(eq(projects.workflow_id, workflow_id));

    // 基本查询
    const baseQuery = db
      .select()
      .from(projects)
      .where(and(...whereConditions))
      .orderBy(desc(projects.created_at));

    // 处理分页或返回全部结果
    if (page !== null && size !== null) {
      const total = await db.$count(projects, and(...whereConditions));
      const pagedResults = await baseQuery.limit(size).offset((page - 1) * size);

      // 处理项目数据
      const data = pagedResults.map((project: any) => {
        const processedProject = processProjectData(project);
        return filterSensitiveData(processedProject, isApiKeyValid);
      });

      json(200, paginatedResponse(data, { page, pageSize: size, total }, '获取项目列表成功'));
    } else {
      const allResults = await baseQuery;

      // 处理项目数据
      const data = allResults.map((project: any) => {
        const processedProject = processProjectData(project);
        return filterSensitiveData(processedProject, isApiKeyValid);
      });

      json(200, successResponse(data, '获取项目列表成功'));
    }
  } catch (error) {
    json(200, errorResponse(500, '获取项目列表失败', error));
  }
};

/**
 * POST请求处理函数 - 创建新项目
 */
export const onPost: RequestHandler = async ({ env, parseBody, json }) => {
  try {
    const db = getDB(env);
    const body = (await parseBody()) as CreateProject;

    try {
      // 处理复杂类型字段
      const processedBody = {
        ...body,
        deploy_methods: stringifyJsonField(body.deploy_methods),
        environment: stringifyJsonField(body.environment),
        pricing: stringifyJsonField(body.pricing),
        payment_config: stringifyJsonField(body.payment_config),
      };

      // 验证数据
      const validatedData = parse(createProjectSchema, processedBody);

      // 验证工作流是否存在
      const workflowExists = await db
        .select()
        .from(workflows)
        .where(eq(workflows.id, validatedData.workflow_id!));

      if (workflowExists.length === 0) {
        json(200, errorResponse(400, '关联的工作流不存在'));
        return;
      }

      // 插入数据
      const newProject = await db.insert(projects).values(validatedData).returning();

      // 处理返回结果
      const result = processProjectData(newProject[0]);

      json(200, successResponse(result, '创建项目成功'));
    } catch (e) {
      json(200, errorResponse(400, '数据验证失败，请检查必填字段', e));
    }
  } catch (error) {
    json(200, errorResponse(500, '创建项目失败', error));
  }
};

import type { RequestHandler } from '@builder.io/qwik-city';
import { Octokit } from '@octokit/rest';
import { and, eq, gte, isNull, lt, or, sql } from 'drizzle-orm';
import {
  errorResponse,
  filterSensitiveData,
  successResponse,
} from '~/routes/api/utils/api-response';
import { getDB } from '~drizzle/client';
import type { DeployMethod } from '~drizzle/schema/projects';
import { projects } from '~drizzle/schema/projects';
import { secrets } from '~drizzle/schema/secrets';
import { tasks } from '~drizzle/schema/tasks';
import { workflows } from '~drizzle/schema/workflows';
import { encrypt } from '../utils/crypto';

/**
 * 定义任务请求接口
 */
interface TaskRequest {
  project_id: number;
  deploy_method: string;
  environment?: Record<string, string>;
  secret: string;
}

/**
 * 验证密钥是否有效
 */
async function validateSecretRecord(db: any, secretValue: string, projectId: number) {
  if (!secretValue) {
    return { valid: false, message: '密钥不能为空' };
  }

  if (!projectId) {
    return { valid: false, message: '项目ID不能为空' };
  }

  const now = new Date().toISOString();

  try {
    const validSecrets = await db
      .select()
      .from(secrets)
      .where(
        and(
          eq(secrets.value, secretValue),
          eq(secrets.project_id, projectId),
          or(isNull(secrets.expires_at), eq(secrets.expires_at, '0'), gte(secrets.expires_at, now)),
          or(
            isNull(secrets.max_calls),
            eq(secrets.max_calls, 0),
            lt(sql`IFNULL(${secrets.current_calls}, 0)`, secrets.max_calls),
          ),
        ),
      );

    if (validSecrets.length === 0) {
      return { valid: false, message: '无效的密钥或密钥已过期' };
    }

    return { valid: true, message: '密钥验证成功', secret: validSecrets[0] };
  } catch (error) {
    console.error('验证密钥失败:', error);
    return {
      valid: false,
      message: `验证密钥时出错: ${error instanceof Error ? error.message : '未知错误'}`,
    };
  }
}

/**
 * 更新密钥使用次数
 */
async function incrementSecretCalls(db: any, secretId: number) {
  try {
    await db
      .update(secrets)
      .set({
        current_calls: sql`IFNULL(${secrets.current_calls}, 0) + 1`,
        last_used_at: new Date().toISOString(),
      })
      .where(eq(secrets.id, secretId));
    return true;
  } catch (error) {
    console.error('更新密钥使用次数失败:', error);
    return false;
  }
}

/**
 * GET请求处理函数 - 获取任务状态
 */
export const onGet: RequestHandler = async ({ env, query, json }) => {
  try {
    const db = getDB(env);
    const taskId = query.get('task_id');

    if (!taskId) {
      json(200, errorResponse(400, '任务ID不能为空'));
      return;
    }

    // 查询任务信息
    const taskResult = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, parseInt(taskId, 10)));

    if (taskResult.length === 0) {
      json(200, errorResponse(404, '任务不存在'));
      return;
    }

    const task = taskResult[0];

    // 查询项目信息
    const projectResult = await db.select().from(projects).where(eq(projects.id, task.project_id!));

    if (projectResult.length === 0) {
      json(200, errorResponse(404, '项目不存在'));
      return;
    }

    const project = projectResult[0];

    // 查询工作流信息
    const workflowResult = await db
      .select()
      .from(workflows)
      .where(eq(workflows.id, project.workflow_id!));

    if (workflowResult.length === 0) {
      json(200, errorResponse(404, '工作流不存在'));
      return;
    }

    const workflow = workflowResult[0];

    // 调用GitHub API获取运行状态
    const octokit = new Octokit({ auth: workflow.github_token });
    const run = await octokit.rest.actions.getWorkflowRun({
      owner: workflow.repo_owner,
      repo: workflow.repo_name,
      run_id: task.run_id,
    });

    // 获取构建产物
    let artifacts_list: Array<{
      id: number;
      name: string;
      size_in_bytes: number;
      download_url: string;
    }> = [];

    if (run.data.status === 'completed') {
      const artifacts = await octokit.rest.actions.listWorkflowRunArtifacts({
        owner: workflow.repo_owner,
        repo: workflow.repo_name,
        run_id: task.run_id,
      });

      artifacts_list = artifacts.data.artifacts.map((artifact) => ({
        id: artifact.id,
        name: artifact.name,
        size_in_bytes: artifact.size_in_bytes,
        download_url: `https://github.com/${workflow.repo_owner}/${workflow.repo_name}/actions/runs/${task.run_id}/artifacts/${artifact.id}`,
      }));
    }

    // 处理JSON字段
    const parseJsonField = (jsonStr: string | null, defaultValue: any = []) => {
      if (!jsonStr) return defaultValue;
      try {
        return JSON.parse(jsonStr);
      } catch (e) {
        return defaultValue;
      }
    };

    // 处理项目数据
    const projectData = {
      ...project,
      deploy_methods: parseJsonField(project.deploy_methods),
      environment: parseJsonField(project.environment),
      pricing: parseJsonField(project.pricing),
      payment_config: parseJsonField(project.payment_config),
    };

    // 返回任务状态
    json(
      200,
      successResponse({
        id: task.id,
        project: filterSensitiveData(projectData, false),
        status: run.data.status,
        conclusion: run.data.conclusion,
        artifacts: artifacts_list,
        created_at: task.created_at,
        updated_at: run.data.updated_at,
      }),
    );
  } catch (error) {
    json(200, errorResponse(500, '查询任务失败', error));
  }
};

/**
 * POST请求处理函数 - 创建新任务
 */
export const onPost: RequestHandler = async ({ env, parseBody, json }) => {
  try {
    const db = getDB(env);
    const body = (await parseBody()) as TaskRequest;

    try {
      // 处理并验证请求数据
      const processedBody = {
        project_id: body.project_id,
        deploy_method: body.deploy_method,
        environment: body.environment || {},
        secret: body.secret,
      };

      // 快速验证必填字段
      if (!processedBody.project_id || !processedBody.secret || !processedBody.deploy_method) {
        const errorField = !processedBody.project_id
          ? '项目ID'
          : !processedBody.secret
            ? '密钥'
            : '部署方法';
        json(200, errorResponse(400, `${errorField}不能为空`));
        return;
      }

      // 验证密钥
      const result = await validateSecretRecord(db, processedBody.secret, processedBody.project_id);
      if (!result.valid) {
        json(200, errorResponse(400, result.message));
        return;
      }

      // 查询项目信息
      const projectResult = await db
        .select()
        .from(projects)
        .where(eq(projects.id, processedBody.project_id));

      if (projectResult.length === 0) {
        json(200, errorResponse(404, '项目不存在'));
        return;
      }

      const project = projectResult[0];

      // 查询工作流信息
      const workflowResult = await db
        .select()
        .from(workflows)
        .where(eq(workflows.id, project.workflow_id!));

      if (workflowResult.length === 0) {
        json(200, errorResponse(404, '关联的工作流不存在'));
        return;
      }

      const workflow = workflowResult[0];

      // 初始化GitHub客户端
      const octokit = new Octokit({ auth: workflow.github_token });

      // 获取部署方法
      const parseJsonField = (jsonStr: string | null, defaultValue: any = []) => {
        if (!jsonStr) return defaultValue;
        try {
          return JSON.parse(jsonStr);
        } catch (e) {
          return defaultValue;
        }
      };

      const deploy_methods = parseJsonField(project.deploy_methods, []);
      const method = deploy_methods.find(
        (item: DeployMethod) => item.type === processedBody.deploy_method,
      );

      if (!method) {
        json(200, errorResponse(400, '指定的部署方法不存在'));
        return;
      }

      const runs_on = method?.runs_on || 'ubuntu-latest';
      const branch = method?.branch || 'main';
      const commands = method?.commands || [];
      const outputs = method?.outputs || [];
      const compress = method?.compress ? 'true' : 'false';

      // 处理环境变量
      const encrypted = workflow.github_token ? 'true' : 'false';
      let environment = '';

      if (encrypted === 'true' && Object.keys(processedBody.environment).length > 0) {
        const environmentJSON = JSON.stringify(processedBody.environment);
        environment = encrypt(environmentJSON, workflow.github_token);
      } else {
        environment = Object.entries(processedBody.environment)
          .map(([key, value]) => `${key}=${value}`)
          .join(',');
      }

      // 获取最近工作流运行的ID
      const currentRuns = await octokit.rest.actions.listWorkflowRuns({
        owner: workflow.repo_owner,
        repo: workflow.repo_name,
        workflow_id: workflow.workflow_file,
        branch: workflow.branch,
        per_page: 1,
      });

      const lastRunId = currentRuns.data.workflow_runs[0]?.id || 0;

      // 触发工作流
      await octokit.rest.actions.createWorkflowDispatch({
        owner: workflow.repo_owner,
        repo: workflow.repo_name,
        workflow_id: workflow.workflow_file,
        ref: workflow.branch,
        inputs: {
          runs_on: runs_on,
          username: project.repo_owner || '',
          repo: project.repo_name || '',
          branch: branch,
          build_command: commands.join(';'),
          artifact_paths: outputs.join(','),
          compress_artifacts: compress,
          env_vars: environment,
          encrypted: encrypted,
        },
      });

      // 等待并查询新的工作流运行
      let runId: number | undefined;
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log(`尝试查找新工作流运行: 第${attempts + 1}次尝试`);

        const workflowRuns = await octokit.rest.actions.listWorkflowRuns({
          owner: workflow.repo_owner,
          repo: workflow.repo_name,
          workflow_id: workflow.workflow_file,
          branch: workflow.branch,
          per_page: 10,
        });

        // 查找ID大于lastRunId的工作流运行
        const newRun = workflowRuns.data.workflow_runs.find((run) => run.id > lastRunId);

        if (newRun) {
          runId = newRun.id;
          console.log('找到新的工作流运行, ID:', runId);
          break;
        }

        attempts++;
      }

      if (!runId) {
        json(200, errorResponse(500, '无法获取工作流运行ID，请稍后检查GitHub Actions页面'));
        return;
      }

      // 创建任务记录
      let taskId = null;
      if (result.secret?.id && runId) {
        // 插入任务记录
        const newTask = await db
          .insert(tasks)
          .values({
            project_id: processedBody.project_id,
            run_id: runId,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .returning();

        // 更新密钥使用次数
        if (newTask.length > 0) {
          await incrementSecretCalls(db, result.secret.id);
          taskId = newTask[0].id;
        }
      }

      json(
        200,
        successResponse(
          {
            task_id: taskId,
            run_id: runId,
          },
          '任务创建成功',
        ),
      );
    } catch (e) {
      json(200, errorResponse(400, '请求数据验证失败', e));
    }
  } catch (error) {
    json(200, errorResponse(500, '服务器内部错误', error));
  }
};

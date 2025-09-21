import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { LuFilePlus, LuFileText, LuKey, LuLoader2, LuPlus } from '@qwikest/icons/lucide';
import { useProject } from '~/stores/project';
import { useSecret } from '~/stores/secret';
import { useWorkflow } from '~/stores/workflow';

export default component$(() => {
  const { projectStore, getProjects } = useProject();
  const { workflowStore, getWorkflows } = useWorkflow();
  const { secretStore, getSecrets } = useSecret();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    getProjects();
  });
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    getWorkflows();
  });
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    getSecrets();
  });
  if (projectStore.loading.list || workflowStore.loading.list || secretStore.loading.list) {
    return (
      <div class="flex items-center justify-center h-screen">
        <LuLoader2 class="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div class="space-y-4">
      {/* 标题和统计卡片区 - 更紧凑的布局 */}
      <div class="flex flex-col md:flex-row gap-4">
        <div class="md:w-1/3">
          <h1 class="text-xl font-bold tracking-tight mb-1">管理仪表盘</h1>
          <p class="text-sm text-muted-foreground mb-2">查看系统概况和最近更新</p>

          {/* 快捷操作区域 - 移到顶部并简化 */}
          <div class="border rounded-md bg-card p-3">
            <h2 class="text-sm font-medium mb-2">快捷操作</h2>
            <div class="grid grid-cols-3 gap-2">
              <Link
                href="/admin/project/create"
                class="flex flex-col items-center rounded-md border p-2 hover:bg-muted"
              >
                <LuPlus class="h-4 w-4 mb-1" />
                <span class="text-xs">新项目</span>
              </Link>
              <Link
                href="/admin/workflow/create"
                class="flex flex-col items-center rounded-md border p-2 hover:bg-muted"
              >
                <LuFilePlus class="h-4 w-4 mb-1" />
                <span class="text-xs">新工作流</span>
              </Link>
              <Link
                href="/admin/secret/create"
                class="flex flex-col items-center rounded-md border p-2 hover:bg-muted"
              >
                <LuKey class="h-4 w-4 mb-1" />
                <span class="text-xs">新密钥</span>
              </Link>
            </div>
          </div>
        </div>

        <div class="md:w-2/3 grid grid-cols-3 gap-2">
          <div class="rounded-md border bg-card p-3">
            <div class="flex items-center gap-1 mb-1">
              <LuFileText class="h-4 w-4 text-muted-foreground" />
              <h3 class="text-xs font-medium">项目</h3>
            </div>
            <div class="flex items-baseline">
              <p class="text-xl font-bold">{projectStore.list.length}</p>
              <Link href="/admin/project" class="text-xs text-primary hover:underline ml-2">
                查看全部
              </Link>
            </div>
            <div class="mt-1 h-1 w-full bg-muted">
              <div class="h-1 w-1/3 bg-primary"></div>
            </div>
          </div>

          <div class="rounded-md border bg-card p-3">
            <div class="flex items-center gap-1 mb-1">
              <LuFileText class="h-4 w-4 text-muted-foreground" />
              <h3 class="text-xs font-medium">工作流</h3>
            </div>
            <div class="flex items-baseline">
              <p class="text-xl font-bold">{workflowStore.list.length}</p>
              <Link href="/admin/workflow" class="text-xs text-primary hover:underline ml-2">
                查看全部
              </Link>
            </div>
            <div class="mt-1 h-1 w-full bg-muted">
              <div class="h-1 w-1/2 bg-primary"></div>
            </div>
          </div>

          <div class="rounded-md border bg-card p-3">
            <div class="flex items-center gap-1 mb-1">
              <LuKey class="h-4 w-4 text-muted-foreground" />
              <h3 class="text-xs font-medium">密钥</h3>
            </div>
            <div class="flex items-baseline">
              <p class="text-xl font-bold">{secretStore.list.length}</p>
              <Link href="/admin/secret" class="text-xs text-primary hover:underline ml-2">
                查看全部
              </Link>
            </div>
            <div class="mt-1 h-1 w-full bg-muted">
              <div class="h-1 w-2/3 bg-primary"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 最近项目 */}
      <div class="rounded-md border bg-card">
        <div class="flex items-center justify-between p-3">
          <h2 class="text-sm font-medium">最近项目</h2>
          <Link href="/admin/project" class="text-xs text-primary hover:underline">
            查看全部
          </Link>
        </div>
        <div class="px-3 pb-3">
          {projectStore.list.length > 0 ? (
            <div class="space-y-2">
              {projectStore.list.map((project) => (
                <div key={project.id} class="rounded-md border p-2 hover:bg-muted/50">
                  <div class="flex items-center justify-between">
                    <Link
                      href={`/admin/project/${project.id}`}
                      class="font-medium hover:underline text-sm"
                    >
                      {project.name}
                    </Link>
                    {project.workflow_id && (
                      <span class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        已关联工作流
                      </span>
                    )}
                  </div>
                  <p class="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {project.description || '无描述'}
                  </p>
                  <div class="mt-1 flex items-center text-xs text-muted-foreground">
                    {project.repo_owner && project.repo_name ? (
                      <span>
                        {project.repo_owner}/{project.repo_name}
                      </span>
                    ) : (
                      <span>未关联仓库</span>
                    )}
                    {project.preview && (
                      <a
                        href={project.preview}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="ml-2 text-blue-500 hover:underline"
                      >
                        预览
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div class="py-4 text-center text-muted-foreground">
              <p class="text-sm">暂无项目数据</p>
              <Link
                href="/admin/project/create"
                class="mt-1 inline-block text-xs text-primary hover:underline"
              >
                创建第一个项目
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

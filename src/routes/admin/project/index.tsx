import { $, component$, useVisibleTask$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { LuLoader2, LuPen, LuPlus, LuTrash2 } from '@qwikest/icons/lucide';
import { Button, buttonVariants } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Table } from '~/components/ui/table';
import { useProject } from '~/stores/project';
import { useWorkflow } from '~/stores/workflow';

export default component$(() => {
  const { projectStore, getProjects, deleteProject, setParams } = useProject();
  const { workflowStore, getWorkflows } = useWorkflow();

  // 加载项目数据和工作流数据
  useVisibleTask$(({ track }) => {
    track(() => projectStore.params.name);
    getProjects();
    getWorkflows();
  });

  // 删除项目的确认
  const handleDelete = $(async (id: number) => {
    if (confirm('确定要删除此项目吗？该操作不可恢复。')) {
      const success = await deleteProject(id);
      if (success) {
        await getProjects();
      }
    }
  });

  // 获取工作流名称的辅助函数
  const getWorkflowName = (workflowId?: number) => {
    if (!workflowId) return '-';
    const workflow = workflowStore.list.find((w) => w.id === workflowId);
    return workflow?.name || `工作流 ID: ${workflowId}`;
  };

  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold tracking-tight">项目管理</h2>
          <p class="text-muted-foreground">管理部署项目和应用配置</p>
        </div>
        <Link href="/admin/project/create" class={buttonVariants()}>
          <LuPlus class="mr-2 h-4 w-4" />
          添加项目
        </Link>
      </div>

      <div class="rounded-md border bg-card">
        {/* 搜索和筛选 */}
        <div class="p-4 border-b">
          <Input
            name="name"
            placeholder="搜索项目名称..."
            class="max-w-xs"
            value={projectStore.params.name || ''}
            onInput$={(e, el) => {
              setParams({ name: el.value });
            }}
          />
        </div>

        {/* 项目列表 */}
        <div class="relative overflow-x-auto">
          {projectStore.loading.list ? (
            <div class="absolute inset-0 flex items-center justify-center">
              <LuLoader2 class="h-6 w-6 animate-spin" />
            </div>
          ) : projectStore.list.length === 0 ? (
            <div class="p-4 text-center">
              <p class="text-muted-foreground">暂无项目数据</p>
            </div>
          ) : (
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.Head class="whitespace-nowrap">ID</Table.Head>
                  <Table.Head class="whitespace-nowrap">名称</Table.Head>
                  <Table.Head class="whitespace-nowrap">仓库</Table.Head>
                  <Table.Head class="whitespace-nowrap">关联工作流</Table.Head>
                  <Table.Head class="whitespace-nowrap">预览地址</Table.Head>
                  <Table.Head class="whitespace-nowrap">创建时间</Table.Head>
                  <Table.Head class="text-right whitespace-nowrap">操作</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {projectStore.list.map((project) => (
                  <Table.Row key={project.id}>
                    <Table.Cell class="whitespace-nowrap font-medium">{project.id}</Table.Cell>
                    <Table.Cell class="whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">
                      {project.name}
                    </Table.Cell>
                    <Table.Cell class="whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">
                      {project.repo_owner && project.repo_name
                        ? `${project.repo_owner}/${project.repo_name}`
                        : '-'}
                    </Table.Cell>
                    <Table.Cell class="whitespace-nowrap">
                      {project.workflow_id ? (
                        <Link
                          href={`/admin/workflow/${project.workflow_id}`}
                          class="text-blue-500 hover:underline"
                        >
                          {getWorkflowName(project.workflow_id)}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </Table.Cell>
                    <Table.Cell class="whitespace-nowrap">
                      {project.preview ? (
                        <a
                          href={project.preview}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="text-blue-500 hover:underline"
                        >
                          预览
                        </a>
                      ) : (
                        '-'
                      )}
                    </Table.Cell>
                    <Table.Cell class="whitespace-nowrap">
                      {new Date(project.created_at || '').toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Table.Cell>
                    <Table.Cell class="text-right whitespace-nowrap space-x-2">
                      <Link
                        href={`/admin/project/${project.id}`}
                        class={buttonVariants({
                          variant: 'outline',
                          size: 'icon',
                        })}
                      >
                        <LuPen class="h-4 w-4" />
                      </Link>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick$={() => handleDelete(project.id!)}
                        disabled={projectStore.loading.delete}
                      >
                        <LuTrash2 class="h-4 w-4" />
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          )}
        </div>
      </div>
    </div>
  );
});

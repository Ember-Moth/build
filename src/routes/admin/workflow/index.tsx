import { $, component$, useVisibleTask$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { LuLoader2, LuPen, LuPlus, LuTrash2 } from '@qwikest/icons/lucide';
import { Button, buttonVariants } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Table } from '~/components/ui/table';
import { useWorkflow } from '~/stores/workflow';

export default component$(() => {
  const { workflowStore, getWorkflows, deleteWorkflow, setParams } = useWorkflow();

  useVisibleTask$(({ track }) => {
    track(() => workflowStore.params.name);
    getWorkflows();
  });

  const handleDelete = $(async (id: number) => {
    if (confirm('确定要删除此工作流吗？该操作不可恢复。')) {
      const success = await deleteWorkflow(id);
      if (success) {
        await getWorkflows();
      }
    }
  });

  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold tracking-tight">工作流管理</h2>
          <p class="text-muted-foreground">管理自动化工作流配置</p>
        </div>
        <Link href="/admin/workflow/create" class={buttonVariants()}>
          <LuPlus class="mr-2 h-4 w-4" />
          添加工作流
        </Link>
      </div>

      <div class="rounded-md border bg-card">
        {/* 搜索和筛选 */}
        <div class="p-4 border-b">
          <Input
            name="name"
            placeholder="搜索工作流名称..."
            class="max-w-xs"
            value={workflowStore.params.name || ''}
            onInput$={(e, el) => {
              setParams({ name: el.value });
            }}
          />
        </div>

        {/* 工作流列表 */}
        <div class="relative overflow-x-auto">
          {workflowStore.loading.list ? (
            <div class="absolute inset-0 flex items-center justify-center">
              <LuLoader2 class="h-6 w-6 animate-spin" />
            </div>
          ) : workflowStore.list.length === 0 ? (
            <div class="p-4 text-center">
              <p class="text-muted-foreground">暂无工作流数据</p>
            </div>
          ) : (
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.Head class="whitespace-nowrap">ID</Table.Head>
                  <Table.Head class="whitespace-nowrap">名称</Table.Head>
                  <Table.Head class="whitespace-nowrap">仓库</Table.Head>
                  <Table.Head class="whitespace-nowrap">工作流文件</Table.Head>
                  <Table.Head class="whitespace-nowrap">分支</Table.Head>
                  <Table.Head class="whitespace-nowrap">创建时间</Table.Head>
                  <Table.Head class="text-right whitespace-nowrap">操作</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {workflowStore.list.map((workflow) => (
                  <Table.Row key={workflow.id}>
                    <Table.Cell class="whitespace-nowrap font-medium">{workflow.id}</Table.Cell>
                    <Table.Cell class="whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">
                      {workflow.name}
                    </Table.Cell>
                    <Table.Cell class="whitespace-nowrap">
                      {workflow.repo_owner && workflow.repo_name
                        ? `${workflow.repo_owner}/${workflow.repo_name}`
                        : '-'}
                    </Table.Cell>
                    <Table.Cell class="whitespace-nowrap">{workflow.workflow_file}</Table.Cell>
                    <Table.Cell class="whitespace-nowrap">{workflow.branch}</Table.Cell>
                    <Table.Cell class="whitespace-nowrap">
                      {new Date(workflow.created_at || '').toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </Table.Cell>
                    <Table.Cell class="text-right whitespace-nowrap space-x-2">
                      <Link
                        href={`/admin/workflow/${workflow.id}`}
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
                        onClick$={() => handleDelete(workflow.id!)}
                        disabled={workflowStore.loading.delete}
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

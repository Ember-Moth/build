import { $, component$, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { Link, useLocation, useNavigate } from '@builder.io/qwik-city';
import { LuArrowLeft, LuPlus, LuSave, LuTrash } from '@qwikest/icons/lucide';
import {
  Accordion,
  ArrayInput,
  Button,
  Checkbox,
  Input,
  Label,
  Select,
  Textarea,
  buttonVariants,
} from '~/components/ui';
import { useProject } from '~/stores/project';
import { useWorkflow } from '~/stores/workflow';

export default component$(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = useSignal(false);
  const id = location.params.id;

  const { projectStore, getProjectDetail, createProject, updateProject } = useProject();
  const { workflowStore, getWorkflows } = useWorkflow();

  // 使用 useStore 管理整个项目数据
  const project = useStore({
    name: '',
    description: '',
    repo_owner: '',
    repo_name: '',
    preview: '',
    workflow_id: undefined as number | undefined,
    deploy_methods: [] as Array<{
      type: string;
      name: string;
      description: string;
      runs_on: string;
      branch: string;
      commands: string[];
      outputs: string[];
      compress: boolean;
    }>,
    environment: [] as Array<{ name: string; description: string }>,
    pricing: { monthly: 0, yearly: 0, per_use: 0 },
    payment_config: { cryptomus: { api_key: '', merchant_id: '' } },
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    getWorkflows();
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    if (id && id !== 'create') {
      isEdit.value = true;
      await getProjectDetail(parseInt(id));
      if (projectStore.detail) {
        Object.assign(project, projectStore.detail);
        // 确保数组存在
        project.deploy_methods = project.deploy_methods || [];
        project.environment = project.environment || [];
      }
    }
  });

  const workflowOptions = workflowStore.list.map((w) => ({
    label: w.name,
    value: w.id ? w.id.toString() : '',
  }));

  // 表单提交处理
  const handleSubmit = $(async (event: Event) => {
    event.preventDefault();
    // 简单验证
    if (!project.name || !project.description) return;
    if (isEdit.value && id) {
      await updateProject(parseInt(id), project as any);
    } else {
      await createProject(project as any);
    }
    navigate('/admin/project');
  });

  const addDeployMethod = $(() => {
    project.deploy_methods.push({
      type: 'static',
      name: '',
      description: '',
      runs_on: 'ubuntu-latest', // 设置默认运行环境
      branch: 'main', // 设置默认分支
      commands: ['npm run build'], // 提供常用命令作为默认值
      outputs: ['dist'], // 提供常用输出目录作为默认值
      compress: true, // 默认启用压缩
    });
  });

  const removeDeployMethod = $((index: number) => {
    project.deploy_methods.splice(index, 1);
  });

  const addEnvironment = $(() => {
    project.environment.push({
      name: '',
      description: '',
    });
  });

  const removeEnvironment = $((index: number) => {
    project.environment.splice(index, 1);
  });

  return (
    <div class="space-y-4 pb-20">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold tracking-tight">{isEdit.value ? '编辑项目' : '创建项目'}</h2>
        <Link href="/admin/project" class={buttonVariants({ variant: 'outline' })}>
          <LuArrowLeft class="mr-2 h-4 w-4" />
          返回列表
        </Link>
      </div>

      <form onSubmit$={handleSubmit} class="space-y-8">
        {/* 基本信息分区 */}
        <div class="space-y-4 border-b pb-6">
          <h3 class="text-xl font-semibold mb-4">基本信息</h3>

          <div class="space-y-2">
            <Label for="name">
              项目名称<span class="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={project.name}
              onInput$={(e) => (project.name = (e.target as HTMLInputElement).value)}
              placeholder="请输入项目名称"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="description">
              项目描述<span class="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={project.description}
              onInput$={(e) => (project.description = (e.target as HTMLTextAreaElement).value)}
              placeholder="请输入项目描述"
              rows={4}
              required
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="repo_owner">仓库拥有者</Label>
              <Input
                id="repo_owner"
                value={project.repo_owner}
                onInput$={(e) => (project.repo_owner = (e.target as HTMLInputElement).value)}
                placeholder="如: github-username"
              />
            </div>
            <div class="space-y-2">
              <Label for="repo_name">仓库名称</Label>
              <Input
                id="repo_name"
                value={project.repo_name}
                onInput$={(e) => (project.repo_name = (e.target as HTMLInputElement).value)}
                placeholder="如: my-project"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="preview">预览地址</Label>
            <Input
              id="preview"
              value={project.preview}
              onInput$={(e) => (project.preview = (e.target as HTMLInputElement).value)}
              placeholder="如: https://example.com"
              type="url"
            />
          </div>

          <div class="space-y-2">
            <Label for="workflow">关联工作流</Label>
            <Select.Root
              value={project.workflow_id ? project.workflow_id.toString() : ''}
              onChange$={$((value: string | string[]) => {
                project.workflow_id = value ? parseInt(value as string) : undefined;
              })}
            >
              <Select.Trigger aria-invalid="false">
                <Select.DisplayValue placeholder="请选择工作流" />
              </Select.Trigger>
              <Select.Popover>
                {workflowOptions.map((opt) => (
                  <Select.Item key={opt.value} value={opt.value}>
                    <Select.ItemLabel>{opt.label}</Select.ItemLabel>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Popover>
            </Select.Root>
          </div>
        </div>

        {/* 部署方式分区 */}
        <div class="space-y-4 border-b pb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold">部署方式管理</h3>
            <Button type="button" variant="outline" onClick$={addDeployMethod}>
              <LuPlus class="mr-2 size-4" /> 添加部署方式
            </Button>
          </div>

          {project.deploy_methods.length === 0 ? (
            <div class="py-8 text-center border rounded-md">
              <p class="text-muted-foreground">尚未添加任何部署方式</p>
            </div>
          ) : (
            <Accordion.Root class="space-y-4">
              {project.deploy_methods.map((method, index) => (
                <Accordion.Item key={index} value={`deploy-${index}`} class="border rounded-md">
                  <Accordion.Trigger class="px-4 py-0">
                    <div class="flex items-center">
                      <span class="font-medium">{method.name || method.type || '部署方式'}</span>
                      {method.name && method.type && (
                        <span class="ml-2 text-xs text-muted-foreground">{method.type}</span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      class="text-destructive mr-2 ml-auto"
                      onClick$={(e) => {
                        e.stopPropagation();
                        removeDeployMethod(index);
                      }}
                    >
                      <LuTrash class="h-4 w-4" />
                    </Button>
                  </Accordion.Trigger>

                  <Accordion.Content class="px-4 pb-4 space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>类型</Label>
                        <Input
                          value={method.type}
                          onInput$={(e) => (method.type = (e.target as HTMLInputElement).value)}
                          placeholder="例如 github"
                        />
                      </div>
                      <div>
                        <Label>名称</Label>
                        <Input
                          value={method.name}
                          onInput$={(e) => (method.name = (e.target as HTMLInputElement).value)}
                          placeholder="例如 GitHub Pages"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>描述</Label>
                      <Textarea
                        value={method.description}
                        onInput$={(e) =>
                          (method.description = (e.target as HTMLTextAreaElement).value)
                        }
                        placeholder="描述部署方式"
                      />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>运行环境</Label>
                        <Input
                          value={method.runs_on}
                          onInput$={(e) => (method.runs_on = (e.target as HTMLInputElement).value)}
                          placeholder="例如 ubuntu-latest"
                        />
                      </div>
                      <div>
                        <Label>部署分支</Label>
                        <Input
                          value={method.branch}
                          onInput$={(e) => (method.branch = (e.target as HTMLInputElement).value)}
                          placeholder="例如 main"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>命令</Label>
                      <ArrayInput
                        value={method.commands}
                        placeholder="例如: npm run build"
                        onChange$={(value) => (method.commands = value)}
                      />
                    </div>

                    <div>
                      <Label>输出</Label>
                      <ArrayInput
                        value={method.outputs || []}
                        placeholder="例如: dist"
                        onChange$={(value) => (method.outputs = value)}
                      />
                    </div>

                    <div class="flex items-center">
                      <Checkbox
                        checked={method.compress}
                        onInput$={(e) => (method.compress = (e.target as HTMLInputElement).checked)}
                      />
                      <Label class="ml-2">压缩</Label>
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          )}
        </div>
        <div class="space-y-4 border-b pb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold">环境变量管理</h3>
            <Button type="button" variant="outline" onClick$={addEnvironment}>
              <LuPlus class="mr-2 size-4" /> 添加环境变量
            </Button>
          </div>

          <div class="space-y-2">
            {project.environment.map((env, index) => (
              <div key={index} class="flex items-center gap-2">
                <div class="flex-1">
                  <Input
                    value={env.name}
                    onInput$={(e) => (env.name = (e.target as HTMLInputElement).value)}
                    placeholder="变量名称 (例如: NODE_ENV)"
                  />
                </div>
                <div class="flex-1">
                  <Input
                    value={env.description}
                    onInput$={(e) => (env.description = (e.target as HTMLInputElement).value)}
                    placeholder="描述"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="text-destructive"
                  onClick$={() => removeEnvironment(index)}
                >
                  <LuTrash class="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {project.environment.length === 0 && (
            <div class="py-4 text-center text-muted-foreground">尚未添加任何环境变量</div>
          )}
        </div>

        {/* 价格与支付分区 */}
        <div class="space-y-4">
          <h3 class="text-xl font-semibold mb-4">价格配置</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label>年度价格 (USD)</Label>
              <Input
                type="number"
                value={project.pricing.yearly.toString()}
                onInput$={(e) =>
                  (project.pricing.yearly = parseFloat((e.target as HTMLInputElement).value) || 0)
                }
                placeholder="0"
              />
            </div>
            <div class="space-y-2">
              <Label>月度价格 (USD)</Label>
              <Input
                type="number"
                value={project.pricing.monthly.toString()}
                onInput$={(e) =>
                  (project.pricing.monthly = parseFloat((e.target as HTMLInputElement).value) || 0)
                }
                placeholder="0"
              />
            </div>
            <div class="space-y-2">
              <Label>按次价格 (USD)</Label>
              <Input
                type="number"
                value={project.pricing.per_use.toString()}
                onInput$={(e) =>
                  (project.pricing.per_use = parseFloat((e.target as HTMLInputElement).value) || 0)
                }
                placeholder="0"
              />
            </div>
          </div>

          <h3 class="text-xl font-semibold mt-6 mb-4">Cryptomus 支付配置</h3>
          <div class="space-y-4">
            <div class="space-y-2">
              <Label>API Key</Label>
              <Input
                value={project.payment_config.cryptomus.api_key}
                onInput$={(e) =>
                  (project.payment_config.cryptomus.api_key = (e.target as HTMLInputElement).value)
                }
                placeholder="请输入Cryptomus API Key"
              />
            </div>
            <div class="space-y-2">
              <Label>Merchant ID</Label>
              <Input
                value={project.payment_config.cryptomus.merchant_id}
                onInput$={(e) =>
                  (project.payment_config.cryptomus.merchant_id = (
                    e.target as HTMLInputElement
                  ).value)
                }
                placeholder="请输入Cryptomus Merchant ID"
              />
            </div>
          </div>
        </div>
      </form>

      {/* 固定在底部的按钮栏 */}
      <div class="fixed bottom-0 left-0 right-0 border-t bg-background py-4 px-6 flex justify-end space-x-2 z-10 shadow-md">
        <Button variant="outline" type="button" onClick$={() => navigate('/admin/project')}>
          取消
        </Button>
        <Button
          type="submit"
          onClick$={(e) => {
            e.preventDefault();
            document
              .querySelector('form')
              ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          }}
        >
          <LuSave class="mr-2 h-4 w-4" />
          {isEdit.value ? '保存更改' : '创建项目'}
        </Button>
      </div>
    </div>
  );
});

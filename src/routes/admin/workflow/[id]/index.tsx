import type { QRL } from '@builder.io/qwik';
import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Link, useLocation, useNavigate } from '@builder.io/qwik-city';
import {
  setValues,
  useForm,
  valiForm$,
  type SubmitHandler,
} from '@modular-forms/qwik';
import { LuArrowLeft, LuLoader2, LuSave } from '@qwikest/icons/lucide';
import { minLength, object, pipe, string, type InferOutput } from 'valibot';
import { Button, buttonVariants } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { useWorkflow } from '~/stores/workflow';

const Schema = object({
  name: pipe(string(), minLength(1, '工作流名称不能为空')),
  description: string(),
  repo_owner: pipe(string(), minLength(1, '仓库拥有者不能为空')),
  repo_name: pipe(string(), minLength(1, '仓库名称不能为空')),
  workflow_file: pipe(string(), minLength(1, '工作流文件名称不能为空')),
  branch: pipe(string(), minLength(1, '分支名称不能为空')),
  github_token: pipe(string(), minLength(1, 'GitHub Token不能为空')),
});

// 更新类型引用，使用InferOutput而非InferInput
type FormType = InferOutput<typeof Schema>;

export default component$(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = useSignal(false);
  const id = useSignal<number | null>(null);

  const { workflowStore, getWorkflowDetail, createWorkflow, updateWorkflow } =
    useWorkflow();

  // 初始化表单，更新Schema引用
  const [workflowForm, { Form, Field }] = useForm<FormType>({
    loader: {
      value: {
        name: '',
        description: '',
        repo_owner: '',
        repo_name: '',
        workflow_file: '',
        branch: 'main',
        github_token: '',
      },
    },
    validate: valiForm$(Schema),
  });

  // 处理表单提交，使用QRL<SubmitHandler<FormType>>类型
  const handleSubmit: QRL<SubmitHandler<FormType>> = $(async (values) => {
    if (isEdit.value && id.value) {
      await updateWorkflow(id.value, values);
    } else {
      await createWorkflow(values);
    }
    navigate(`/admin/workflow`);
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    track(() => location.params.id);

    const workflowId = location.params.id;
    if (workflowId && workflowId !== 'create') {
      isEdit.value = true;
      id.value = parseInt(workflowId);
      await getWorkflowDetail(id.value);
      if (workflowStore.detail) {
        setValues(workflowForm, workflowStore.detail);
      }
    }
  });

  return (
    <div class="space-y-4 pb-20">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold tracking-tight">
          {isEdit.value ? '编辑工作流' : '创建工作流'}
        </h2>
        <Link
          href="/admin/workflow"
          class={buttonVariants({ variant: 'outline' })}
        >
          <LuArrowLeft class="mr-2 h-4 w-4" />
          返回列表
        </Link>
      </div>

      {workflowStore.loading.detail ? (
        <div class="flex items-center justify-center h-40">
          <LuLoader2 class="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <Form onSubmit$={handleSubmit} class="space-y-6">
          <div class="space-y-6">
            <div class="space-y-2">
              <Label for="name">
                工作流名称<span class="text-destructive">*</span>
              </Label>
              <Field name="name">
                {(field, props) => (
                  <Input
                    {...props}
                    id="name"
                    value={field.value}
                    error={field.error}
                    placeholder="请输入工作流名称"
                    required
                  />
                )}
              </Field>
            </div>

            <div class="space-y-2">
              <Label for="repo_owner">
                仓库拥有者<span class="text-destructive">*</span>
              </Label>
              <Field name="repo_owner">
                {(field, props) => (
                  <Input
                    {...props}
                    id="repo_owner"
                    value={field.value}
                    error={field.error}
                    placeholder="如: github-username"
                    required
                  />
                )}
              </Field>
            </div>

            <div class="space-y-2">
              <Label for="repo_name">
                仓库名称<span class="text-destructive">*</span>
              </Label>
              <Field name="repo_name">
                {(field, props) => (
                  <Input
                    {...props}
                    id="repo_name"
                    value={field.value}
                    error={field.error}
                    placeholder="如: my-project"
                    required
                  />
                )}
              </Field>
            </div>

            <div class="space-y-2">
              <Label for="workflow_file">
                工作流文件名称<span class="text-destructive">*</span>
              </Label>
              <Field name="workflow_file">
                {(field, props) => (
                  <Input
                    {...props}
                    id="workflow_file"
                    value={field.value}
                    error={field.error}
                    placeholder="如: build.yml"
                    required
                  />
                )}
              </Field>
            </div>

            <div class="space-y-2">
              <Label for="branch">
                分支<span class="text-destructive">*</span>
              </Label>
              <Field name="branch">
                {(field, props) => (
                  <Input
                    {...props}
                    id="branch"
                    value={field.value}
                    error={field.error}
                    placeholder="如: main"
                    required
                  />
                )}
              </Field>
            </div>

            <div class="space-y-2">
              <Label for="github_token">
                GitHub Token<span class="text-destructive">*</span>
              </Label>
              <Field name="github_token">
                {(field, props) => (
                  <Input
                    {...props}
                    id="github_token"
                    value={field.value}
                    error={field.error}
                    placeholder="请输入您的 GitHub Token"
                    type="password"
                    required
                  />
                )}
              </Field>
            </div>

            <div class="space-y-2">
              <Label for="description">描述</Label>
              <Field name="description">
                {(field, props) => (
                  <Textarea
                    {...props}
                    id="description"
                    value={field.value}
                    error={field.error}
                    placeholder="请输入工作流描述（可选）"
                    rows={6}
                  />
                )}
              </Field>
            </div>
          </div>
        </Form>
      )}

      {/* 固定在底部的按钮栏 */}
      <div class="fixed bottom-0 left-0 right-0 border-t bg-background py-4 px-6 flex justify-end space-x-2 z-10 shadow-md">
        <Button
          variant="outline"
          type="button"
          onClick$={() => navigate('/admin/workflow')}
        >
          取消
        </Button>
        <Button
          type="submit"
          disabled={workflowForm.submitting}
          loading={workflowForm.submitting}
          onClick$={(e) => {
            e.preventDefault();
            document
              .querySelector('form')
              ?.dispatchEvent(
                new Event('submit', { bubbles: true, cancelable: true }),
              );
          }}
        >
          <LuSave class="mr-2 h-4 w-4" />
          {isEdit.value ? '保存更改' : '创建工作流'}
        </Button>
      </div>
    </div>
  );
});

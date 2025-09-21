import type { QRL } from '@builder.io/qwik';
import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Link, useLocation, useNavigate } from '@builder.io/qwik-city';
import { setValues, useForm, valiForm$, type SubmitHandler } from '@modular-forms/qwik';
import { LuArrowLeft, LuLoader2, LuSave } from '@qwikest/icons/lucide';
import { minLength, number, object, pipe, string, type InferOutput } from 'valibot';
import { Button, buttonVariants } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select } from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import { useProject } from '~/stores/project';
import { useSecret } from '~/stores/secret';

const Schema = object({
  name: pipe(string(), minLength(1, '密钥名称不能为空')),
  description: pipe(string()),
  project_id: pipe(number()),
  value: pipe(string()),
  max_calls: pipe(number()),
  expires_at: pipe(string()),
});

type FormType = InferOutput<typeof Schema>;

export default component$(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = useSignal(false);
  const id = useSignal<number | null>(null);

  const { secretStore, getSecretDetail, createSecret, updateSecret } = useSecret();

  // 获取项目列表
  const { projectStore, getProjects } = useProject();

  // 初始化表单
  const [secretForm, { Form, Field }] = useForm<FormType>({
    loader: {
      value: {
        name: '',
        description: '',
        project_id: 0,
        value: '',
        max_calls: 0,
        expires_at: '',
      },
    },
    validate: valiForm$(Schema),
  });

  // 处理表单提交
  const handleSubmit: QRL<SubmitHandler<FormType>> = $(async (values) => {
    if (isEdit.value && id.value) {
      await updateSecret(id.value, values);
    } else {
      await createSecret(values);
    }
    navigate(`/admin/secret`);
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    // 加载项目列表
    await getProjects();

    // 加载密钥详情
    track(() => location.params.id);

    const secretId = location.params.id;
    if (secretId && secretId !== 'create') {
      isEdit.value = true;
      id.value = parseInt(secretId);
      await getSecretDetail(id.value);
      if (secretStore.detail) {
        setValues(secretForm, secretStore.detail);
      }
    }
  });

  // 构造项目选项列表
  const projectOptions = projectStore.list.map((project) => ({
    label: project.name || `项目 ${project.id}`,
    value: project.id?.toString() || '',
  }));

  return (
    <div class="space-y-4 pb-20">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold tracking-tight">{isEdit.value ? '编辑密钥' : '创建密钥'}</h2>
        <Link href="/admin/secret" class={buttonVariants({ variant: 'outline' })}>
          <LuArrowLeft class="mr-2 h-4 w-4" />
          返回列表
        </Link>
      </div>

      {secretStore.loading.detail ? (
        <div class="flex items-center justify-center h-40">
          <LuLoader2 class="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <Form onSubmit$={handleSubmit} class="space-y-6">
          <div class="space-y-6">
            <div class="space-y-2">
              <Label for="name">
                密钥名称<span class="text-destructive">*</span>
              </Label>
              <Field name="name">
                {(field, props) => (
                  <Input
                    {...props}
                    id="name"
                    value={field.value}
                    error={field.error}
                    placeholder="请输入密钥名称"
                    required
                  />
                )}
              </Field>
            </div>

            <div class="space-y-2">
              <Label for="project_id">
                项目<span class="text-destructive">*</span>
              </Label>
              <Field name="project_id" type="number">
                {(field) => (
                  <Select.Root
                    value={field.value?.toString() || ''}
                    onChange$={$((value: string | string[]) => {
                      field.value = Number(value) || 0;
                    })}
                  >
                    <Select.Trigger aria-invalid={!!field.error}>
                      <Select.DisplayValue placeholder="请选择项目" />
                    </Select.Trigger>
                    <Select.Popover>
                      {projectOptions.map((opt) => (
                        <Select.Item key={opt.value} value={opt.value}>
                          <Select.ItemLabel>{opt.label}</Select.ItemLabel>
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Popover>
                  </Select.Root>
                )}
              </Field>
            </div>

            <div class="space-y-2">
              <Label for="value">密钥值</Label>
              <Field name="value">
                {(field, props) => (
                  <Input
                    {...props}
                    id="value"
                    value={field.value || ''}
                    error={field.error}
                    placeholder="请输入密钥值（可选）"
                  />
                )}
              </Field>
              {isEdit.value && (
                <p class="text-sm text-muted-foreground">留空表示不更改现有密钥值</p>
              )}
            </div>

            <div class="space-y-2">
              <Label for="max_calls">最大调用次数</Label>
              <Field name="max_calls" type="number">
                {(field, props) => (
                  <Input
                    {...props}
                    id="max_calls"
                    type="number"
                    value={field.value?.toString() || ''}
                    error={field.error}
                    placeholder="留空表示无限制"
                  />
                )}
              </Field>
            </div>

            <div class="space-y-2">
              <Label for="expires_at">过期时间</Label>
              <Field name="expires_at">
                {(field, props) => (
                  <Input
                    {...props}
                    id="expires_at"
                    type="datetime-local"
                    value={field.value || ''}
                    error={field.error}
                    placeholder="留空表示永不过期"
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
                    placeholder="请输入密钥描述（可选）"
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
        <Button variant="outline" type="button" onClick$={() => navigate('/admin/secret')}>
          取消
        </Button>
        <Button
          type="submit"
          disabled={secretForm.submitting}
          loading={secretForm.submitting}
          onClick$={(e) => {
            e.preventDefault();
            document
              .querySelector('form')
              ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          }}
        >
          <LuSave class="mr-2 h-4 w-4" />
          {isEdit.value ? '保存更改' : '创建密钥'}
        </Button>
      </div>
    </div>
  );
});

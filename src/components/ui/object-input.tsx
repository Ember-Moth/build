import type { QRL } from '@builder.io/qwik';
import { $, component$, useStore, useTask$ } from '@builder.io/qwik';
import { ArrayInput } from './array-input';
import { Checkbox } from './checkbox';
import { Input } from './input';
import { Select } from './select';
import { Textarea } from './textarea';

export type FieldSchema = {
  placeholder?: string;
  label?: string;
  type?: string;
  component?: 'input' | 'textarea' | 'select' | 'array' | 'object' | 'checkbox'; // 增加 checkbox
  options?: { value: string; label: string }[];
  multiple?: boolean;
};

export type ObjectInputProps = {
  id?: string;
  value: Record<string, any>;
  error?: Partial<Record<string, string>>;
  onChange$: QRL<(value: Record<string, any>) => void>;
  schema?: Partial<Record<string, FieldSchema>>;
};

export const ObjectInput = component$((props: ObjectInputProps) => {
  const state = useStore({ ...props.value });

  useTask$(({ track }) => {
    track(() => props.value);
    Object.assign(state, props.value);
  });

  const updateField = $((key: string, newVal: any) => {
    state[key] = newVal;
    props.onChange$({ ...state });
  });

  const renderField = (key: string) => {
    const fieldSchema: FieldSchema = props.schema?.[key] || {};
    const comp =
      fieldSchema.component || (Array.isArray(state[key]) ? 'array' : 'input');
    const placeholder = fieldSchema.placeholder || `请输入 ${key}`;
    switch (comp) {
      case 'array':
        return (
          <ArrayInput
            value={state[key]}
            placeholder={placeholder}
            onChange$={
              ((newValues: string[]) => updateField(key, newValues)) as any
            }
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={state[key]}
            placeholder={placeholder}
            onInput$={(_, el) => updateField(key, el.value)}
          />
        );
      case 'select':
        if (fieldSchema.options) {
          return (
            <Select.Root
              multiple={fieldSchema.multiple || false}
              value={state[key]}
              onChange$={
                ((value: string | string[]) => updateField(key, value)) as any
              }
            >
              <Select.Trigger>
                <Select.DisplayValue placeholder={placeholder} />
              </Select.Trigger>
              <Select.Popover>
                {fieldSchema.options.map((opt) => (
                  <Select.Item key={opt.value} value={opt.value}>
                    <Select.ItemLabel>{opt.label}</Select.ItemLabel>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Popover>
            </Select.Root>
          );
        }
        return (
          <Input
            value={state[key]}
            placeholder={placeholder}
            type={fieldSchema.type || 'text'}
            onInput$={(_, el) => updateField(key, el.value)}
          />
        );
      case 'object':
        return (
          <ObjectInput
            value={state[key]}
            schema={props.schema ? { [key]: props.schema[key] } : undefined}
            onChange$={(updated: Record<string, any>) =>
              updateField(key, updated)
            }
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            checked={state[key]}
            onInput$={(_, el) => updateField(key, el.checked)}
          />
        );
      default:
        return (
          <Input
            value={state[key]}
            placeholder={placeholder}
            type={fieldSchema.type || 'text'}
            onInput$={(_, el) => updateField(key, el.value)}
          />
        );
    }
  };

  return (
    <div class="flex flex-col gap-2">
      {Object.keys(state).map((key) => (
        <div key={key} class="flex flex-col">
          {props.schema?.[key]?.label && (
            <label>{props.schema[key]?.label}</label>
          )}
          {renderField(key)}
          {props.error && props.error[key] && (
            <span class="text-sm text-destructive">{props.error[key]}</span>
          )}
        </div>
      ))}
    </div>
  );
});

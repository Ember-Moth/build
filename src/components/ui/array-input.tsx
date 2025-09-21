import type { QRL } from '@builder.io/qwik';
import { component$, useStore, useTask$ } from '@builder.io/qwik';
import { LuPlus, LuTrash } from '@qwikest/icons/lucide';
import { Button } from './button';
import { Input } from './input';

export type ArrayInputProps = {
  id?: string;
  value?: string[];
  error?: string[];
  placeholder?: string;
  onChange$: QRL<(value: string[]) => void>;
};

export const ArrayInput = component$<ArrayInputProps>((props) => {
  const state = useStore({
    items: props.value || [],
  });

  useTask$(({ track }) => {
    track(() => props.value);
    state.items = props.value || [];
  });

  return (
    <div class="flex flex-col gap-2">
      {state.items.map((item, index) => (
        <div key={index} class="flex items-center gap-2">
          <Input
            value={item}
            placeholder={props.placeholder || 'Please enter a value'}
            onInput$={(_, el) => {
              state.items[index] = el.value;
              props.onChange$(state.items);
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            class="text-destructive"
            onClick$={() => {
              state.items.splice(index, 1);
              props.onChange$(state.items);
            }}
          >
            <LuTrash />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick$={() => {
          state.items.push('');
          props.onChange$(state.items);
        }}
      >
        <LuPlus class="mr-2 size-4" />
        添加
      </Button>
      {props.error && props.error.length > 0 && (
        <div class="text-sm text-destructive">{props.error.join(', ')}</div>
      )}
    </div>
  );
});

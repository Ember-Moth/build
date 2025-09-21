import { $, component$, type PropsOf } from '@builder.io/qwik';
import { cn } from '@qwik-ui/utils';

export const Checkbox = component$<Partial<PropsOf<'input'> & { type?: 'checkbox' }>>(
  ({ id, name, ['bind:checked']: checkedSig, checked, onInput$, ...props }) => {
    const inputId = id || name;
    return (
      <input
        {...props}
        type="checkbox"
        checked={checkedSig ? checkedSig.value : checked}
        onInput$={checkedSig ? $((_, el) => (checkedSig.value = el.checked)) : onInput$}
        data-checked={checked || checkedSig?.value || ''}
        class={cn(
          'peer border-primary text-primary accent-primary ring-offset-background focus:ring-ring focus-visible:ring-ring h-4 w-4 shrink-0 disabled:cursor-not-allowed disabled:opacity-50',
          props.class,
        )}
        id={inputId}
        name={name}
      />
    );
  },
);

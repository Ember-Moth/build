import type { PropsOf } from '@builder.io/qwik';
// Remove useSignal, useVisibleTask$
import { component$, Slot } from '@builder.io/qwik';
import { cn } from '@qwik-ui/utils';

// Add error prop
export type InputProps = PropsOf<'input'> & { error?: string };

export const Input = component$<InputProps>(
  // Add error to destructuring
  ({ class: className, type, error, ...props }) => {
    // Remove signals, refs, and useVisibleTask$ hook
    const inputId = props.id || props.name; // Use id or name for associating error

    return (
      // Wrap with a fragment or div to include error message
      <>
        <div
          class={cn(
            'flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 text-base shadow-sm transition-colors focus-within:outline-none focus-within:ring-1 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            // Add error styling if needed
            error && 'border-destructive focus-within:ring-destructive',
            props.disabled && 'cursor-not-allowed opacity-50',
            className,
          )}
        >
          <span class="flex shrink-0 items-center pr-2 text-muted-foreground">
            <Slot name="prefix" />
          </span>
          <input
            type={type}
            class={cn(
              'h-full flex-1 bg-transparent py-1 outline-none placeholder:text-muted-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:cursor-not-allowed',
            )}
            // Add aria-describedby for accessibility
            aria-describedby={error ? `${inputId}-error` : undefined}
            aria-invalid={!!error}
            {...props}
          />
          <span class="flex shrink-0 items-center pl-2 text-muted-foreground">
            <Slot name="suffix" />
          </span>
        </div>
        {/* Display error message */}
        {error && (
          <p id={`${inputId}-error`} class="text-sm text-destructive mt-1">
            {error}
          </p>
        )}
      </>
    );
  },
);

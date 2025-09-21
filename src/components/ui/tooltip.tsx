import type { PropsOf } from '@builder.io/qwik';
import { component$, Slot } from '@builder.io/qwik';
import { Tooltip as HeadlessTooltip } from '@qwik-ui/headless';
import { cn } from '@qwik-ui/utils';

const Root = HeadlessTooltip.Root;
const Trigger = HeadlessTooltip.Trigger;

const Content = component$<PropsOf<typeof HeadlessTooltip.Panel>>(
  ({ class: className, ...props }) => {
    return (
      <HeadlessTooltip.Panel
        {...props}
        class={cn(
          'z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md',
          'animate-in fade-in-0 zoom-in-95',
          'data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95',
          'data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2',
          className,
        )}
      >
        <Slot />
      </HeadlessTooltip.Panel>
    );
  },
);

const Arrow = component$<PropsOf<typeof HeadlessTooltip.Arrow>>(
  ({ class: className, ...props }) => {
    return (
      <HeadlessTooltip.Arrow
        {...props}
        width={10}
        height={5}
        class={cn('fill-primary', className)}
      />
    );
  },
);

export const Tooltip = {
  Root,
  Trigger,
  Content,
  Arrow,
};

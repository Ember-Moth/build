import { Slot, component$, type PropsOf } from '@builder.io/qwik';
import { Modal as HeadlessModal } from '@qwik-ui/headless';
import { cn } from '@qwik-ui/utils';
import { LuX } from '@qwikest/icons/lucide';
import { cva } from 'class-variance-authority';

const Root = HeadlessModal.Root;

const Trigger = HeadlessModal.Trigger;

const Close = HeadlessModal.Close;

export const panelVariants = cva([
  'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',
  'data-[open]:animate-in data-[closing]:animate-out data-[closing]:fade-out-0 data-[open]:fade-in-0 data-[closing]:zoom-out-95 data-[open]:zoom-in-95 data-[closing]:slide-out-to-left-1/2 data-[closing]:slide-out-to-top-[48%] data-[open]:slide-in-from-left-1/2 data-[open]:slide-in-from-top-[48%]',
  'backdrop:z-50 backdrop:fixed backdrop:inset-0 backdrop:bg-black/80 backdrop:data-[open]:animate-in backdrop:data-[closing]:animate-out backdrop:data-[closing]:fade-out-0 backdrop:data-[open]:fade-in-0',
]);

type PanelProps = PropsOf<typeof HeadlessModal.Panel>;

const Panel = component$<PanelProps>(({ ...props }) => {
  return (
    <HeadlessModal.Panel {...props} class={cn(panelVariants(), props.class)}>
      <Slot />
      <HeadlessModal.Close
        class={cn(
          'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[open]:bg-accent data-[open]:text-muted-foreground',
        )}
      >
        <LuX class="h-4 w-4" />
        <span class="sr-only">Close</span>
      </HeadlessModal.Close>
    </HeadlessModal.Panel>
  );
});

const Title = component$<PropsOf<'h2'>>(({ ...props }) => {
  return (
    <HeadlessModal.Title
      {...props}
      class={cn('text-lg font-semibold leading-none tracking-tight', props.class)}
    >
      <Slot />
    </HeadlessModal.Title>
  );
});

const Description = component$<PropsOf<'p'>>(({ ...props }) => {
  return (
    <HeadlessModal.Description {...props} class={cn('text-sm text-muted-foreground', props.class)}>
      <Slot />
    </HeadlessModal.Description>
  );
});

export const Modal = {
  Root,
  Trigger,
  Close,
  Panel,
  Title,
  Description,
};

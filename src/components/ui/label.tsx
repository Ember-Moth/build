import { component$, Slot, type PropsOf } from '@builder.io/qwik';
import { Label as HeadlessLabel } from '@qwik-ui/headless';
import { cn } from '@qwik-ui/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
);

type LabelProps = PropsOf<'label'> & VariantProps<typeof labelVariants>;

export const Label = component$<LabelProps>((props) => {
  const { class: className, ...rest } = props;

  return (
    <HeadlessLabel {...rest} class={cn(labelVariants(), className)}>
      <Slot />
    </HeadlessLabel>
  );
});

import { Slot, component$, type PropsOf } from '@builder.io/qwik';
import { cn } from '@qwik-ui/utils';

const Root = component$<PropsOf<'table'>>((props) => {
  return (
    <div class="relative w-full overflow-auto">
      <table {...props} class={cn('w-full caption-bottom text-sm', props.class)}>
        <Slot />
      </table>
    </div>
  );
});

const Header = component$<PropsOf<'thead'>>((props) => {
  return (
    <thead {...props} class={cn('[&_tr]:border-b', props.class)}>
      <Slot />
    </thead>
  );
});

const Body = component$<PropsOf<'tbody'>>((props) => {
  return (
    <tbody {...props} class={cn('[&_tr:last-child]:border-0', props.class)}>
      <Slot />
    </tbody>
  );
});

const Footer = component$<PropsOf<'tfoot'>>((props) => {
  return (
    <tfoot
      {...props}
      class={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', props.class)}
    >
      <Slot />
    </tfoot>
  );
});

const Row = component$<PropsOf<'tr'>>((props) => {
  return (
    <tr
      {...props}
      class={cn(
        'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        props.class,
      )}
    >
      <Slot />
    </tr>
  );
});

const Head = component$<PropsOf<'th'>>((props) => {
  return (
    <th
      {...props}
      class={cn(
        'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
        props.class,
      )}
    >
      <Slot />
    </th>
  );
});

const Cell = component$<PropsOf<'td'>>((props) => {
  return (
    <td {...props} class={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', props.class)}>
      <Slot />
    </td>
  );
});

const Caption = component$<PropsOf<'caption'>>((props) => {
  return (
    <caption {...props} class={cn('mt-4 text-sm text-muted-foreground', props.class)}>
      <Slot />
    </caption>
  );
});

export const Table = {
  Root,
  Header,
  Body,
  Footer,
  Row,
  Head,
  Cell,
  Caption,
};

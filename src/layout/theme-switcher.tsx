import { $, component$, useVisibleTask$ } from '@builder.io/qwik';
import { LuMonitor, LuMoon, LuSun } from '@qwikest/icons/lucide';
import { Dropdown, buttonVariants } from '~/components/ui';
import { useThemeStore } from '~/stores/theme';
import { themeManager, type Theme } from '~/utils/theme';

export const ThemeSwitcher = component$(() => {
  const { store, setTheme } = useThemeStore();

  const options = {
    system: {
      label: '系统',
      icon: LuMonitor,
    },
    light: {
      label: '明亮',
      icon: LuSun,
    },
    dark: {
      label: '暗黑',
      icon: LuMoon,
    },
  };

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    setTimeout(() => {
      const theme = themeManager.getTheme();
      setTheme(theme);
    }, 0);
  });

  const currentOption = options[store.theme];
  return (
    <Dropdown.Root>
      <Dropdown.Trigger
        aria-label="Theme Switcher"
        class={buttonVariants({
          variant: 'ghost',
          size: 'icon',
        })}
      >
        <currentOption.icon class="text-lg" />
      </Dropdown.Trigger>
      <Dropdown.Popover
        gutter={8}
        class=" bg-popover text-popover-foreground animate-in fade-in-80 zoom-in-90 !border-border w-44 rounded-md !border p-1.5 shadow-md"
        floating="bottom-end"
      >
        <div class="space-y-1 p-1.5">
          {Object.entries(options).map(([key, option]) => (
            <Dropdown.Item
              key={key}
              class={`flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm transition-colors select-none ${
                store.theme === key
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
              onClick$={$(() => setTheme(key as Theme))}
            >
              <option.icon class="size-5" />
              <span>{option.label}</span>
            </Dropdown.Item>
          ))}
        </div>
      </Dropdown.Popover>
    </Dropdown.Root>
  );
});

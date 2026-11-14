import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-vitest', '@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: '@storybook/react-vite',
  features: { sidebarOnboardingChecklist: false, menuOnboardingChecklist: false } as StorybookConfig['features'],
  core: { disableTelemetry: true, disableWhatsNewNotifications: true },
};
export default config;

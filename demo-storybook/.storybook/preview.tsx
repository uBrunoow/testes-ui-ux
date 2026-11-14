import type { Preview } from '@storybook/react-vite';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'error': uma violação de acessibilidade reprova o teste
      test: 'error',
    },
  },
};

export default preview;

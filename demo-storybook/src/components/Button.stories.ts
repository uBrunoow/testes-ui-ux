import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Componentes/Button',
  component: Button,
  args: { label: 'Enviar' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primario: Story = { name: 'Primário' };

export const Desabilitado: Story = { args: { disabled: true } };

export const Carregando: Story = { args: { loading: true } };

export const Enviar: Story = {
  args: { label: 'Enviar' },
  play: async ({ canvas, userEvent }) => {
    const botao = canvas.getByRole('button');
    await userEvent.click(botao);
    await expect(canvas.getByText('Enviado!')).toBeVisible();
  },
};

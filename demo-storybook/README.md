# Demo Storybook (slide 14)

Projeto usado na demo ao vivo e na gravação do vídeo do slide "Roteiro da demo".

- `src/components/Button.tsx` e `button.css`: o componente.
- `src/components/Button.stories.ts`: stories Primário, Desabilitado, Carregando e Enviar (com `play()`).
- `.storybook/preview.tsx`: addon a11y com `test: 'error'` (violação reprova o teste).
- `.storybook/vitest.setup.ts`: teste visual, cada story é comparada com a captura em `__screenshots__/` via `toMatchScreenshot()`.

## Rodar

```bash
npm install
npm run storybook          # localhost:6006
npx vitest run --project=storybook      # interação + a11y + visual
npx vitest run --project=storybook -u   # aceita mudanças visuais (atualiza as referências)
```

Sem os navegadores do Playwright instalados, aponte para um Chromium com `PW_CHROMIUM=/caminho/do/chrome`.

## Regravar o vídeo

Com o Storybook rodando:

```bash
node scripts/gravar-demo.cjs ../gravacao
cd ../gravacao && ffmpeg -f concat -safe 0 -i frames.txt -vf "fps=30,format=yuv420p" -c:v libx264 -crf 16 raw.mp4
```

Depois copie `raw.mp4` para `../video/public/storybook-real.mp4` e `eventos.json` para `../video/src/`,
e rode `npm run render` em `../video`.

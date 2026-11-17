# Vídeo de demonstração

Os dois decks têm um slide "Roteiro da demo" com um vídeo gravado como plano B. Há dois caminhos
já usados; escolha pelo que o vídeo precisa mostrar.

## Sumário
- Caminho A: gravação real + Remotion (deck de testes)
- Caminho B: vídeo composto em HyperFrames (deck do adapter)
- Embutir no slide

## Caminho A: gravação real da tela + Remotion

Use quando a demo é uma ferramenta rodando (Storybook, app, terminal) e o valor está em mostrar que
é de verdade. Resultado no deck de testes: `demo-storybook/` (projeto), `video/` (Remotion),
`videos/demo-storybook.mp4`.

1. **Monte o projeto da demo** numa pasta própria (ex.: `demo-storybook/`) com o mesmo código que aparece nos slides. Verifique cada passo do roteiro no terminal antes de gravar (o teste passa, a falha proposital falha com a mensagem certa).
2. **Grave com Playwright**, roteirizando cliques e edições: viewport 1280×720 com `deviceScaleFactor: 1.5`, screencast do CDP (`Page.startScreencast`, JPEG qualidade ~92) salvando cada quadro com seu timestamp, e um cursor desenhado na página (o headless não mostra o ponteiro) com um anel no clique. Edite arquivos do projeto durante a gravação para disparar o recarregamento a quente e marque o instante de cada evento num `eventos.json`. Restaure os arquivos no `finally`.
   O script usado está em `demo-storybook/scripts/gravar-demo.cjs` no repositório do deck de testes; adapte os seletores e a sequência.
3. **Monte o MP4 bruto** respeitando os tempos reais:
   `ffmpeg -f concat -safe 0 -i frames.txt -vf "fps=30,format=yuv420p" -c:v libx264 -crf 16 raw.mp4`
4. **Componha no Remotion** (`video/`): a gravação dentro de uma janela no visual do deck, com cabeçalho dos passos (01–04), legendas curtas em pílula escura, o trecho de código editado aparecendo no instante da edição e, se houver, imagens geradas pela própria ferramenta (ex.: o diff do `toMatchScreenshot`). Sincronize tudo a partir do `eventos.json`. `OffthreadVideo` com `playbackRate` 1,2–1,25 enxuga a gravação sem parecer acelerada.
   Renderize com `npx remotion render … --codec=h264 --crf=20`. No ambiente sem o navegador do Remotion, aponte `Config.setBrowserExecutable` para um Chrome headless existente.
5. Duração alvo: 60 a 80 s. Abertura de 2 s com o título, fechamento de 4 s com o resumo.

## Caminho B: vídeo composto em HyperFrames

Use quando a demo é mostrar código e saídas de comando (não uma interface), sem narração. No deck do
adapter: `videos/adapter-code-demo/` com `BRIEF.md` (mensagem, público, 1920×1080, 60 s, sem
narração nem legenda), quadros em `compositions/frames/*.html` (um editor estilo VS Code claro e um
terminal) e as saídas reais capturadas em `capture/run/*.txt`. O projeto usa a CLI `hyperframes`
(`npm run dev`, `check`, `render`) e as skills da HyperFrames (comece por `/hyperframes`; o fluxo
usado foi `/faceless-explainer`). Siga a identidade do deck (cores, fontes, painéis de código), não
um preset.

## Embutir no slide

1. Coloque o MP4 em `videos/` ao lado do `index.html` e gere a capa (`ffmpeg -ss 2 -i … -frames:v 1 -vf scale=1280:-2 …-poster.jpg`).
2. Use a peça `.vid` (veja `componentes.md`): miniatura 16:9 no slide, botão para ampliar ao slide inteiro, Esc reduz, pausa ao sair. Num slide de roteiro, a miniatura fica na coluna da direita e o cartão de número vai para baixo dela.
3. Atualize `data-notes` do slide com a duração e como usar o plano B.
4. Mantenha o arquivo abaixo de ~10 MB (CRF 20–24) para a Vercel servir rápido.
5. Se for escrever o roteiro de fala, inclua a tabela de tempos do vídeo (minuto:segundo → o que dizer).

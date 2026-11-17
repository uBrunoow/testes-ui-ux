# Componentes e arquétipos

Trechos prontos para colar. Todos existem no `assets/template.html`, que também mostra cada
arquétipo montado (slides 1 a 10). Ícones: `<svg class="ic" aria-hidden="true"><use href="#i-nome"/></svg>`
com os símbolos do bloco de ícones do template (acrescente novos no mesmo estilo: traço 1.8, viewBox 24).

## Sumário
- Grade de posicionamento
- Arquétipos de slide (capa, divisor, conceito, comparação, tabela, código com passos, roteiro de demo, frase, referências, encerramento)
- Peças (cartões, poços de ícone, pílulas, tags, ✓, trilha, fios, cursor, botão, vídeo)
- Composições livres

## Grade de posicionamento

- `.hd`: bloco do título no topo (`left:120px; top:140px; width:1680px`). Dentro: `.kick` (pergunta ou sobretítulo curto, na cor de destaque), `h1.title`, `.lead`.
- `.bd`: área de conteúdo (`left/right:120px; top:330px; bottom:150px`). Ajuste `top` inline quando o título ocupar uma linha só (`style="top:300px"`).
- Dentro de `.bd`: `.g2` (2 colunas), `.g3` (3 colunas), `.split` (texto à esquerda, apoio à direita; ajuste `grid-template-columns` inline), `.stack` (coluna com espaçamento).
- Composição livre: qualquer peça com `position:absolute` e coordenadas no canvas, no CSS do slide (`#s5 .diagrama{left:...;top:...}`). Os decks originais fazem isso em quase todo slide de diagrama.

## Arquétipos de slide

### Capa (`.slide.lt.capa`)
Título grande em duas linhas curtas (a segunda linha leva o gradiente no tema vidro), uma frase, um
botão para pular à demo e os nomes. À direita, `.stage` com o motivo visual do deck em ação: no deck
de testes, um formulário que o cursor preenche e envia; no adapter, arquivos que se plugam num
adaptador. Uma lista "Nesta apresentação" (como no template) é o substituto simples.

```html
<section class="slide lt capa" id="s1" data-sec="Abertura" data-who="Ana" data-title="Título" data-notes="...">
  <h1 class="giant" data-split="Testes de|UI e UX"></h1>
  <p class="sub a" style="--i:2">Uma frase sobre o que a plateia vai levar.</p>
  <div class="acts a" style="--i:4"><a class="btn" href="#12" data-goto="12">Ir para a demo <span><svg class="ic"><use href="#i-arrow"/></svg></span></a><span class="by">Ana, Bruno e Caio</span></div>
  <div class="stage card a fr" style="--i:3;padding:40px 44px">…</div>
</section>
```

### Divisor de parte (`.slide.dk.div`)
Número gigante vazado, barra de progresso das partes, título, subtítulo e quem apresenta. Use um por
parte quando houver mais de um apresentador; com `data-cable` para a fita atravessar.

```html
<section class="slide dk div" id="s8" data-sec="Parte 02" data-who="Pedro" data-title="Ferramentas" data-cable="M-140 300 C 400 260, 700 560, 1000 760 S 1700 1100, 2080 900" data-notes="Transição.">
  <span class="num a fd" aria-hidden="true">02</span>
  <p class="part a"><span class="bar"><i class="on"></i><i class="on"></i><i></i><i></i></span>Parte 02 de 04</p>
  <h1 data-split="Classificação e|ferramentas"></h1>
  <p class="sub a" style="--i:3">O que esta parte cobre</p>
  <p class="who a" style="--i:5"><b>P</b>Pedro <small>apresenta</small></p>
</section>
```

### Conceito (título à esquerda, três cartões à direita)
Veja o slide 3 do template: `.split` com `.kick`, `h1.title`, `.lead` e uma `.stack` de `.it.card`.

### Comparação (`.duo`)
Dois painéis de gradiente (`.duo.p` e `.duo.s`) com rótulo, uma pergunta grande e uma frase no pé.
Bom para "X versus Y" e "antes e depois".

### Tabela (`.tbl`)
Cabeçalho `.tr.th` com `.dot.p` / `.dot.s` e linhas `.tr.card` com `.k` (rótulo) e `.v` (valores).
Até 5 linhas; frases curtas nas células.

### Código com passos
`.code` com barra (`.bar`, `.fi`, nome do arquivo, `.sig` com status), `.hl` por passo e um `<pre data-lang>`.
Ao lado, `.steps` com `data-step` correspondentes. No máximo ~12 linhas de código a 28px
(`.code.sm` cabe ~16 linhas a 23px). Mostre o código real do projeto, recortado no essencial.

```html
<div class="code a fl" style="--i:1">
  <div class="bar"><span class="fi"><svg class="ic"><use href="#i-code"/></svg></span>Button.stories.ts<span class="sig"><span class="dot"></span>Vitest</span></div>
  <span class="hl st" data-step="1" style="--l:4"></span>
  <span class="hl st" data-step="2" style="--l:6;--c:2"></span>
<pre data-lang="ts">…</pre>
</div>
<ol class="steps"><li data-step="1"><b>1</b>Renderiza a story</li>…</ol>
```

Variante escura: `.code.dark`. Painéis lado a lado (arquivo + terminal), como no adapter, são duas `.code` numa `.g2`.

### Trilha de passos (`.track`)
Para uma sequência de slides ("Passo 2 de 5"): `<div class="track a" data-now="2" data-total="5" data-label="Passo 2 de 5"></div>` acima do título. `data-now` aceita vários (`"1 2"`).

### Roteiro de demo (`.term`)
Terminal escuro com a lista de passos da demo; cada avanço marca um ✓. Ao lado, um número com fonte
(`.hot-card` com `.big-n`) ou o vídeo de plano B (`.vid`).

### Frase de impacto (`.slide.dk.frase`)
Duas linhas; a segunda leva o gradiente. Uma linha de apoio opcional. Com `data-cable`.

### Referências (`.refs`)
Lista em duas colunas de `.card` com poço de ícone, `<small>` com o tipo (Livro, Artigo, Documentação, Norma) e a referência no formato ABNT, título em `<b>`.

### Encerramento (`.slide.lt.fim`)
"Obrigado!", "Perguntas?" gigante, a ideia em uma frase, os nomes em pílulas e, à direita, 2 ou 3
cartões-resumo com ✓ carimbado (`.chk.stamp` com `--t`).

## Peças

- `.card`: cartão (vidro no tema vidro, sólido no cabo). `.hot-card`: gradiente. `.ink-card`: escuro.
- `.it` (+ `.sm`): item com poço de ícone, `h2` e `p`. Coloque `.card` junto para virar cartão.
- `.well` (`.sm`, `.hot`, `.cool`, `.ok`, `.no`): poço redondo de ícone.
- `.pill`: pílula (posicione você). `.dot` (`.p`, `.s`): ponto de cor. `.tag` (`.s`): etiqueta.
- `.chk` (`.sm`, `.no`): ✓ verde (ou ✗ vermelho) com `<svg viewBox="0 0 24 24"><path d="M6 12.5l4 4L18 8"/></svg>`.
- `.wires` + `.w` (`.p`, `.s`, `.d` tracejado) + `class="draw"`: fios ligando peças num diagrama (SVG 1920×1080 com `pathLength="1"`).
- `.cursor`: cursor do "usuário" para animações de clique (svg com `path.c-body`); anime com keyframes no CSS do slide.
- `.btn`: botão pílula escuro com círculo de seta. `data-goto="N"` faz pular para o slide N.
- `.big-n`: número grande (168px).

### Vídeo (`.vid`)
Miniatura no slide que amplia para o slide inteiro (botão no canto ou duplo clique), Esc reduz, pausa ao sair do slide. As setas continuam controlando a apresentação.

```html
<figure class="vid a fr" style="--i:3;left:1200px;top:300px;width:600px;height:338px">
  <video src="videos/demo.mp4" poster="videos/demo-poster.jpg" preload="metadata" playsinline controls aria-label="Vídeo da demo"></video>
  <span class="vtag"><svg class="ic" aria-hidden="true"><use href="#i-video"/></svg>Plano B: demo gravada</span>
  <button class="vbig" type="button" aria-label="Ampliar vídeo"><svg class="grow" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg><svg class="shrink" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4l-6 6M14 5v5h5M4 20l6-6M10 19v-5H5"/></svg></button>
</figure>
```

Mantenha 16:9 (600×338, 960×540…). Gere a capa com `ffmpeg -ss 2 -i demo.mp4 -frames:v 1 -vf scale=1280:-2 demo-poster.jpg`.

## Composições livres

Os slides mais memoráveis dos dois decks são diagramas montados à mão no canvas: caixa-preta com
entrada e saída ligadas por fios, linha do tempo com nós UI/UX, arquivos plugando num adaptador,
um formulário que o cursor envia. O caminho:

1. Desenhe a ideia em coordenadas do canvas (peças com `position:absolute` no CSS do slide).
2. Ligue com `.wires` (SVG absoluto 1920×1080) e caminhos com cantos arredondados (`Q`) ou curvas (`C`).
3. Anime na ordem da explicação (`--i` ou `.at` + `--t`) ou por passos (`data-step`), não tudo de uma vez.
4. Rode `scripts/capturas.cjs` e ajuste até nada encostar.

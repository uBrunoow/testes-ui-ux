# Motor do deck

O script no fim de `assets/template.html` transforma uma lista de `<section class="slide">` numa
apresentação. Você não precisa mexer nele para fazer um deck; este arquivo explica o que ele lê e
o que oferece.

## Sumário
- Configuração global (`<html>`, `<body>`, logo)
- Atributos de cada slide
- Entradas animadas e passos
- Peças montadas pelo motor
- Navegação, teclas e URL
- Modo PDF
- API e eventos

## Configuração global

| Onde | Atributo | Efeito |
|---|---|---|
| `<html>` | `data-tema="vidro"` / `"cabo"` / nome próprio | escolhe o bloco de tokens |
| `<body>` | `data-marca` | texto do cabeçalho, ao lado do logo |
| `<body>` | `data-ano` | canto direito do cabeçalho |
| `<body>` | `data-rodape` | coluna do meio do rodapé (disciplina, evento) |
| `<body>` | `data-rodape2` | terceira coluna quando o slide não tem `data-who` (ex.: "Padrão estrutural · GoF") |
| `<body>` | `data-parede="fluxo"` | serpentina 4 colunas; conectores com nós; um cursor percorre o conector ao avançar |
| `<body>` | `data-parede="cabo"` | grade 4 colunas; um cabo da cor `--p` liga os slides com plugues |
| `<body>` | `data-orbes="auto"` | orbes de cor nos slides claros (atrás do vidro); `"off"` desliga |
| `<template id="logo">` | SVG | logo do cabeçalho; use `currentColor` para seguir claro/escuro |

## Atributos de cada slide

```html
<section class="slide lt" id="s4" data-sec="Definição" data-who="Ruan"
  data-title="Dois testes, duas perguntas" data-notes="O que dizer neste slide."
  data-cable="M-140 300 C 400 260, 700 560, 1000 760 S 1700 1100, 2080 900"
  data-orbs="1500 520 760;1820 980 420 b">
```

- `lt` (claro) ou `dk` (escuro). Escuros servem para divisores de parte e frases de impacto; o resto é claro.
- `id="sN"`: âncora para o CSS do slide. Pode pular números (ids não precisam seguir a ordem), o motor numera pela posição.
- `data-sec`: primeira coluna do rodapé (seção). `data-title`: usado na paleta (K), nas notas e no leitor de tela. Obrigatório.
- `data-who`: quem apresenta; aparece no rodapé e nas notas.
- `data-notes`: notas do apresentador (tecla N), com o próximo slide e um cronômetro.
- `data-cable`: um caminho SVG (`d`) no espaço 1920×1080 desenhado como fita larga com o gradiente `--cab-1/2/3`. Comece e termine fora do quadro (x < 0 ou > 1920, y < 0 ou > 1080) para a fita atravessar o slide. Use em capas, divisores e frases de impacto, no máximo em ~1 a cada 3 slides.
- `data-orbs`: `x y diâmetro[ b]` separados por `;`. `b` usa a variação azulada. Sem o atributo e com `data-orbes="auto"`, o motor põe um par padrão.

## Entradas animadas e passos

- `class="a"` entra ao chegar no slide, subindo. Variações: `a fr` (da direita), `a fl` (da esquerda), `a pp` (pop), `a fd` (fade). A ordem vem de `style="--i:N"` (90ms por índice); sem `--i`, a ordem do DOM.
- `class="a at" style="--t:1200ms"`: atraso exato depois da chegada.
- Títulos com `data-split="Linha um|Linha dois"`: o motor quebra nas `|` e anima linha a linha (efeito de máscara). Cada linha precisa caber na largura disponível; o texto não quebra sozinho.
- `class="draw"` em `<path pathLength="1">`: o traço se desenha.
- `class="stamp"` com `--t`: carimbo (escala + rotação), bom para ✓.
- **Passos**: qualquer elemento com `data-step="n"` recebe `.on` quando o apresentador avança até o passo `n` e `.now` enquanto `n` é o passo atual. O slide só avança para o próximo depois do último passo. Para esconder até o passo, acrescente `class="st"`; sem `.st` o elemento fica visível e você estiliza `.on`/`.now` (é assim que o `.term` marca ✓ e o `.steps` acende o número).
- `.code .hl` com `data-step` destaca a linha `--l` (e `--c` linhas) só no passo atual.

## Peças montadas pelo motor

Cabeçalho (logo + marca + ano), rodapé (seção, rodapé, quem fala, número), fita (`data-cable`),
orbes, trilha de passos (`.track`), moldura de cada slide, a parede com os cabos, destaque de
sintaxe em `<pre data-lang>` (palavras-chave, tipos com maiúscula, strings, números, comentários;
`#` só é comentário em py/sh/yaml/rb) e o comportamento dos vídeos `.vid`.

## Navegação, teclas e URL

→ / Espaço / Enter avança (revela passo ou vai ao próximo slide); ← volta; Shift+setas pulam os passos;
Home/End; digitar `12` e Enter vai ao slide 12; K ou Ctrl+K abre a paleta (comandos e busca de slides);
O (ou Tab) mostra a parede inteira e um clique escolhe o slide; M alterna moldura e tela inteira
(memorizado no navegador); N notas e cronômetro; T zera o cronômetro; L laser; B tela preta; F tela cheia;
P exporta PDF; ? mostra os atalhos. Toque: deslizar para os lados. Bordas da tela têm setas.

URL: `#6` abre no slide 6; `#6.2` no slide 6, passo 2. O hash acompanha a navegação, então dá para
compartilhar o link de um slide. `prefers-reduced-motion` desliga voos e animações.

## Modo PDF

`index.html?pdf` (ou a tecla P, que abre a impressão) empilha os slides em páginas 1920×1080, sem
animações, com todos os passos revelados e os destaques de código ocultos. O script
`scripts/exportar-pdf.sh` usa esse modo no Chrome headless; `scripts/capturas.cjs` também.

## API e eventos

`window.__deck` expõe `go(i)`, `next()`, `prev()`, `overview()`, `setStep(n)`, `cur`, `step`,
`stepsOf(i)` e `N`. A cada troca de slide o motor dispara `deck:slide` em `window` com
`detail.index` e `detail.slide`; use isso para efeitos próprios (os vídeos `.vid` pausam com ele).

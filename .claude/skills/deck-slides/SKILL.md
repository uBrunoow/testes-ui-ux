---
name: deck-slides
description: Cria e recria apresentações de slides em HTML no estilo "parede de slides" dos decks Testes de UI e UX e Adapter, num arquivo index.html único publicável na Vercel. Cada slide é um canvas 1920×1080 numa parede com câmera que voa entre eles, cabos ligando os slides, revelação por passos, notas do apresentador, paleta de comandos e exportação para PDF. Use esta skill sempre que o usuário pedir para criar, montar, refazer, redesenhar, converter ou estender uma apresentação, deck, slides, seminário, palestra, aula ou trabalho para apresentar (inclusive a partir de PDF, PPTX, Google Slides, roteiro ou tópicos), para adicionar ou ajustar slides num deck que já usa este motor (index.html com section.slide e div#wall), para gravar ou embutir um vídeo de demo num slide, ou para escrever o roteiro de fala dos apresentadores, mesmo que ele não diga "deck" ou "HTML".
---

# Deck de slides em parede

Esta skill produz apresentações no mesmo sistema de dois decks já feitos pelo usuário:
**Testes de UI e UX** (tema *vidro*: rosa e azul, cartões de vidro, conectores de protótipo) e
**Design Pattern Adapter** (tema *cabo*: laranja, cartões sólidos, um cabo com plugues ligando os slides).
Os dois usam o mesmo motor, que está pronto em `assets/template.html`. O trabalho aqui é de
conteúdo e composição: o motor já resolve navegação, câmera, notas, PDF e acessibilidade.

O resultado é **um `index.html` autocontido** (fontes do Google Fonts, sem build), mais os vídeos
ou imagens que ele usar, publicável como site estático (Vercel, GitHub Pages).

## Quando é criar e quando é recriar

- **Criar**: o usuário traz tema, tópicos, roteiro, artigo ou um trabalho escrito. Você monta o deck do zero a partir do template.
- **Recriar**: o usuário traz uma apresentação existente (PDF, PPTX, Google Slides, outro HTML) e quer no estilo destes decks. Extraia o conteúdo slide a slide, preserve o texto e a ordem do autor e reconstrua cada slide com os arquétipos daqui. Não invente dados, números, citações nem referências que não estavam no original.
- **Estender ou ajustar**: o deck já usa este motor (tem `<div id="wall">` e `<section class="slide">`). Edite no lugar: não troque o motor, não renumere ids sem necessidade e mantenha o tema.

## Fluxo

### 1. Entender a apresentação (uma pergunta só, se faltar algo)

Leia primeiro o que o usuário já deu e o que existe na pasta. Só pergunte o que não dá para inferir, numa única mensagem:

- **Conteúdo**: tema, tópicos ou material de origem.
- **Quem apresenta e quanto tempo**: os nomes viram `data-who` em cada slide e as partes viram divisores; o tempo define o número de slides (regra prática: 1 slide por 40 a 60 s de fala).
- **Público e contexto**: disciplina, evento, banca. Vai para `data-rodape`.
- **Visual**: tema *vidro*, tema *cabo* ou uma identidade nova (cores, fonte, referência de imagem).

Se o usuário não responder algum item, assuma, diga numa linha o que assumiu e siga.

### 2. Escrever o roteiro antes do HTML

Monte a lista de slides como texto curto: número, arquétipo, título-tese, quem fala, o que entra no slide e o que vai para as notas. Mostre ao usuário quando o deck tiver mais de 8 slides ou quando você estiver recriando um deck alheio. Regras do roteiro estão em `references/design.md` (seção "Narrativa").

A estrutura típica dos dois decks:
capa → (divisor da parte) → conceito → comparação ou tabela → como funciona (código ou diagrama com passos) → demonstração (roteiro + vídeo) → frase de impacto → referências → encerramento/perguntas.

### 3. Escolher ou criar o tema

- Tema pronto: `data-tema="vidro"` ou `data-tema="cabo"` no `<html>`. Para combinar com a parede: vidro usa `data-parede="fluxo"` e `data-orbes="auto"`; cabo usa `data-parede="cabo"` e `data-orbes="off"`.
- Tema novo: copie um bloco de tokens em `references/temas.md`, troque cores e fonte e dê um nome. Para derivar uma identidade de uma marca, imagem ou adjetivos, use a skill **hue** se estiver instalada (veja `references/skills-de-design.md`).
- Todo valor de cor e fonte passa por token (`--p`, `--s`, `--ink`, `--sans`...). Não escreva cor literal no CSS de slide; isso é o que permite trocar o tema numa linha.

Cada deck tem **um motivo visual** que conta o assunto: no de testes, um cursor que clica e um ✓ que acende; no do adapter, pinos e plugues que encaixam. Escolha um motivo para o deck novo antes de compor os slides e repita-o com moderação (capa, um ou dois diagramas, encerramento).

### 4. Montar o deck

1. Copie `assets/template.html` para a pasta do projeto como `index.html`.
2. Configure `<html data-tema>`, os `data-*` do `<body>` (marca, ano, rodapé, parede, orbes), o `<title>`, a `<meta name="description">` e o `<template id="logo">` (um SVG pequeno com `currentColor`).
3. Substitua os slides de exemplo pelos do roteiro. Cada slide é uma `<section class="slide lt|dk" id="sN">` com `data-sec`, `data-title`, `data-notes` e, se houver mais de um apresentador, `data-who`.
4. Use os arquétipos e peças de `references/componentes.md`. CSS específico de um slide vai no bloco marcado "Slides deste deck", sempre prefixado pelo id (`#s7 .algo{}`).
5. Remova do template o que o deck não usa só se atrapalhar; o CSS das peças é pequeno e pode ficar.

O canvas é fixo: **1920×1080, posição absoluta**. Pense como num quadro do Figma, não numa página web. Margens laterais de 120px, título em `top:140–150px`, conteúdo entre 300 e 960px, cabeçalho e rodapé são do motor. Detalhes em `references/design.md`.

O motor (atributos `data-*`, passos, teclas, URL `#6.2`, `?pdf`, eventos) está documentado em `references/motor.md`. Leia quando precisar de revelação por passos, links entre slides ou comportamento fora do comum.

### 5. Verificar (sempre, antes de entregar)

```bash
node <skill>/scripts/capturas.cjs index.html capturas
```

O script fotografa todos os slides no estado final, monta `capturas/folha.png` e escreve `capturas/relatorio.txt`. **Olhe a folha e as capturas dos slides que você mexeu**. O script aponta texto saindo do quadro, linha de título cortada, texto invadindo cabeçalho e rodapé, sobreposições e excesso de palavras. Corrija todo `ERRO`; para cada `AVISO`, corrija ou confirme olhando a captura que é intencional. Sem Playwright, abra o `index.html?pdf` num navegador e confira slide a slide.

Depois confira o comportamento no navegador real se puder: setas, passos (`data-step`), a tecla O (parede), N (notas) e P (PDF).

### 6. Entregar

- **PDF**: `bash <skill>/scripts/exportar-pdf.sh index.html` (usa o Chrome headless e o modo `?pdf`, com uma página por slide).
- **Publicar**: é um site estático; na Vercel basta o repositório com o `index.html` na raiz. Não suba `node_modules` nem pastas de trabalho (`capturas/`).
- **Roteiro de fala**: se pedirem, escreva por apresentador, slide a slide, com as falas, as deixas de avanço ("[avança]") e o tempo. As `data-notes` são o resumo disso.

## Demonstração em vídeo

Quando um slide precisar de demo gravada (plano B da demo ao vivo), siga `references/video-demo.md`: grave a tela real com Playwright e acrescente títulos e legendas com Remotion, ou faça o vídeo inteiro em HyperFrames. Embuta com a peça `.vid`, que amplia o vídeo para o slide inteiro e pausa ao sair do slide. Mostre o que existe de verdade: se algo não puder ser gravado de verdade (por exemplo, um serviço sem acesso), diga isso ao usuário em vez de simular a tela em silêncio.

## Skills de design que acompanham

Os dois decks foram feitos com estas skills: **impeccable**, **hue**, **hallmark**, **ui-ux-pro-max**, **frontend-design**, **interface-design** e **better-typography** (e **HyperFrames** para o vídeo do adapter). Esta skill funciona sem elas, mas, se estiverem instaladas, use-as nos momentos indicados em `references/skills-de-design.md`, que também explica onde as regras delas valem para um canvas 1920×1080 e onde não valem. Para instalar: `bash <skill>/scripts/instalar-skills-design.sh`.

## Erros comuns que esta skill evita

- **Slide-documento**: parágrafos longos no slide. Até ~80 palavras visíveis; o resto vai para `data-notes`.
- **Título-rótulo** ("Vantagens"): prefira a tese ("Um adaptador por formato, nenhum if a mais").
- **Layout de página web**: grids fluidos, `vw`, rolagem. Aqui tudo é posicionado no canvas fixo.
- **Linha de título longa demais**: cada linha de `data-split` precisa caber na largura; quebre com `|`.
- **Dados inventados**: números, depoimentos, logos ou referências que o usuário não deu. Deixe um marcador e pergunte.
- **Passos que somem no PDF**: no modo `?pdf` todos os passos aparecem; não dependa de um passo para esconder informação errada.
- **Cor fora do token**: quebra a troca de tema e o modo escuro dos divisores.

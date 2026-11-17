# Skills de design que acompanham

Os decks "Testes de UI e UX" e "Adapter" foram feitos com as skills abaixo. A `deck-slides`
funciona sem elas; quando estiverem instaladas, chame cada uma no momento indicado. Para instalar
todas de uma vez: `bash <skill>/scripts/instalar-skills-design.sh` (veja `--help`).

| Skill | Fonte | Licença | Para que serve aqui |
|---|---|---|---|
| **hue** | github.com/dominikmartn/hue | MIT | Gera uma linguagem de design (cores, tipos, forma, movimento) a partir de uma marca, imagem ou adjetivos. Use ao criar um **tema novo**. |
| **frontend-design** | github.com/anthropics/skills (`skills/frontend-design`) | ver repositório | Direção estética e escolhas que não parecem padrão. Use ao definir o **motivo visual** e a capa. |
| **hallmark** | github.com/Nutlope/hallmark | MIT | Piso anti "cara de gerado": tokens obrigatórios, sem `transition: all`, foco visível, movimento reduzido, nada de dados inventados, ~80 palavras por tela; `sloplint` e o carimbo de decisões no CSS. Use no **deck novo** e no `audit` final. |
| **impeccable** | github.com/pbakaus/impeccable | Apache-2.0 | Vocabulário de refinamento: `critique`, `audit`, `polish`, `typeset`, `layout`, `bolder`, `quieter`, `distill`, `clarify`. Use na **revisão** e para ajustes pontuais pedidos pelo usuário ("mais forte", "menos poluído"). |
| **ui-ux-pro-max** | github.com/nextlevelbuilder/ui-ux-pro-max-skill | MIT | Base pesquisável de estilos, paletas, pares de fontes e regras de UX/acessibilidade. Use para **conferir paleta, contraste e par de fontes** de um tema novo e para gráficos. |
| **interface-design** | github.com/Dammyjay93/interface-design | MIT | Ofício de interface: hierarquia, um ponto focal por tela, escala por razão, camadas sutis. Use nos slides que **mostram uma interface** (mockups, formulários, painéis dentro do slide). |
| **better-typography** | github.com/boraoztunc/skills (`better-typography`) | MIT | Tipografia: escolha e par de fontes, escala, quebra de linha, `text-wrap`, pontuação. Use ao **montar a escala do tema** e na revisão de títulos. |
| **HyperFrames** | github.com/heygen-com/hyperframes | ver repositório | Vídeos em HTML (usado no vídeo de demo do adapter). Use no **caminho B** de `video-demo.md`; instale pelo README do projeto. |

## Em que momento do fluxo

1. **Entender e roteirizar**: nenhuma skill extra; o roteiro vem do conteúdo.
2. **Tema e motivo**: `hue` (linguagem a partir da referência) → `ui-ux-pro-max` (conferir paleta, contraste, fontes) → `better-typography` (escala e pares) → `frontend-design` (motivo visual e capa).
3. **Montagem**: `hallmark` define o piso enquanto você escreve; `interface-design` nos slides que desenham uma interface.
4. **Revisão**: `scripts/capturas.cjs` primeiro; depois `impeccable critique` e `impeccable audit` no `index.html`, e `hallmark audit` se o usuário pedir uma auditoria completa. Ajustes de gosto ("mais ousado", "mais limpo") viram `impeccable bolder|quieter|distill|polish`.
5. **Vídeo**: Remotion (caminho A) ou HyperFrames (caminho B).

## O que muda num canvas de slide

Essas skills foram escritas para páginas web. Um deck 1920×1080 com câmera é outra superfície, e
algumas regras não se aplicam. Os decks originais registram isso como "waivers" no topo do CSS
(veja o início do `index.html` do deck de testes); faça o mesmo quando aplicar o hallmark:

- **Container centralizado e responsivo** (hallmark 14) e **hero visível a 1280×800** (hallmark 12): não se aplicam; o canvas é fixo e a câmera escala.
- **Grade de 4px**: os slides são ajustados no olho num canvas de 1920; espaçamentos de 18, 22, 30 px são normais.
- **Gradiente roxo → azul** (hallmark 11): proibido por padrão. No deck de testes ele foi mantido porque era a identidade pedida pelo usuário (Storybook). Só use se o usuário pedir, e registre o motivo.
- **Cartões de vidro e orbes** (hallmark 29): permitidos quando são a identidade escolhida (tema vidro); registre.
- **~80 palavras por tela** (hallmark 13/58): vale por slide, não pelo deck inteiro.
- **Rótulos em caixa alta com espaçamento** (hallmark 9): evite também nos slides; use sentence case. O "COMPONENTES" da barra lateral do Storybook num vídeo é captura de tela real e não conta.
- **Dados inventados** (hallmark 8): vale integralmente. Números, citações, logos e referências só com fonte.
- **Movimento reduzido e foco visível**: valem integralmente; o template já atende.

Quando uma regra de outra skill conflitar com a `deck-slides`, a ordem é: o que o usuário pediu →
o piso do hallmark que não depende de ser página web → esta skill → as demais.

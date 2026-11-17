# Linguagem visual e de escrita

O que os decks "Testes de UI e UX" e "Adapter" têm em comum, e por quê. Use como critério quando
uma decisão não estiver coberta pelos componentes.

## Sumário
- Narrativa
- Canvas e composição
- Tipografia
- Cor
- Movimento
- Escrita (pt-BR)
- Notas e roteiro de fala
- Checklist final

## Narrativa

- **Uma ideia por slide.** O título é a ideia; o resto do slide prova ou ilustra. Se você precisa de "e" no título, provavelmente são dois slides.
- **Título-tese, não rótulo.** "Cada story é também um teste" em vez de "Storybook"; "A mesma transação chega de três jeitos" em vez de "O problema".
- **Arco**: abrir com uma tensão concreta (um bug ou um problema de design? um `if` por formato), explicar, mostrar funcionando (código, demo, vídeo), dizer o limite, fechar com a frase que fica.
- **Partes por apresentador.** Em trabalho em grupo, cada pessoa tem uma parte com divisor escuro (`.div`) e o nome em `data-who`; o tempo de cada um vai na nota da capa.
- **Demonstração tem plano B.** Slide de roteiro da demo com os passos marcáveis e um vídeo gravado da mesma demo.
- **Limite honesto.** Os dois decks dizem onde a técnica para (axe cobre ~57% da WCAG; o Adapter não resolve regra de negócio). Isso dá credibilidade.
- **Fechamento** retoma a capa: mesma promessa, agora cumprida, mais "Perguntas?".
- Duração: ~1 slide por 40 a 60 s. Uma apresentação de 15 min fica entre 14 e 20 slides.

## Canvas e composição

- Canvas fixo 1920×1080, tudo em px e posição absoluta. A câmera escala o quadro para a tela; não há responsivo.
- Margem lateral de 120px (cabeçalho e rodapé usam 72px). Título em `top:140–150px`; conteúdo de 300 a ~960px; nada de texto acima de 100 ou abaixo de 1000 (faixas do cabeçalho e do rodapé).
- Composição assimétrica: texto à esquerda (até ~800px de largura) e a peça visual à direita, ou título em cima e duas/três colunas embaixo. Evite centralizar tudo.
- Até ~80 palavras visíveis por slide. Cartões com título de 3 a 6 palavras e uma linha de apoio.
- Respiro: espaços entre blocos de 18 a 60px; cartões com padding de 24 a 44px; cantos de 26 a 36px em cartões, 999px em pílulas.
- Profundidade com sombra longa e suave (`--glass-shadow`), nunca borda dura em cartão claro.
- Fundo dos claros: pontos de protoboard (automático) mais orbes de cor (vidro) ou só pontos (cabo). Escuros: para divisores e frases.

## Tipografia

- Uma família sans para tudo (Poppins no vidro, Inter Tight no cabo) e JetBrains Mono para código, números de passo, nomes de arquivo e o número da página.
- Escala usada nos decks:
  | Papel | Tamanho | Peso | Espaçamento |
  |---|---|---|---|
  | título gigante (capa, encerramento) | 168–176px | 500 | −0.05em |
  | título de divisor | 140px | 500 | −0.045em |
  | frase de impacto | 124–128px | 500 | −0.05em |
  | título de slide | 84px (vidro) / 92–96px (cabo) | 500 | −0.035 a −0.04em |
  | número de destaque | 168px | 600 | −0.06em |
  | lead | 34–36px | 400 | −0.005em |
  | título de cartão | 29–42px | 600 | −0.02em |
  | texto de cartão | 24–30px | 400 | 0 |
  | código | 23–28px, entrelinha 38–48px | 400 | 0 |
  | rótulos, rodapé | 22–26px | 400–500 | 0 |
- Nada abaixo de 20px: a sala vê o slide de longe.
- `text-wrap:balance` em títulos, `pretty` em parágrafos. Títulos quebram por `|` no `data-split`, escolhendo a quebra pelo sentido.
- Negrito (600) só para a palavra que carrega a frase. Itálico não é usado.

## Cor

- Papéis: `--p` primária (ação, destaque, passo atual), `--s` secundária (o outro lado de uma comparação), verde só para "passou/feito", vermelho só para "falhou/erro". Texto de destaque usa `--p-txt` (versão escura que passa AA sobre fundo claro).
- Um gradiente de marca (`--grad`) em poucos lugares: a segunda linha da capa, a frase de impacto, o cartão de número, os conectores. Se está em todo lugar, deixa de chamar atenção.
- Código ganha cores próprias (palavra-chave na primária, tipo na secundária, string em verde, número em âmbar, comentário apagado e itálico).
- Contraste: texto normal ≥ 4.5:1, texto grande e ícones ≥ 3:1. Confira pares novos antes de usar.

## Movimento

- Ao chegar: título por linhas (máscara), depois os blocos com 90ms de intervalo, da esquerda para a direita na ordem de leitura.
- Revelação por passos só quando a explicação é sequencial (código linha a linha, roteiro de demo, diagrama que se monta). Slides de leitura entram inteiros.
- O motivo visual pode ter uma animação própria curta na capa (cursor clica, ✓ acende; arquivo pluga, luz acende). Uma vez, não em loop chamativo.
- Tudo respeita `prefers-reduced-motion` (o template já cuida das classes padrão; animações novas precisam da mesma exceção).

## Escrita (pt-BR)

- Português do Brasil, frases curtas, voz ativa, sem jargão sem explicação.
- Sem ponto final em título e em itens de cartão; com ponto em frases completas de lead e notas.
- Números com vírgula decimal (2,4:1; 57%) e unidades com espaço quando for o caso.
- Referências em ABNT. Nomes de ferramentas como as próprias escrevem (Storybook, Vitest, axe-core).
- Não use dado, citação ou logo que o usuário não forneceu ou que você não verificou.

## Notas e roteiro de fala

`data-notes` é a cola do apresentador: o que dizer, onde avançar ("Avance três vezes: …"), a
transição para o próximo e quem assume. Quando pedirem roteiro completo, escreva por apresentador:
slide, tempo, fala em primeira pessoa, marcações [avança] e, para vídeo, a fala sincronizada com os
tempos do vídeo.

## Checklist final

- [ ] `scripts/capturas.cjs` sem `ERRO`, avisos conferidos na captura.
- [ ] Todo slide com `data-title`, `data-sec`, `data-notes` e, se em grupo, `data-who`.
- [ ] Nenhuma linha de título cortada; nenhum texto nas faixas de cabeçalho/rodapé.
- [ ] Cores e fontes só por token; tema muda trocando `data-tema`.
- [ ] Passos testados com as setas; PDF gerado com `scripts/exportar-pdf.sh` e conferido.
- [ ] Vídeos com `poster`, `preload="metadata"` e menos de ~10 MB cada.

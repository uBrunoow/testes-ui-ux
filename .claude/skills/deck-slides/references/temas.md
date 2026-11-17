# Temas

O template traz dois temas. Para um tema novo, copie o bloco `[data-tema="cabo"]` (é o menor:
só redefine o que muda em relação ao vidro), renomeie e troque os valores.

## vidro (deck "Testes de UI e UX")

- **Ideia**: cartões de vidro fosco flutuando sobre orbes rosa e azul; UI é rosa, UX é azul.
- **Fonte**: Poppins 300–600 + JetBrains Mono.
- **Cores**: fundo #f4f4f7, parede #e4e4e9, tinta #141418, primária #ff4785 (texto #d0175f), secundária #1ea7fd (texto #0a6cb5), gradiente rosa → lilás #c770e0 → azul.
- **Parede**: `data-parede="fluxo"` (frames em serpentina ligados como num fluxo de protótipo; um cursor percorre o conector ao avançar).
- **Orbes**: `data-orbes="auto"`. O desfoque do vidro só roda no slide atual (desempenho).
- **Motivo**: cursor → clique → ✓ (o teste de UI) e um olho observando (o teste de UX).

## cabo (deck "Design Pattern Adapter")

- **Ideia**: tudo é encaixe. Cada formato tem um pino (● ▲ ⬢ ✚), o contrato é o encaixe ■, e uma fita laranja é um cabo que atravessa os slides.
- **Fonte**: Inter Tight 400–700 + JetBrains Mono.
- **Cores**: fundo #fbfbf9, parede #dcd8d2, tinta #17181b, primária #ff6a13 (texto #c2410c), secundária #2556c9, gradiente pêssego #ffc9a1 → laranja #ff7a24 → #ff5200.
- **Parede**: `data-parede="cabo"` (grade ligada por um cabo grosso com plugues entre os slides).
- **Orbes**: `data-orbes="off"`; cartões sólidos brancos com sombra quente.
- **Motivo**: pinos e soquetes, arquivos que plugam num adaptador.

## Tema novo

1. Defina a ideia em uma frase e o motivo visual (o que o assunto "faz" e pode virar desenho).
2. Escolha uma sans com personalidade compatível (pesos 400–600, boa em 84px e em 24px) e mantenha JetBrains Mono para código. Carregue no `<link>` do Google Fonts.
3. Tokens mínimos: `--wall --white --ink --night --mut --p --p-2 --p-txt --p-soft --p-wash --s --s-2 --s-txt --grad --grad-p --grad-s --cab-1 --cab-2 --cab-3 --shadow-warm --glass-shadow --sans`. Verifique `--p-txt` e `--s-txt` com contraste ≥ 4.5:1 sobre `--white`.
4. Se a identidade vier de uma marca, imagem ou adjetivos ("sóbrio, editorial, quente"), use a skill **hue** para derivar a linguagem e a **ui-ux-pro-max** para conferir paleta e par de fontes. Traga o resultado para os tokens; o motor e as peças continuam os mesmos.

```css
[data-tema="meu-tema"]{
  --wall:#…; --white:#…; --w:#fff; --ink:#…; --night:#…; --night-card:#…; --night-well:#…; --paper:#…;
  --mut:#…; --mut-dk:#…; --faint:#…; --on-dark:#…;
  --p:#…; --p-2:#…; --p-txt:#…; --p-soft:#…; --p-wash:rgba(…,.14);
  --s:#…; --s-2:#…; --s-txt:#…; --s-soft:#…; --t:#…;
  --grad:linear-gradient(120deg,#… 0%,#… 50%,#… 100%);
  --grad-p:linear-gradient(140deg,var(--p-2),var(--p)); --grad-s:linear-gradient(140deg,#…,#…);
  --cab-1:#…; --cab-2:#…; --cab-3:#…;
  --well-lt:#…; --codebg:#…; --wire:#…; --pin:#…;
  --shadow-warm:rgba(…,.3); --glass-shadow:0 30px 60px -32px rgba(…,.3),0 2px 6px rgba(…,.04);
  --sans:'Fonte',system-ui,sans-serif;
}
```

Regras que dependem do tema ficam como `[data-tema="vidro"] …` no CSS (fundo com orbes, vidro dos
cartões). Um tema novo sem essas regras usa cartões sólidos, como o cabo.

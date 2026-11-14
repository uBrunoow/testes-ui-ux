import React, {useState} from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import E from './eventos.json';

/*
 * Vídeo da demo: gravação real do Storybook (demo-storybook/, gravada com
 * scripts/gravar-demo.cjs) com títulos, legendas, o trecho de CSS editado e
 * as imagens de diff geradas pelo Vitest sobrepostos.
 */

const C = {
  white: '#f4f4f7',
  w: '#fefeff',
  ink: '#141418',
  mut: '#686874',
  mutDk: '#a8a8b3',
  faint: '#8d8d98',
  or: '#ff4785',
  or2: '#ff7eb0',
  orTxt: '#d0175f',
  green: '#16a34a',
  greenTxt: '#157a3c',
  well2: '#dcdce3',
  redTxt: '#c02626',
};
const SANS = "'Poppins', system-ui, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";
const GRAD = 'linear-gradient(120deg,#ff4785 0%,#c770e0 52%,#1ea7fd 100%)';

export const FPS = 30;
const SPEED = 1.25; // a gravação toca 25% mais rápida
const REC_START = 70; // frame em que a gravação começa a tocar
type Ev = keyof typeof E;
const ev = (k: Ev) => REC_START + Math.round((E[k] / SPEED) * FPS);
const OUTRO = ev('fim') + 6;
export const DURATION = OUTRO + 150;

/* geometria: janela 16:9 com barra de título */
const BAR = 38;
const WIN = {w: 1500, h: Math.round((1500 * 9) / 16) + BAR};
const WX = (1920 - WIN.w) / 2;
const WY = 168;
// coordenadas da gravação (1280×720 CSS px) → quadro final
const sx = (x: number) => WX + (x / 1280) * WIN.w;
const sy = (y: number) => WY + BAR + (y / 720) * (WIN.h - BAR);

const ease = Easing.bezier(0.2, 0.7, 0.2, 1);
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const at = (f: number, s: number, d = 12, e = ease) => interpolate(f, [s, s + d], [0, 1], {...clamp, easing: e});
/** 0→1 ao entrar em `a`, 1→0 ao chegar em `b` */
const span = (f: number, a: number, b: number, d = 10) => at(f, a, d, easeOut) * (1 - at(f, b - d, d));

const Check: React.FC<{size?: number}> = ({size = 22}) => (
  <span style={{width: size, height: size, borderRadius: '50%', background: C.green, display: 'inline-grid', placeItems: 'center', flex: 'none'}}>
    <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62}>
      <path d="M6 12.5l4 4L18 8" fill="none" stroke={C.w} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

const Background: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{background: C.white, overflow: 'hidden'}}>
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(20,20,24,.075) 1.6px, transparent 1.7px)', backgroundSize: '34px 34px'}} />
    <div style={{position: 'absolute', left: 1380 + Math.sin(f / 70) * 40, top: -260 + Math.cos(f / 80) * 30, width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,71,133,.28), rgba(255,71,133,0) 65%)'}} />
    <div style={{position: 'absolute', left: -300 + Math.cos(f / 90) * 40, top: 560 + Math.sin(f / 75) * 30, width: 960, height: 960, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,167,253,.24), rgba(30,167,253,0) 65%)'}} />
  </AbsoluteFill>
);

/* ───────── cabeçalho dos passos ───────── */
const STEPS = [
  {n: '01', t: 'Mostrar o Button', s: 'Primário, desabilitado e carregando', from: ev('passo1'), to: ev('passo2')},
  {n: '02', t: 'Rodar o play()', s: 'O clique acontece passo a passo', from: ev('passo2'), to: ev('passo3')},
  {n: '03', t: 'Painel de acessibilidade', s: 'Contraste ruim, corrigir, teste passa', from: ev('passo3'), to: ev('passo4')},
  {n: '04', t: 'Diff visual', s: 'Mudança de estilo detectada pelo Vitest', from: ev('passo4'), to: OUTRO},
];

const Header: React.FC<{f: number}> = ({f}) => {
  const vis = at(f, STEPS[0].from - 10, 14) * (1 - at(f, OUTRO - 10, 14));
  const idx = STEPS.findIndex((s) => f >= s.from && f < s.to);
  return (
    <div style={{position: 'absolute', left: WX, top: 40, width: WIN.w, height: 110, opacity: vis}}>
      {STEPS.map((s) => {
        const tIn = at(f, s.from + 2, 16, easeOut);
        const tOut = at(f, s.to - 8, 10);
        const o = tIn * (1 - tOut);
        if (o <= 0) return null;
        return (
          <div key={s.n} style={{position: 'absolute', left: 0, top: 0, opacity: o, transform: `translateY(${(1 - tIn) * 18 - tOut * 10}px)`}}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
              <span style={{font: `500 30px ${MONO}`, color: C.orTxt}}>{s.n}</span>
              <span style={{font: `600 52px/1.05 ${SANS}`, letterSpacing: '-0.035em', color: C.ink}}>{s.t}</span>
            </div>
            <div style={{font: `400 24px ${SANS}`, color: C.mut, marginTop: 8, marginLeft: 60}}>{s.s}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', right: 0, top: 18, display: 'flex', gap: 12}}>
        {STEPS.map((s, i) => {
          const done = i < idx || f >= OUTRO - 10;
          const on = i === idx;
          return (
            <div
              key={s.n}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px 10px 12px', borderRadius: 999,
                background: on ? C.ink : 'rgba(254,254,255,.75)', border: `1px solid ${on ? C.ink : 'rgba(20,20,40,.08)'}`,
                font: `500 20px ${MONO}`, color: on ? C.w : done ? C.greenTxt : C.faint,
              }}
            >
              {done ? <Check size={24} /> : <span style={{width: 24, height: 24, borderRadius: '50%', border: `2.5px solid ${on ? C.or2 : C.well2}`}} />}
              {s.n}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ───────── janela com a gravação real ───────── */
const Window: React.FC<{f: number}> = ({f}) => {
  const tIn = at(f, REC_START - 30, 24, easeOut);
  const tOut = at(f, OUTRO - 6, 22);
  return (
    <div
      style={{
        position: 'absolute', left: WX, top: WY, width: WIN.w, height: WIN.h, borderRadius: 22, overflow: 'hidden', background: C.w,
        boxShadow: '0 50px 90px -40px rgba(120,60,180,.45), 0 2px 8px rgba(20,20,40,.06)', border: '1px solid rgba(20,20,40,.08)',
        opacity: tIn * (1 - tOut), transform: `translateY(${(1 - tIn) * 60 + tOut * 30}px) scale(${0.97 + tIn * 0.03 - tOut * 0.05})`,
      }}
    >
      <div style={{height: BAR, display: 'flex', alignItems: 'center', gap: 9, padding: '0 18px', background: '#eeeef2', borderBottom: '1px solid rgba(20,20,40,.08)'}}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <span key={c} style={{width: 12, height: 12, borderRadius: '50%', background: c}} />
        ))}
        <div style={{marginLeft: 18, height: 24, width: 520, borderRadius: 8, background: C.w, display: 'flex', alignItems: 'center', padding: '0 12px', font: `400 14px ${MONO}`, color: C.mut}}>
          localhost:6006 · storybook dev
        </div>
        <span style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, font: `500 14px ${SANS}`, color: C.orTxt}}>
          <span style={{width: 8, height: 8, borderRadius: '50%', background: C.or}} /> gravação real
        </span>
      </div>
      <div style={{position: 'absolute', left: 0, top: BAR, width: WIN.w, height: WIN.h - BAR, background: C.w}}>
        <Sequence from={REC_START} layout="none">
          <OffthreadVideo src={staticFile('storybook-real.mp4')} playbackRate={SPEED} muted style={{width: '100%', height: '100%', display: 'block'}} />
        </Sequence>
      </div>
    </div>
  );
};

/* ───────── legendas ───────── */
const CAPTIONS: {a: Ev; b: Ev; t: React.ReactNode; da?: number}[] = [
  {a: 'passo1', b: 'passo2', t: 'Cada estado do componente é uma story', da: 0.6},
  {a: 'play-inicio', b: 'passo3', t: <>Depurador de interações: o <code style={{fontFamily: MONO}}>play()</code> avançando passo a passo</>},
  {a: 'cor-ruim', b: 'violacao', t: 'CSS editado: o Storybook recarrega sozinho e o axe-core roda de novo'},
  {a: 'violacao', b: 'cor-corrigida', t: <>axe-core: contraste <b>2,4:1</b>, o mínimo da WCAG AA é <b>4,5:1</b></>},
  {a: 'cor-corrigida', b: 'passo4', t: 'Cor corrigida: nenhuma violação', da: 1.2},
  {a: 'rodando1', b: 'raio', t: <>Run tests: o Vitest roda interação, acessibilidade e captura de tela de cada story</>},
  {a: 'raio', b: 'rodando2', t: <>Estilo alterado: <code style={{fontFamily: MONO}}>border-radius</code> 12px → 999px</>},
  {a: 'rodando2', b: 'diff', t: 'As 4 stories falham: a aparência não bate com a referência', da: 1.6},
  {a: 'aceitar', b: 'rodando3', t: <>Mudança intencional: <code style={{fontFamily: MONO}}>npx vitest -u</code> atualiza as referências</>},
  {a: 'rodando3', b: 'fim', t: 'Rodando de novo: tudo verde', da: 1.2},
];

const Captions: React.FC<{f: number}> = ({f}) => (
  <>
    {CAPTIONS.map((c, i) => {
      const a = ev(c.a) + Math.round(((c.da ?? 0) / SPEED) * FPS);
      const b = ev(c.b);
      const o = span(f, a, b, 9);
      if (o <= 0) return null;
      return (
        <div
          key={i}
          style={{
            position: 'absolute', left: 0, right: 0, top: sy(652), display: 'flex', justifyContent: 'center',
            opacity: o, transform: `translateY(${(1 - o) * 14}px)`, zIndex: 30,
          }}
        >
          <div style={{padding: '14px 28px', borderRadius: 999, background: 'rgba(20,20,24,.9)', color: C.w, font: `400 24px ${SANS}`, boxShadow: '0 20px 40px -20px rgba(20,20,40,.6)'}}>
            {c.t}
          </div>
        </div>
      );
    })}
  </>
);

/* ───────── trecho real de src/components/button.css ───────── */
const typed = (f: number, end: number, from: string, to: string, speed = 3) => {
  const total = (from.length + to.length) * speed;
  const start = end - total;
  if (f < start) return {text: from, editing: false};
  if (f >= end) return {text: to, editing: f < end + 10};
  const g = f - start;
  const del = from.length * speed;
  if (g < del) return {text: from.slice(0, from.length - Math.floor(g / speed)), editing: true};
  return {text: to.slice(0, Math.floor((g - del) / speed) + 1), editing: true};
};

const CodeCard: React.FC<{f: number}> = ({f}) => {
  const lead = 50; // a digitação termina no instante em que o arquivo é salvo
  const o1 = span(f, ev('cor-ruim') - lead - 14, ev('cor-corrigida') + 70, 12);
  const o2 = span(f, ev('raio') - lead - 14, ev('raio') + 90, 12);
  const o = Math.max(o1, o2);
  if (o <= 0) return null;
  const color = f < ev('cor-corrigida') - 30 ? typed(f, ev('cor-ruim'), '#ffffff', '#ff8ab3') : typed(f, ev('cor-corrigida'), '#ff8ab3', '#ffffff');
  const radius = typed(f, ev('raio'), '12px', '999px', 4);
  const saveAt = [ev('cor-ruim'), ev('cor-corrigida'), ev('raio')].filter((s) => f >= s).pop();
  const saved = saveAt !== undefined && f - saveAt < 45;
  const caret = (on: boolean) =>
    on && Math.floor(f / 8) % 2 === 0 ? <span style={{display: 'inline-block', width: 3, height: 26, background: C.or, verticalAlign: '-5px', marginLeft: 1}} /> : null;
  const hlColor = o1 > 0 && f < ev('cor-corrigida') + 70;
  const ln = (n: number, body: React.ReactNode, hl = false) => (
    <div style={{display: 'flex', height: 38, alignItems: 'center', background: hl ? 'rgba(255,71,133,.12)' : 'transparent', paddingRight: 20}}>
      <span style={{width: 52, textAlign: 'right', paddingRight: 18, color: C.faint}}>{n}</span>
      <span style={{whiteSpace: 'pre'}}>{body}</span>
    </div>
  );
  return (
    <div
      style={{
        position: 'absolute', left: WX + WIN.w - 400, top: sy(56), width: 440, borderRadius: 20, background: C.ink, color: '#e8e8ef', overflow: 'hidden',
        boxShadow: '0 40px 70px -30px rgba(20,20,60,.6)', opacity: o, transform: `translateY(${(1 - o) * 20}px)`, zIndex: 25, font: `400 20px ${MONO}`,
      }}
    >
      <div style={{height: 46, display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px', borderBottom: '1px solid rgba(255,255,255,.08)', font: `400 16px ${MONO}`, color: C.mutDk}}>
        src/components/button.css
        {saved && (
          <span style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, color: '#7ee2a1'}}>
            <Check size={18} /> salvo
          </span>
        )}
      </div>
      <div style={{padding: '10px 0'}}>
        {ln(9, <>.btn {'{'}</>)}
        {ln(16, <>  border-radius: <span style={{color: '#f6b26b'}}>{radius.text}{caret(radius.editing)}</span>;</>, !hlColor)}
        {ln(17, <>  background: <span style={{color: '#a5e3a0'}}>#d0175f</span>;</>)}
        {ln(18, <>  color: <span style={{color: '#a5e3a0'}}>{color.text}{caret(color.editing)}</span>;</>, hlColor)}
        {ln(25, <>{'}'}</>)}
      </div>
    </div>
  );
};

/* ───────── imagens reais do toMatchScreenshot ───────── */
const DiffCard: React.FC<{f: number}> = ({f}) => {
  const o = span(f, ev('diff') - 6, ev('aceitar') + 4, 12);
  if (o <= 0) return null;
  const img = (src: string, label: string) => (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
      <div style={{padding: 10, borderRadius: 14, background: '#f6f6f9', border: '1px solid rgba(20,20,40,.08)'}}>
        <Img src={staticFile(src)} style={{width: 102 * 2.7, height: 45 * 2.7, display: 'block', imageRendering: 'pixelated'}} />
      </div>
      <span style={{font: `500 20px ${SANS}`, color: C.ink}}>{label}</span>
    </div>
  );
  return (
    <div
      style={{
        position: 'absolute', left: sx(300), right: 1920 - (WX + WIN.w), top: sy(70), display: 'flex', justifyContent: 'center', zIndex: 26,
        opacity: o, transform: `translateY(${(1 - o) * 20}px) scale(${0.97 + o * 0.03})`,
      }}
    >
      <div style={{padding: '26px 32px 28px', borderRadius: 26, background: 'rgba(254,254,255,.97)', boxShadow: '0 50px 90px -30px rgba(20,20,60,.5)', border: '1px solid rgba(20,20,40,.08)'}}>
        <div style={{font: `500 20px ${MONO}`, color: C.redTxt}}>expect(element).toMatchScreenshot()</div>
        <div style={{marginTop: 6, font: `400 19px ${MONO}`, color: C.mut}}>
          Screenshot does not match the stored reference. <b style={{color: C.ink, fontWeight: 500}}>466 pixels (ratio 0.11) differ.</b>
        </div>
        <div style={{marginTop: 22, display: 'flex', gap: 26}}>
          {img('ref-enviar.png', 'Referência')}
          {img('actual-enviar.png', 'Atual')}
          {img('diff-enviar.png', 'Diff')}
        </div>
      </div>
    </div>
  );
};

/* ───────── abertura e encerramento ───────── */
const Intro: React.FC<{f: number}> = ({f}) => {
  const a = at(f, 4, 20, easeOut);
  const b = at(f, 14, 20, easeOut);
  const out = at(f, REC_START - 34, 16);
  if (out >= 1) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - out, transform: `translateY(${-out * 30}px)`}}>
      <div style={{font: `500 26px ${MONO}`, color: C.orTxt, opacity: a, letterSpacing: '.04em'}}>DEMO · STORYBOOK TEST</div>
      <div style={{marginTop: 18, font: `600 112px/1.02 ${SANS}`, letterSpacing: '-0.055em', color: C.ink, opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>
        Um componente, <span style={{background: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>três testes</span>
      </div>
      <div style={{marginTop: 26, font: `400 32px ${SANS}`, color: C.mut, opacity: b}}>Interação, acessibilidade e regressão visual</div>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{f: number}> = ({f}) => {
  const s = OUTRO + 10;
  if (f < s) return null;
  const a = at(f, s, 20, easeOut);
  const lim = at(f, s + 50, 18, easeOut);
  const chips = [
    {l: 'Interação', d: 'play() passou'},
    {l: 'Acessibilidade', d: 'contraste corrigido'},
    {l: 'Visual', d: 'nova referência aceita'},
  ];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{font: `600 96px/1.04 ${SANS}`, letterSpacing: '-0.05em', color: C.ink, opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>
        A mesma story, <span style={{background: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>três verificações</span>
      </div>
      <div style={{marginTop: 54, display: 'flex', gap: 24}}>
        {chips.map((c, i) => {
          const t = at(f, s + 16 + i * 8, 16, easeOut);
          return (
            <div key={c.l} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '22px 30px 22px 22px', borderRadius: 24, background: 'rgba(254,254,255,.85)', boxShadow: '0 30px 60px -30px rgba(181,124,240,.4)', opacity: t, transform: `scale(${0.88 + t * 0.12})`}}>
              <Check size={42} />
              <div>
                <div style={{font: `600 30px ${SANS}`, color: C.ink, letterSpacing: '-0.02em'}}>{c.l}</div>
                <div style={{font: `400 21px ${SANS}`, color: C.mut}}>{c.d}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{marginTop: 54, font: `400 30px ${SANS}`, color: C.mut, opacity: lim}}>
        <b style={{color: C.ink, fontWeight: 600}}>Limite:</b> isso cobre UI. Para UX, só testando com pessoas reais.
      </div>
    </AbsoluteFill>
  );
};

export const DemoReal: React.FC = () => {
  const f = useCurrentFrame();
  const [handle] = useState(() => delayRender('fontes'));
  React.useEffect(() => {
    document.fonts.ready.then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{fontFamily: SANS}}>
      <Background f={f} />
      <Intro f={f} />
      <Header f={f} />
      <Window f={f} />
      <CodeCard f={f} />
      <DiffCard f={f} />
      <Captions f={f} />
      <Outro f={f} />
    </AbsoluteFill>
  );
};

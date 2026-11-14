import React, {useState} from 'react';
import {
  AbsoluteFill,
  Easing,
  continueRender,
  delayRender,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';

/* ───────── tokens (iguais aos da apresentação) ───────── */
const C = {
  white: '#f4f4f7',
  w: '#fefeff',
  ink: '#141418',
  ink2: '#232329',
  mut: '#686874',
  mutDk: '#a8a8b3',
  faint: '#8d8d98',
  line: 'rgba(20,20,40,.09)',
  or: '#ff4785',
  or2: '#ff7eb0',
  orTxt: '#d0175f',
  orSoft: '#ffe3ee',
  blue: '#1ea7fd',
  blueTxt: '#0a6cb5',
  blueSoft: '#dff1ff',
  lilac: '#b57cf0',
  green: '#16a34a',
  greenTxt: '#157a3c',
  greenSoft: '#dcf5e4',
  redTxt: '#c02626',
  redSoft: '#fde4e4',
  wellLt: '#eeeef2',
  well2: '#dcdce3',
  codeBg: '#f6f6f9',
  codeNum: '#9a5b00',
  amber: '#b45309',
  amberSoft: '#fef3c7',
};
const SANS = "'Poppins', system-ui, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";
const GRAD = 'linear-gradient(120deg,#ff4785 0%,#c770e0 52%,#1ea7fd 100%)';

export const FPS = 30;
export const DURATION = 1800; // 60 s

/* ───────── linha do tempo (frames) ───────── */
const T = {
  win: 70,
  s1: 90,
  s2: 420,
  s3: 810,
  s4: 1260,
  outro: 1650,
  // passo 1
  clkDis: 170,
  clkLoad: 230,
  clkPrim: 335,
  // passo 2
  clkEnviar: 460,
  st1: 480,
  st2: 510,
  st3: 545,
  pass: 575,
  // passo 3
  tabA11y: 850,
  codeIn: 880,
  edit1: 905,
  save1: 960,
  viol: 975,
  edit2: 1075,
  save2: 1140,
  fixed: 1155,
  // passo 4
  edit3: 1285,
  save3: 1335,
  codeOut: 1355,
  tabVis: 1375,
  visDone: 1445,
  clkAccept: 1540,
};

/* ───────── geometria (coordenadas absolutas no quadro 1920×1080) ───────── */
const WIN = {x: 120, y: 172, w: 1680, h: 858};
const BAR = 52;
const SIDE = 300;
const BODY_Y = WIN.y + BAR; // 224
const TOOL = 48;
const PANEL_H = 318;
const CANVAS = {x: WIN.x + SIDE, y: BODY_Y + TOOL, w: WIN.w - SIDE, h: WIN.h - BAR - TOOL - PANEL_H};
const PANEL_Y = CANVAS.y + CANVAS.h; // topo do painel de addons
const ITEM_Y0 = BODY_Y + 226; // primeiro item de story
const ITEM_H = 46;
const itemCY = (i: number) => ITEM_Y0 + i * ITEM_H + ITEM_H / 2;
const TABS = [
  {id: 'int', label: 'Interações', x: 24, w: 178},
  {id: 'a11y', label: 'Acessibilidade', x: 210, w: 212},
  {id: 'vis', label: 'Testes visuais', x: 430, w: 206},
] as const;
const tabC = (i: number) => ({x: CANVAS.x + TABS[i].x + TABS[i].w / 2, y: PANEL_Y + 26});
const BTN_C = {x: CANVAS.x + CANVAS.w / 2 - 170, y: CANVAS.y + CANVAS.h / 2 - 10};
const ACCEPT = {x: CANVAS.x + CANVAS.w - 250, y: PANEL_Y + 128};

/* ───────── utilitários ───────── */
const ease = Easing.bezier(0.2, 0.7, 0.2, 1);
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const at = (f: number, start: number, dur = 12, e = ease) =>
  interpolate(f, [start, start + dur], [0, 1], {...clamp, easing: e});
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Texto digitado: apaga `from` e digita `to`, 2 frames por caractere. */
const typed = (f: number, start: number, from: string, to: string, speed = 2) => {
  const del = from.length * speed;
  if (f < start) return {text: from, editing: false};
  if (f < start + del) {
    const n = from.length - Math.floor((f - start) / speed);
    return {text: from.slice(0, n), editing: true};
  }
  const g = f - start - del;
  const n = Math.min(to.length, Math.floor(g / speed) + 1);
  return {text: to.slice(0, n), editing: g < to.length * speed + 8};
};

/* ───────── cursor ───────── */
type WP = {f: number; x: number; y: number};
const PATH: WP[] = [
  {f: 110, x: 760, y: 1000},
  {f: 160, ...{x: 250, y: itemCY(1)}},
  {f: 222, ...{x: 252, y: itemCY(2)}},
  {f: 280, x: BTN_C.x + 30, y: BTN_C.y + 20},
  {f: 326, x: 248, y: itemCY(0)},
  {f: 380, x: BTN_C.x + 40, y: BTN_C.y + 14},
  {f: 410, x: BTN_C.x + 40, y: BTN_C.y + 14},
  {f: 452, x: 240, y: itemCY(3)},
  {f: 500, x: 240, y: itemCY(3)},
  {f: 590, x: CANVAS.x + 420, y: PANEL_Y + 150},
  {f: 650, x: CANVAS.x + 520, y: PANEL_Y + 196},
  {f: 720, x: CANVAS.x + 560, y: PANEL_Y + 242},
  {f: 790, x: CANVAS.x + 560, y: PANEL_Y + 242},
  {f: 842, ...tabC(1)},
  {f: 870, ...tabC(1)},
  {f: 1000, x: CANVAS.x + 1020, y: PANEL_Y + 152},
  {f: 1040, x: CANVAS.x + 1080, y: PANEL_Y + 196},
  {f: 1066, x: 1712, y: 478},
  {f: 1170, x: 1712, y: 478},
  {f: 1230, x: CANVAS.x + 520, y: PANEL_Y + 150},
  {f: 1275, x: 1712, y: 520},
  {f: 1345, x: 1712, y: 520},
  {f: 1368, ...tabC(2)},
  {f: 1440, ...tabC(2)},
  {f: 1500, x: CANVAS.x + 700, y: CANVAS.y + 230},
  {f: 1532, ...ACCEPT},
  {f: 1620, ...ACCEPT},
];
const CLICKS = [T.clkDis, T.clkLoad, T.clkPrim, T.clkEnviar, T.tabA11y, T.tabVis, T.clkAccept];

const cursorPos = (f: number) => {
  if (f <= PATH[0].f) return PATH[0];
  for (let i = 0; i < PATH.length - 1; i++) {
    const a = PATH[i];
    const b = PATH[i + 1];
    if (f <= b.f) {
      const t = interpolate(f, [a.f, b.f], [0, 1], {...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1)});
      return {f, x: mix(a.x, b.x, t), y: mix(a.y, b.y, t)};
    }
  }
  return PATH[PATH.length - 1];
};

const Cursor: React.FC<{f: number}> = ({f}) => {
  const p = cursorPos(f);
  const show = at(f, 100, 10) * (1 - at(f, T.outro - 20, 14));
  const press = CLICKS.reduce((s, c) => Math.max(s, f >= c - 3 && f <= c + 5 ? 1 - Math.abs(f - c - 1) / 5 : 0), 0);
  return (
    <>
      {CLICKS.map((c) => {
        const t = (f - c) / 18;
        if (t < 0 || t > 1) return null;
        const pc = cursorPos(c);
        return (
          <div
            key={c}
            style={{
              position: 'absolute',
              left: pc.x - 34,
              top: pc.y - 34,
              width: 68,
              height: 68,
              borderRadius: '50%',
              border: `3px solid ${C.or}`,
              opacity: 1 - t,
              transform: `scale(${0.3 + t * 0.9})`,
              zIndex: 50,
            }}
          />
        );
      })}
      <svg
        viewBox="0 0 46 56"
        width={40}
        height={48}
        style={{
          position: 'absolute',
          left: p.x - 5,
          top: p.y - 3,
          opacity: show,
          transform: `scale(${1 - press * 0.16})`,
          transformOrigin: '5px 3px',
          filter: 'drop-shadow(0 6px 10px rgba(20,20,40,.28))',
          zIndex: 60,
        }}
      >
        <path d="M6 4l34 19-15 4 9 17-7 4-9-17-11 10z" fill={C.ink} stroke={C.w} strokeWidth={3} strokeLinejoin="round" />
      </svg>
    </>
  );
};

/* ───────── ícones ───────── */
const Check: React.FC<{size?: number; color?: string; bg?: string}> = ({size = 22, color = C.w, bg = C.green}) => (
  <span
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: bg,
      display: 'inline-grid',
      placeItems: 'center',
      flex: 'none',
    }}
  >
    <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62}>
      <path d="M6 12.5l4 4L18 8" fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);
const Cross: React.FC<{size?: number}> = ({size = 22}) => (
  <span style={{width: size, height: size, borderRadius: '50%', background: C.redTxt, display: 'inline-grid', placeItems: 'center', flex: 'none'}}>
    <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55}>
      <path d="M7 7l10 10M17 7L7 17" fill="none" stroke={C.w} strokeWidth={3.2} strokeLinecap="round" />
    </svg>
  </span>
);
const Spinner: React.FC<{f: number; size?: number; color?: string}> = ({f, size = 22, color = C.w}) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{transform: `rotate(${f * 14}deg)`, flex: 'none'}}>
    <circle cx={12} cy={12} r={9} fill="none" stroke={color} strokeOpacity={0.3} strokeWidth={3} />
    <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
  </svg>
);

/* ───────── fundo ───────── */
const Background: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{background: C.white, overflow: 'hidden'}}>
    <AbsoluteFill
      style={{
        backgroundImage: 'radial-gradient(rgba(20,20,24,.075) 1.6px, transparent 1.7px)',
        backgroundSize: '34px 34px',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 1380 + Math.sin(f / 70) * 40,
        top: -260 + Math.cos(f / 80) * 30,
        width: 900,
        height: 900,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,71,133,.28), rgba(255,71,133,0) 65%)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: -300 + Math.cos(f / 90) * 40,
        top: 560 + Math.sin(f / 75) * 30,
        width: 960,
        height: 960,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(30,167,253,.24), rgba(30,167,253,0) 65%)',
      }}
    />
  </AbsoluteFill>
);

/* ───────── cabeçalho dos passos ───────── */
const STEPS = [
  {n: '01', t: 'Mostrar o Button', s: 'Primário, desabilitado e carregando', from: T.s1, to: T.s2},
  {n: '02', t: 'Rodar o play()', s: 'O clique acontece passo a passo', from: T.s2, to: T.s3},
  {n: '03', t: 'Painel de acessibilidade', s: 'Contraste ruim, corrigir, teste passa', from: T.s3, to: T.s4},
  {n: '04', t: 'Diff visual', s: 'Mudança de estilo detectada', from: T.s4, to: T.outro},
];

const Header: React.FC<{f: number}> = ({f}) => {
  const vis = at(f, T.s1, 14) * (1 - at(f, T.outro - 10, 14));
  const idx = STEPS.findIndex((s) => f >= s.from && f < s.to);
  return (
    <div style={{position: 'absolute', left: WIN.x, top: 44, width: WIN.w, height: 100, opacity: vis}}>
      {STEPS.map((s, i) => {
        const tIn = at(f, s.from + 4, 16, easeOut);
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
          const done = i < idx || f >= T.outro - 10;
          const on = i === idx;
          return (
            <div
              key={s.n}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 18px 10px 12px',
                borderRadius: 999,
                background: on ? C.ink : 'rgba(254,254,255,.75)',
                border: `1px solid ${on ? C.ink : 'rgba(20,20,40,.08)'}`,
                boxShadow: on ? '0 10px 24px -12px rgba(20,20,40,.5)' : 'none',
                font: `500 20px ${MONO}`,
                color: on ? C.w : done ? C.greenTxt : C.faint,
              }}
            >
              {done ? (
                <Check size={24} />
              ) : (
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    border: `2.5px solid ${on ? C.or2 : C.well2}`,
                    display: 'inline-block',
                  }}
                />
              )}
              {s.n}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ───────── botão do componente ───────── */
type BtnState = 'primary' | 'disabled' | 'loading';
const DemoButton: React.FC<{
  f: number;
  state: BtnState;
  label?: string;
  color?: string;
  radius?: number;
  hover?: number;
  press?: number;
  outline?: number;
  scale?: number;
}> = ({f, state, label = 'Enviar', color = C.w, radius = 12, hover = 0, press = 0, outline = 0, scale = 1}) => {
  const disabled = state === 'disabled';
  const bg = disabled ? C.well2 : hover > 0 ? `color-mix(in srgb, #a90f4b ${hover * 100}%, ${C.orTxt})` : C.orTxt;
  return (
    <div style={{position: 'relative', transform: `scale(${scale * (1 - press * 0.06)})`}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          height: 72,
          padding: '0 40px',
          borderRadius: radius,
          background: bg,
          color: disabled ? C.faint : color,
          font: `500 28px ${SANS}`,
          letterSpacing: '-0.01em',
          boxShadow: disabled ? 'none' : '0 14px 26px -14px rgba(208,23,95,.7)',
          whiteSpace: 'nowrap',
        }}
      >
        {state === 'loading' && <Spinner f={f} size={26} />}
        {state === 'loading' ? 'Enviando…' : label}
      </div>
      {outline > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: -10,
            borderRadius: radius + 10,
            border: `3px dashed ${C.redTxt}`,
            opacity: outline,
          }}
        />
      )}
    </div>
  );
};

/* ───────── janela do Storybook ───────── */
const STORIES = ['Primário', 'Desabilitado', 'Carregando', 'Enviar'];

const storyAt = (f: number) => {
  if (f >= T.clkEnviar + 1) return 3;
  if (f >= T.clkPrim + 1) return 0;
  if (f >= T.clkLoad + 1) return 2;
  if (f >= T.clkDis + 1) return 1;
  return 0;
};
const tabAt = (f: number) => (f >= T.tabVis + 1 ? 2 : f >= T.tabA11y + 1 ? 1 : 0);

const Window: React.FC<{f: number}> = ({f}) => {
  const tIn = at(f, T.win, 22, easeOut);
  const tOut = at(f, T.outro - 6, 22);
  const story = storyAt(f);
  const tab = tabAt(f);
  const slug = ['primario', 'desabilitado', 'carregando', 'enviar'][story];

  return (
    <div
      style={{
        position: 'absolute',
        left: WIN.x,
        top: WIN.y,
        width: WIN.w,
        height: WIN.h,
        borderRadius: 26,
        background: C.w,
        overflow: 'hidden',
        boxShadow: '0 50px 90px -40px rgba(120,60,180,.45), 0 2px 8px rgba(20,20,40,.06)',
        border: '1px solid rgba(20,20,40,.07)',
        opacity: tIn * (1 - tOut),
        transform: `translateY(${(1 - tIn) * 60 + tOut * 30}px) scale(${0.97 + tIn * 0.03 - tOut * 0.05})`,
      }}
    >
      {/* barra do navegador */}
      <div style={{height: BAR, display: 'flex', alignItems: 'center', gap: 10, padding: '0 22px', background: C.wellLt, borderBottom: `1px solid ${C.line}`}}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <span key={c} style={{width: 14, height: 14, borderRadius: '50%', background: c}} />
        ))}
        <div
          style={{
            marginLeft: 22,
            height: 32,
            flex: 1,
            maxWidth: 820,
            borderRadius: 10,
            background: C.w,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            font: `400 17px ${MONO}`,
            color: C.mut,
          }}
        >
          localhost:6006/?path=/story/<span style={{color: C.ink}}>button--{slug}</span>
        </div>
      </div>

      <div style={{position: 'absolute', left: 0, top: BAR, width: SIDE, bottom: 0, background: '#f7f7fa', borderRight: `1px solid ${C.line}`}}>
        <Sidebar f={f} story={story} />
      </div>

      {/* barra de ferramentas */}
      <div
        style={{
          position: 'absolute',
          left: SIDE,
          top: BAR,
          right: 0,
          height: TOOL,
          borderBottom: `1px solid ${C.line}`,
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          padding: '0 22px',
          color: C.faint,
          font: `400 17px ${SANS}`,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={{width: 20, height: 20, borderRadius: 5, border: `2px solid ${C.well2}`}} />
        ))}
        <span style={{marginLeft: 'auto', font: `400 16px ${MONO}`}}>Button.stories.ts</span>
      </div>

      {/* canvas */}
      <div
        style={{
          position: 'absolute',
          left: SIDE,
          top: CANVAS.y - WIN.y,
          width: CANVAS.w,
          height: CANVAS.h,
          backgroundImage: 'radial-gradient(rgba(20,20,24,.07) 1.4px, transparent 1.5px)',
          backgroundSize: '26px 26px',
        }}
      >
        <CanvasContent f={f} story={story} />
      </div>

      {/* painel de addons */}
      <div
        style={{
          position: 'absolute',
          left: SIDE,
          top: PANEL_Y - WIN.y,
          right: 0,
          bottom: 0,
          borderTop: `1px solid ${C.line}`,
          background: C.w,
        }}
      >
        <div style={{height: 52, position: 'relative', borderBottom: `1px solid ${C.line}`}}>
          {TABS.map((t, i) => (
            <div
              key={t.id}
              style={{
                position: 'absolute',
                left: t.x,
                top: 0,
                width: t.w,
                height: 52,
                display: 'grid',
                placeItems: 'center',
                font: `${i === tab ? 600 : 400} 19px ${SANS}`,
                color: i === tab ? C.orTxt : C.mut,
                borderBottom: i === tab ? `3px solid ${C.or}` : '3px solid transparent',
              }}
            >
              <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                {t.label}
                <TabBadge f={f} i={i} />
              </span>
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 52, bottom: 0, padding: '18px 26px'}}>
          {tab === 0 && <InteractionsPanel f={f} story={story} />}
          {tab === 1 && <A11yPanel f={f} />}
          {tab === 2 && <VisualPanel f={f} />}
        </div>
      </div>
    </div>
  );
};

const TabBadge: React.FC<{f: number; i: number}> = ({f, i}) => {
  let txt: string | null = null;
  let bg = C.wellLt;
  let fg = C.mut;
  if (i === 0 && f >= T.pass) {
    txt = '3';
    bg = C.greenSoft;
    fg = C.greenTxt;
  }
  if (i === 1 && f >= T.viol && f < T.fixed) {
    txt = '1';
    bg = C.redSoft;
    fg = C.redTxt;
  }
  if (i === 2 && f >= T.visDone && f < T.clkAccept + 2) {
    txt = '1';
    bg = C.amberSoft;
    fg = C.amber;
  }
  if (!txt) return null;
  return <span style={{minWidth: 24, height: 24, padding: '0 7px', borderRadius: 12, background: bg, color: fg, font: `600 14px/24px ${SANS}`, textAlign: 'center'}}>{txt}</span>;
};

const Sidebar: React.FC<{f: number; story: number}> = ({f, story}) => {
  const hover = (i: number) => {
    const p = cursorPos(f);
    return p.x > WIN.x + 12 && p.x < WIN.x + SIDE - 12 && Math.abs(p.y - itemCY(i)) < ITEM_H / 2 && f > 110;
  };
  return (
    <div style={{padding: '22px 16px', font: `400 19px ${SANS}`, color: C.ink}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px'}}>
        <span style={{width: 34, height: 34, borderRadius: 9, background: C.or, display: 'grid', placeItems: 'center', color: C.w, font: `600 21px ${SANS}`}}>S</span>
        <span style={{font: `600 22px ${SANS}`, letterSpacing: '-0.02em'}}>Storybook</span>
      </div>
      <div style={{marginTop: 22, height: 42, borderRadius: 10, background: C.w, border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', padding: '0 14px', color: C.faint, font: `400 17px ${SANS}`}}>
        Buscar stories
      </div>
      <div style={{marginTop: 26, padding: '0 8px', font: `600 14px ${SANS}`, letterSpacing: '.12em', color: C.faint}}>COMPONENTES</div>
      <div style={{marginTop: 12, display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', height: 40, font: `500 19px ${SANS}`}}>
        <svg viewBox="0 0 24 24" width={18} height={18}>
          <path d="M8 10l4 4 4-4" fill="none" stroke={C.mut} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{width: 18, height: 18, borderRadius: 4, background: C.blue, opacity: 0.85}} />
        Button
      </div>
      <div style={{position: 'absolute', left: 16, right: 16, top: ITEM_Y0 - BODY_Y}}>
        {STORIES.map((s, i) => {
          const sel = i === story;
          const ok = i === 3 && f >= T.pass;
          return (
            <div
              key={s}
              style={{
                height: ITEM_H - 4,
                marginBottom: 4,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                paddingLeft: 40,
                paddingRight: 14,
                background: sel ? C.or : hover(i) ? C.orSoft : 'transparent',
                color: sel ? C.w : C.ink2,
                font: `${sel ? 500 : 400} 19px ${SANS}`,
              }}
            >
              <span style={{width: 12, height: 12, borderRadius: 3, border: `2px solid ${sel ? C.w : C.lilac}`, transform: 'rotate(45deg)'}} />
              {s}
              {ok && (
                <span style={{marginLeft: 'auto'}}>
                  <Check size={20} bg={sel ? C.w : C.green} color={sel ? C.green : C.w} />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* estilo do botão conforme as edições de código */
const buttonColor = (f: number) => {
  if (f >= T.save2 + 2) return '#ffffff';
  if (f >= T.save1 + 2) return '#ff8ab3';
  return '#ffffff';
};
const buttonRadius = (f: number) => mix(12, 36, at(f, T.save3 + 2, 14, easeOut));

const CanvasContent: React.FC<{f: number; story: number}> = ({f, story}) => {
  // passo 4: comparação base × novo
  if (f >= T.visDone) {
    const t = at(f, T.visDone, 16, easeOut);
    const diff = f >= T.visDone + 24 && f < T.clkAccept + 2 ? 0.55 + 0.35 * Math.sin((f - T.visDone) / 6) : 0;
    const accepted = at(f, T.clkAccept + 2, 12);
    const frame = (title: string, sub: string, radius: number, showDiff: boolean) => (
      <div style={{width: 470, height: 290, borderRadius: 18, background: C.w, border: `1px solid ${C.line}`, boxShadow: '0 20px 40px -26px rgba(20,20,60,.35)', overflow: 'hidden', position: 'relative'}}>
        <div style={{height: 44, display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px', borderBottom: `1px solid ${C.line}`, font: `500 17px ${SANS}`, color: C.ink}}>
          {title}
          <span style={{font: `400 15px ${MONO}`, color: C.faint}}>{sub}</span>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 44, bottom: 0, display: 'grid', placeItems: 'center'}}>
          <div style={{position: 'relative'}}>
            {showDiff && (
              <div style={{position: 'absolute', inset: 0, borderRadius: 12, background: '#22e3a1', opacity: diff}} />
            )}
            <div style={{position: 'relative'}}>
              <DemoButton f={f} state="primary" radius={radius} />
            </div>
          </div>
        </div>
      </div>
    );
    return (
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, opacity: t, transform: `translateY(${(1 - t) * 16}px)`}}>
        {frame('Base', accepted > 0.5 ? 'anterior' : 'aceita', 12, false)}
        <svg viewBox="0 0 24 24" width={36} height={36}>
          <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke={C.faint} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {frame('Novo', accepted > 0.5 ? 'nova base' : 'esta mudança', 36, true)}
        {diff > 0 && (
          <div style={{position: 'absolute', right: 70, top: 26, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderRadius: 999, background: '#d7fbe9', color: '#0b7a52', font: `500 17px ${SANS}`}}>
            <span style={{width: 14, height: 14, borderRadius: 4, background: '#22e3a1'}} /> pixels diferentes
          </div>
        )}
      </div>
    );
  }

  const state: BtnState = story === 1 ? 'disabled' : story === 2 ? 'loading' : 'primary';
  const swap = Math.min(...[T.clkDis, T.clkLoad, T.clkPrim, T.clkEnviar].map((c) => (f >= c + 1 ? (f - c - 1) / 10 : 1)), 1);
  const p = cursorPos(f);
  const hoverOn = state === 'primary' && Math.abs(p.x - BTN_C.x) < 120 && Math.abs(p.y - BTN_C.y) < 40 && f < T.s2;
  const hover = hoverOn ? 1 : 0;
  // clique simulado pelo play()
  const playPress = f >= T.st2 + 4 && f <= T.st2 + 12 ? 1 - Math.abs(f - T.st2 - 8) / 4 : 0;
  const ringT = (f - T.st2 - 6) / 20;
  const toast = story === 3 && f < T.s3 ? at(f, T.st3 - 10, 10, easeOut) : 0;
  const outline = f >= T.viol + 4 && f < T.save2 + 2 ? at(f, T.viol + 4, 10) : 0;
  const disabledCursor = state === 'disabled' && Math.abs(p.x - BTN_C.x) < 120 && Math.abs(p.y - BTN_C.y) < 40;
  const fadeToVis = 1 - at(f, T.visDone - 14, 12);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: fadeToVis}}>
      <div
        style={{
          position: 'absolute',
          left: BTN_C.x - CANVAS.x,
          top: BTN_C.y - CANVAS.y,
          transform: 'translate(-50%,-50%)',
          opacity: 0.2 + 0.8 * swap,
        }}
      >
        <DemoButton f={f} state={state} color={buttonColor(f)} radius={buttonRadius(f)} hover={hover} press={playPress} outline={outline} />
        {story === 3 && ringT > 0 && ringT < 1 && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 90,
              height: 90,
              marginLeft: -45,
              marginTop: -45,
              borderRadius: '50%',
              border: `4px solid ${C.blue}`,
              opacity: 1 - ringT,
              transform: `scale(${0.4 + ringT * 1.4})`,
            }}
          />
        )}
        {disabledCursor && (
          <div style={{position: 'absolute', left: '100%', top: -42, marginLeft: -20, padding: '6px 12px', borderRadius: 8, background: C.ink, color: C.w, font: `400 15px ${MONO}`, whiteSpace: 'nowrap'}}>
            disabled
          </div>
        )}
      </div>
      {toast > 0 && (
        <div
          style={{
            position: 'absolute',
            left: BTN_C.x - CANVAS.x,
            top: BTN_C.y - CANVAS.y + 84,
            transform: `translate(-50%, ${(1 - toast) * 14}px)`,
            opacity: toast,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 22px 12px 14px',
            borderRadius: 14,
            background: C.greenSoft,
            color: C.greenTxt,
            font: `500 24px ${SANS}`,
          }}
        >
          <Check size={28} /> Enviado!
        </div>
      )}
      {story === 3 && f >= T.st1 && f < T.s3 && (
        <div style={{position: 'absolute', left: 24, top: 18, display: 'flex', alignItems: 'center', gap: 10, font: `400 16px ${MONO}`, color: C.mut}}>
          {f < T.pass ? <Spinner f={f} size={18} color={C.blue} /> : <Check size={18} />}
          {f < T.pass ? 'executando play()…' : 'play() concluído'}
        </div>
      )}
    </div>
  );
};

/* ───────── painel: interações ───────── */
const InteractionsPanel: React.FC<{f: number; story: number}> = ({f, story}) => {
  if (story !== 3) {
    return (
      <div style={{display: 'flex', alignItems: 'center', gap: 14, height: '100%', paddingBottom: 30, color: C.mut, font: `400 20px ${SANS}`}}>
        <span style={{font: `400 18px ${MONO}`, padding: '4px 10px', borderRadius: 8, background: C.wellLt, color: C.ink2}}>{STORIES[story]}</span>
        Esta story não tem função <code style={{font: `500 18px ${MONO}`, color: C.orTxt}}>play()</code>. Só renderiza o estado.
      </div>
    );
  }
  const rows = [
    {start: T.st1, code: <>render <span style={{color: C.mut}}>{'{ label: '}</span><span style={{color: C.greenTxt}}>'Enviar'</span><span style={{color: C.mut}}>{' }'}</span></>},
    {start: T.st2, code: <><span style={{color: C.blueTxt}}>userEvent</span>.click(<span style={{color: C.ink}}>button</span>)</>},
    {start: T.st3, code: <><span style={{color: C.blueTxt}}>expect</span>(getByText(<span style={{color: C.greenTxt}}>'Enviado!'</span>)).<span style={{color: C.orTxt}}>toBeVisible</span>()</>},
  ];
  const p = cursorPos(f);
  return (
    <div>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, height: 40, font: `500 19px ${SANS}`, color: C.ink}}>
        {f < T.pass ? (
          <>
            <Spinner f={f} size={22} color={C.blue} />
            <span style={{color: C.blueTxt}}>Executando</span>
          </>
        ) : (
          <>
            <Check size={24} />
            <span style={{color: C.greenTxt}}>Passou</span>
            <span style={{color: C.mut, fontWeight: 400}}>3 de 3 passos · 412 ms</span>
          </>
        )}
      </div>
      <div style={{marginTop: 10}}>
        {rows.map((r, i) => {
          const o = at(f, r.start, 10, easeOut);
          if (o <= 0) return null;
          const done = f >= r.start + 14;
          const rowY = PANEL_Y + 52 + 18 + 50 + i * 46;
          const hov = f > T.pass && Math.abs(p.y - (rowY + 23)) < 22 && p.x > CANVAS.x;
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                height: 46,
                padding: '0 14px',
                borderRadius: 10,
                background: hov ? C.blueSoft : 'transparent',
                opacity: o,
                transform: `translateX(${(1 - o) * -16}px)`,
                font: `400 20px ${MONO}`,
                color: C.ink,
              }}
            >
              <span style={{width: 28, color: C.faint, font: `400 17px ${MONO}`}}>{i + 1}</span>
              {done ? <Check size={22} /> : <Spinner f={f} size={22} color={C.blue} />}
              <span>{r.code}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ───────── painel: acessibilidade ───────── */
const A11yPanel: React.FC<{f: number}> = ({f}) => {
  const bad = f >= T.viol && f < T.fixed;
  const fixed = f >= T.fixed;
  const scanning = (f >= T.save1 + 2 && f < T.viol) || (f >= T.save2 + 2 && f < T.fixed);
  const o = at(f, bad ? T.viol : fixed ? T.fixed : T.tabA11y, 10, easeOut);
  const counts = bad ? [1, 22, 0] : [0, 23, 0];
  const p = cursorPos(f);
  const hovRow = bad && Math.abs(p.y - (PANEL_Y + 52 + 18 + 96)) < 50 && p.x > CANVAS.x && p.x < CANVAS.x + 1100;
  return (
    <div>
      <div style={{display: 'flex', gap: 12, height: 40, alignItems: 'center'}}>
        {[
          {l: 'Violações', c: C.redTxt, bg: C.redSoft},
          {l: 'Passaram', c: C.greenTxt, bg: C.greenSoft},
          {l: 'Incompletos', c: C.amber, bg: C.amberSoft},
        ].map((b, i) => (
          <span
            key={b.l}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              height: 36,
              padding: '0 16px',
              borderRadius: 999,
              background: i === 0 && !bad ? C.wellLt : b.bg,
              color: i === 0 && !bad ? C.mut : b.c,
              font: `500 17px ${SANS}`,
            }}
          >
            {b.l} <b style={{font: `600 17px ${SANS}`}}>{counts[i]}</b>
          </span>
        ))}
        <span style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, font: `400 16px ${MONO}`, color: C.faint}}>
          {scanning ? <Spinner f={f} size={18} color={C.blue} /> : null}
          axe-core 4.10 · WCAG 2.1 AA
        </span>
      </div>
      <div style={{marginTop: 16, opacity: scanning ? 0.35 : o, transform: `translateY(${(1 - o) * 10}px)`}}>
        {bad ? (
          <div style={{borderRadius: 14, border: `1px solid ${hovRow ? '#f3b4b4' : '#f6caca'}`, background: hovRow ? '#fff0f0' : '#fff7f7', padding: '16px 20px', display: 'flex', gap: 18}}>
            <Cross size={28} />
            <div style={{flex: 1}}>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
                <span style={{font: `500 20px ${MONO}`, color: C.redTxt}}>color-contrast</span>
                <span style={{font: `500 20px ${SANS}`, color: C.ink}}>O texto precisa ter contraste suficiente</span>
                <span style={{marginLeft: 'auto', font: `500 15px ${SANS}`, padding: '3px 10px', borderRadius: 6, background: C.redSoft, color: C.redTxt}}>sério</span>
              </div>
              <div style={{marginTop: 10, display: 'flex', gap: 28, font: `400 18px ${SANS}`, color: C.mut}}>
                <span>
                  Contraste <b style={{color: C.redTxt, fontWeight: 600}}>2,40:1</b> · mínimo <b style={{color: C.ink, fontWeight: 600}}>4,5:1</b>
                </span>
                <span style={{font: `400 17px ${MONO}`}}>
                  texto <Swatch c="#ff8ab3" /> #ff8ab3 sobre <Swatch c={C.orTxt} /> #d0175f
                </span>
              </div>
              <div style={{marginTop: 8, font: `400 16px ${MONO}`, color: C.faint}}>&lt;button class="btn"&gt;Enviar&lt;/button&gt;</div>
            </div>
          </div>
        ) : (
          <div style={{borderRadius: 14, border: `1px solid #bfe6cc`, background: '#f4fcf6', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 18}}>
            <Check size={28} />
            <div>
              <div style={{font: `500 20px ${SANS}`, color: C.greenTxt}}>
                {fixed ? 'Corrigido: nenhuma violação encontrada' : 'Nenhuma violação encontrada'}
              </div>
              <div style={{marginTop: 6, font: `400 18px ${SANS}`, color: C.mut}}>
                {fixed ? (
                  <>
                    Contraste <b style={{color: C.greenTxt, fontWeight: 600}}>5,29:1</b> · texto <Swatch c="#ffffff" /> <span style={{fontFamily: MONO}}>#ffffff</span> sobre <Swatch c={C.orTxt} /> <span style={{fontFamily: MONO}}>#d0175f</span>
                  </>
                ) : (
                  '23 regras verificadas na story Enviar'
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
const Swatch: React.FC<{c: string}> = ({c}) => (
  <span style={{display: 'inline-block', width: 16, height: 16, borderRadius: 4, background: c, border: '1px solid rgba(20,20,40,.18)', verticalAlign: '-2px', margin: '0 4px'}} />
);

/* ───────── painel: testes visuais ───────── */
const VisualPanel: React.FC<{f: number}> = ({f}) => {
  const prog = interpolate(f, [T.tabVis + 4, T.visDone - 4], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const done = f >= T.visDone;
  const accepted = f >= T.clkAccept + 2;
  const p = cursorPos(f);
  const hovAccept = Math.abs(p.x - ACCEPT.x) < 70 && Math.abs(p.y - ACCEPT.y) < 24 && !accepted;
  if (!done) {
    return (
      <div>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, height: 40, font: `500 19px ${SANS}`, color: C.blueTxt}}>
          <Spinner f={f} size={22} color={C.blue} /> Capturando e comparando com a base…
          <span style={{marginLeft: 'auto', font: `400 17px ${MONO}`, color: C.faint}}>{Math.round(prog * 4)} de 4 stories</span>
        </div>
        <div style={{marginTop: 18, height: 10, borderRadius: 5, background: C.wellLt, overflow: 'hidden'}}>
          <div style={{width: `${prog * 100}%`, height: '100%', background: GRAD}} />
        </div>
        <div style={{marginTop: 18, display: 'flex', gap: 12}}>
          {STORIES.map((s, i) => (
            <span key={s} style={{display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 10, background: C.wellLt, font: `400 17px ${SANS}`, color: prog * 4 > i + 0.5 ? C.ink : C.faint}}>
              {prog * 4 > i + 0.5 ? <Check size={18} /> : <Spinner f={f} size={18} color={C.faint} />}
              {s}
            </span>
          ))}
        </div>
      </div>
    );
  }
  const o = at(f, T.visDone, 10, easeOut);
  return (
    <div style={{opacity: o}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, height: 40, font: `500 19px ${SANS}`}}>
        {accepted ? (
          <>
            <Check size={24} />
            <span style={{color: C.greenTxt}}>Mudança aceita: o novo visual virou a base</span>
          </>
        ) : (
          <>
            <span style={{width: 24, height: 24, borderRadius: '50%', background: C.amber, color: C.w, display: 'grid', placeItems: 'center', font: `600 16px ${SANS}`}}>!</span>
            <span style={{color: C.amber}}>1 mudança detectada</span>
            <span style={{color: C.mut, fontWeight: 400}}>3 stories sem mudança</span>
          </>
        )}
      </div>
      <div style={{marginTop: 16, display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderRadius: 14, border: `1px solid ${C.line}`, background: '#fbfbfd'}}>
        <span style={{font: `500 19px ${SANS}`, color: C.ink}}>Button / Enviar</span>
        <span style={{font: `400 17px ${MONO}`, color: C.mut}}>border-radius: 12px → 36px · 2,1% dos pixels</span>
        {!accepted && (
          <div style={{marginLeft: 'auto', display: 'flex', gap: 12}}>
            <span style={{padding: '8px 18px', borderRadius: 10, border: `1px solid ${C.line}`, font: `500 17px ${SANS}`, color: C.mut, background: C.w}}>Recusar</span>
            <span
              style={{
                padding: '8px 22px',
                borderRadius: 10,
                font: `500 17px ${SANS}`,
                color: C.w,
                background: hovAccept ? '#11843c' : C.green,
                boxShadow: '0 8px 16px -10px rgba(22,163,74,.8)',
              }}
            >
              Aceitar
            </span>
          </div>
        )}
        {accepted && (
          <span style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, font: `500 17px ${SANS}`, color: C.greenTxt}}>
            <Check size={20} /> aceito
          </span>
        )}
      </div>
    </div>
  );
};

/* ───────── editor de código flutuante ───────── */
const CodeCard: React.FC<{f: number}> = ({f}) => {
  const tIn = at(f, T.codeIn, 16, easeOut);
  const tOut = at(f, T.codeOut, 12);
  const hiddenMid = f >= T.save2 + 40 && f < T.edit3 - 14; // some entre os passos 3 e 4
  const midOut = at(f, T.save2 + 40, 12);
  const midIn = at(f, T.edit3 - 14, 12, easeOut);
  const o = tIn * (1 - tOut) * (f < T.save2 + 40 ? 1 : f < T.edit3 - 14 ? 1 - midOut : midIn);
  if (o <= 0 || (hiddenMid && midOut >= 1)) return null;

  const c1 = f < T.edit2 ? typed(f, T.edit1, '#ffffff', '#ff8ab3') : typed(f, T.edit2, '#ff8ab3', '#ffffff');
  const r = typed(f, T.edit3, '12', '36', 4);
  const saves = [T.save1, T.save2, T.save3];
  const lastSave = saves.filter((s) => f >= s).pop();
  const saved = lastSave !== undefined && f - lastSave < 40;
  const dirty = (f >= T.edit1 && f < T.save1) || (f >= T.edit2 && f < T.save2) || (f >= T.edit3 && f < T.save3);
  const caret = (on: boolean) =>
    on && Math.floor(f / 8) % 2 === 0 ? <span style={{display: 'inline-block', width: 3, height: 30, background: C.or, verticalAlign: '-6px', marginLeft: 1}} /> : null;

  const ln = (n: number, body: React.ReactNode, hl = false) => (
    <div style={{display: 'flex', height: 42, alignItems: 'center', background: hl ? 'rgba(255,71,133,.09)' : 'transparent', paddingRight: 20}}>
      <span style={{width: 50, textAlign: 'right', paddingRight: 18, color: C.faint}}>{n}</span>
      <span style={{whiteSpace: 'pre'}}>{body}</span>
    </div>
  );
  const editingColor = f >= T.edit1 && f < T.save2 + 40;
  const editingRadius = f >= T.edit3 - 14;

  return (
    <div
      style={{
        position: 'absolute',
        left: 1296,
        top: 300,
        width: 470,
        borderRadius: 22,
        background: C.ink,
        color: '#e8e8ef',
        overflow: 'hidden',
        boxShadow: '0 40px 70px -30px rgba(20,20,60,.6)',
        opacity: o,
        transform: `translateY(${(1 - Math.min(tIn, 1)) * 24}px)`,
        zIndex: 40,
        font: `400 22px ${MONO}`,
      }}
    >
      <div style={{height: 50, display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,.08)', font: `400 17px ${MONO}`, color: C.mutDk}}>
        Button.tsx{dirty && <span style={{width: 9, height: 9, borderRadius: '50%', background: C.or2}} />}
        {saved && (
          <span style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, color: '#7ee2a1'}}>
            <Check size={18} /> salvo · HMR
          </span>
        )}
      </div>
      <div style={{padding: '12px 0'}}>
        {ln(8, <><span style={{color: '#c792ea'}}>const</span> estilo = {'{'}</>)}
        {ln(9, <>  background: <span style={{color: '#a5e3a0'}}>'#d0175f'</span>,</>)}
        {ln(
          10,
          <>
            {'  '}color: <span style={{color: '#a5e3a0'}}>'{c1.text}{caret(c1.editing)}'</span>,
          </>,
          editingColor,
        )}
        {ln(
          11,
          <>
            {'  '}borderRadius: <span style={{color: '#f6b26b'}}>{r.text}{caret(r.editing)}</span>,
          </>,
          editingRadius,
        )}
        {ln(12, <>{'};'}</>)}
      </div>
    </div>
  );
};

/* ───────── abertura e encerramento ───────── */
const Intro: React.FC<{f: number}> = ({f}) => {
  const a = at(f, 4, 20, easeOut);
  const b = at(f, 14, 20, easeOut);
  const out = at(f, 66, 16);
  if (out >= 1) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - out, transform: `translateY(${-out * 30}px)`}}>
      <div style={{font: `500 26px ${MONO}`, color: C.orTxt, opacity: a, letterSpacing: '.04em'}}>DEMO · STORYBOOK TEST</div>
      <div
        style={{
          marginTop: 18,
          font: `600 112px/1.02 ${SANS}`,
          letterSpacing: '-0.055em',
          color: C.ink,
          opacity: a,
          transform: `translateY(${(1 - a) * 30}px)`,
          textAlign: 'center',
        }}
      >
        Um componente,{' '}
        <span style={{background: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>três testes</span>
      </div>
      <div style={{marginTop: 26, font: `400 32px ${SANS}`, color: C.mut, opacity: b, transform: `translateY(${(1 - b) * 20}px)`}}>
        Interação, acessibilidade e regressão visual
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{f: number}> = ({f}) => {
  const s = T.outro + 10;
  const a = at(f, s, 20, easeOut);
  const chips = [
    {l: 'Interação', d: 'play() passou'},
    {l: 'Acessibilidade', d: 'contraste 5,29:1'},
    {l: 'Visual', d: 'nova base aceita'},
  ];
  const lim = at(f, s + 50, 18, easeOut);
  if (f < s) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{font: `600 96px/1.04 ${SANS}`, letterSpacing: '-0.05em', color: C.ink, opacity: a, transform: `translateY(${(1 - a) * 30}px)`, textAlign: 'center'}}>
        A mesma story,{' '}
        <span style={{background: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>três verificações</span>
      </div>
      <div style={{marginTop: 54, display: 'flex', gap: 24}}>
        {chips.map((c, i) => {
          const t = at(f, s + 16 + i * 8, 16, easeOut);
          return (
            <div
              key={c.l}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '22px 30px 22px 22px',
                borderRadius: 24,
                background: 'rgba(254,254,255,.85)',
                border: '1px solid rgba(254,254,255,.9)',
                boxShadow: '0 30px 60px -30px rgba(181,124,240,.4)',
                opacity: t,
                transform: `scale(${0.88 + t * 0.12})`,
              }}
            >
              <Check size={42} />
              <div>
                <div style={{font: `600 30px ${SANS}`, color: C.ink, letterSpacing: '-0.02em'}}>{c.l}</div>
                <div style={{font: `400 21px ${SANS}`, color: C.mut}}>{c.d}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{marginTop: 54, font: `400 30px ${SANS}`, color: C.mut, opacity: lim, transform: `translateY(${(1 - lim) * 14}px)`}}>
        <b style={{color: C.ink, fontWeight: 600}}>Limite:</b> isso cobre UI. Para UX, só testando com pessoas reais.
      </div>
    </AbsoluteFill>
  );
};

/* ───────── composição ───────── */
export const DemoStorybook: React.FC = () => {
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
      <Outro f={f} />
      <Cursor f={f} />
    </AbsoluteFill>
  );
};

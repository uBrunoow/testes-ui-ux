/*
 * Grava a demo do Storybook (tela real) com o Playwright.
 *
 * Pré-requisitos: `npm run storybook` rodando em localhost:6006.
 * Uso: node scripts/gravar-demo.cjs <pasta-de-saída>
 *
 * Saída: frames JPEG do screencast (CDP), frames.txt para o ffmpeg e
 * eventos.json com o instante (em segundos) de cada passo da demo.
 * O botão é editado de verdade em src/components/button.css durante a
 * gravação (o Storybook recarrega via HMR) e o arquivo é restaurado no fim.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUT = path.resolve(process.argv[2] || 'gravacao');
const ROOT = path.resolve(__dirname, '..');
const CSS = path.join(ROOT, 'src/components/button.css');
const ORIGINAL = fs.readFileSync(CSS, 'utf8');
const URL = 'http://localhost:6006/?path=/story/componentes-button--primario';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'frames'), { recursive: true });

  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
  const page = await ctx.newPage();
  await page.goto(URL);
  await page.getByRole('link', { name: 'Primário' }).or(page.getByText('Primário')).first().waitFor();
  await sleep(4000);

  // limpa status de execuções anteriores
  const clear = page.getByRole('button', { name: 'Clear all statuses' });
  if (await clear.isVisible().catch(() => false)) await clear.click();
  await page.getByRole('tab', { name: /Controls/ }).click();
  await sleep(800);

  // cursor visível (o modo headless não desenha o ponteiro)
  await page.evaluate(() => {
    const c = document.createElement('div');
    c.id = '__cur';
    c.innerHTML =
      '<svg viewBox="0 0 46 56" width="26" height="32"><path d="M6 4l34 19-15 4 9 17-7 4-9-17-11 10z" fill="#141418" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>';
    Object.assign(c.style, {
      position: 'fixed', left: '0', top: '0', zIndex: 2147483647, pointerEvents: 'none',
      transform: 'translate(900px,640px)', filter: 'drop-shadow(0 4px 6px rgba(20,20,40,.3))',
    });
    document.body.appendChild(c);
    const st = document.createElement('style');
    st.textContent =
      '@keyframes __rip{from{opacity:.9;transform:scale(.3)}to{opacity:0;transform:scale(1.2)}}' +
      '.__rip{position:fixed;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:3px solid #ff4785;pointer-events:none;z-index:2147483646;animation:__rip .5s ease-out forwards}';
    document.head.appendChild(st);
  });
  let pos = { x: 900, y: 640 };
  await page.mouse.move(pos.x, pos.y);

  const move = async (x, y, ms = 700) => {
    await page.evaluate(
      ({ x, y, ms }) => {
        const c = document.getElementById('__cur');
        c.style.transition = `transform ${ms}ms cubic-bezier(.45,0,.2,1)`;
        c.style.transform = `translate(${x - 4}px,${y - 2}px)`;
      },
      { x, y, ms },
    );
    await page.mouse.move(x, y, { steps: Math.max(4, Math.round(ms / 40)) });
    await sleep(Math.max(0, ms - 150));
    pos = { x, y };
  };
  const click = async () => {
    await page.evaluate(({ x, y }) => {
      const r = document.createElement('div');
      r.className = '__rip';
      r.style.left = x + 'px';
      r.style.top = y + 'px';
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 600);
    }, pos);
    await page.mouse.down();
    await sleep(90);
    await page.mouse.up();
  };
  const center = async (loc) => {
    const b = await loc.boundingBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  };
  const clickOn = async (loc, ms = 700, dx = 0) => {
    const c = await center(loc);
    await move(c.x + dx, c.y, ms);
    await click();
  };
  const story = (name) => page.locator('#storybook-explorer-menu').getByText(name, { exact: true });
  const frameBtn = async () => {
    const f = await page.locator('#storybook-preview-iframe').boundingBox();
    const inner = page.frameLocator('#storybook-preview-iframe').getByRole('button');
    const b = await inner.boundingBox();
    return { x: f.x + b.x + b.width / 2 + 30, y: f.y + b.y + b.height / 2 + 8 };
  };

  // ── screencast ──
  const cdp = await ctx.newCDPSession(page);
  const frames = [];
  let n = 0;
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const file = `f${String(n++).padStart(5, '0')}.jpg`;
    fs.writeFileSync(path.join(OUT, 'frames', file), Buffer.from(data, 'base64'));
    frames.push({ file, t: metadata.timestamp });
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  const events = {};
  const mark = (k) => {
    events[k] = Date.now() / 1000;
    console.log('•', k);
  };
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  mark('inicio');
  await sleep(1200);

  try {
    // ── 01 · mostrar o Button ──
    mark('passo1');
    await sleep(800);
    await clickOn(story('Desabilitado'), 900);
    await sleep(1400);
    const d = await frameBtn();
    await move(d.x, d.y, 800);
    await sleep(1200);
    await clickOn(story('Carregando'), 900);
    await sleep(2200);
    await clickOn(story('Primário'), 600);
    await sleep(900);
    const p1 = await frameBtn();
    await move(p1.x, p1.y, 800);
    await sleep(1600);

    // ── 02 · rodar o play() ──
    mark('passo2');
    await clickOn(story('Enviar'), 900);
    await sleep(1500);
    await clickOn(page.getByRole('tab', { name: /Interactions/ }), 800);
    await sleep(1800);
    await clickOn(page.getByRole('button', { name: 'Go to start' }), 800);
    mark('play-inicio');
    await sleep(1700);
    await clickOn(page.getByRole('button', { name: 'Go forward' }), 500);
    mark('play-clique');
    await sleep(2000);
    await clickOn(page.getByRole('button', { name: 'Go forward' }), 300);
    mark('play-expect');
    await sleep(2400);

    // ── 03 · painel de acessibilidade ──
    mark('passo3');
    await clickOn(page.getByRole('tab', { name: /Accessibility/ }), 900);
    await sleep(2600);
    await move(1000, 300, 900);
    mark('cor-ruim');
    fs.writeFileSync(CSS, ORIGINAL.replace('color: #ffffff;', 'color: #ff8ab3;'));
    await sleep(3200);
    await clickOn(page.getByText('Color contrast', { exact: true }), 900);
    mark('violacao');
    await sleep(4200);
    await move(1000, 300, 800);
    mark('cor-corrigida');
    fs.writeFileSync(CSS, ORIGINAL);
    await sleep(3800);

    // ── 04 · diff visual com Vitest ──
    mark('passo4');
    await clickOn(page.getByRole('button', { name: 'Run tests' }).first(), 1000);
    mark('rodando1');
    await page.locator('[aria-label="Test status: Success"]').first().waitFor({ timeout: 60000 }).catch(() => {});
    await sleep(2200);
    await move(1000, 300, 900);
    mark('raio');
    fs.writeFileSync(CSS, ORIGINAL.replace('border-radius: 12px;', 'border-radius: 999px;'));
    await sleep(2800);
    await clickOn(page.getByRole('button', { name: 'Run tests' }).first(), 1000);
    mark('rodando2');
    await page.locator('[aria-label="Test status: Error"]').first().waitFor({ timeout: 60000 }).catch(() => {});
    await sleep(1500);
    await clickOn(page.getByRole('button', { name: 'Expand testing module' }), 800);
    mark('falhou');
    await sleep(2500);
    await move(1000, 300, 900);
    mark('diff');
    await sleep(7000);
    // aceitar a mudança: atualiza as capturas de referência
    mark('aceitar');
    execSync('npx vitest run --project=storybook -u', { cwd: ROOT, stdio: 'ignore', env: process.env });
    await clickOn(page.getByRole('button', { name: 'Start test run' }).or(page.getByRole('button', { name: 'Run tests' })).first(), 800);
    mark('rodando3');
    await sleep(800);
    await page.locator('[aria-label="Test status: Error"]').first().waitFor({ state: 'detached', timeout: 60000 }).catch(() => {});
    await sleep(3500);
    mark('fim');
  } finally {
    await cdp.send('Page.stopScreencast').catch(() => {});
    fs.writeFileSync(CSS, ORIGINAL);
    await browser.close();
  }

  // frames.txt (durações reais) + eventos relativos ao primeiro frame
  const t0 = frames[0].t;
  const lines = [];
  frames.forEach((f, i) => {
    const next = i < frames.length - 1 ? frames[i + 1].t : events.fim + 0.5;
    lines.push(`file 'frames/${f.file}'`, `duration ${Math.max(0.001, next - f.t).toFixed(4)}`);
  });
  lines.push(`file 'frames/${frames[frames.length - 1].file}'`);
  fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n') + '\n');
  const rel = Object.fromEntries(Object.entries(events).map(([k, v]) => [k, +(v - t0).toFixed(3)]));
  fs.writeFileSync(path.join(OUT, 'eventos.json'), JSON.stringify(rel, null, 2));
  console.log(`${frames.length} frames · ${rel.fim.toFixed(1)} s`);
})();

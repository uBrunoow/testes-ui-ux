#!/usr/bin/env node
/*
 * Fotografa cada slide de um deck no estado final (todos os passos revelados),
 * monta uma folha de contato e aponta problemas de layout.
 *
 * Uso:
 *   node capturas.cjs <deck.html> [pasta-de-saída] [--slides 3,5,8] [--escala 0.5]
 *
 * Saída: slide-01.png … slide-NN.png, folha.png (todos lado a lado) e
 * relatorio.txt (avisos). Sai com código 1 se houver erro de layout.
 *
 * Usa o Playwright. Se o Chromium dele não estiver instalado, aponte outro com
 * PW_CHROMIUM=/caminho/do/chrome.
 */
const path = require('path');
const fs = require('fs');

let chromium;
try { ({ chromium } = require('playwright')); }
catch (e) {
  try { ({ chromium } = require(require.resolve('playwright', { paths: [process.cwd(), '/opt/node22/lib/node_modules', '/usr/lib/node_modules', '/usr/local/lib/node_modules'] }))); }
  catch (e2) { console.error('Playwright não encontrado. Instale com: npm i -D playwright && npx playwright install chromium'); process.exit(2); }
}

const args = process.argv.slice(2);
const deck = args[0];
if (!deck) { console.error('Uso: node capturas.cjs <deck.html> [saída] [--slides 1,2] [--escala 0.5]'); process.exit(2); }
const out = path.resolve(args[1] && !args[1].startsWith('--') ? args[1] : 'capturas');
const opt = k => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : null; };
const only = opt('--slides') ? opt('--slides').split(',').map(Number) : null;
const escala = +(opt('--escala') || 0.5);
const url = /^https?:/.test(deck) ? deck : 'file://' + path.resolve(deck);

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const erros = [];
  page.on('pageerror', e => erros.push('JS: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|favicon|ERR_|net::/.test(m.text())) erros.push('console: ' + m.text()); });
  await page.goto(url + (url.includes('?') ? '&' : '?') + 'pdf');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);

  // checagens de layout, slide a slide
  const avisos = await page.evaluate(() => {
    const res = [];
    const IGN = '.orb,.cable,.wires,.num,.hdr,.ftr,.hdr *,.ftr *,.cursor,.vid.big,svg *,.sr';
    document.querySelectorAll('.slide').forEach((s, k) => {
      const n = k + 1, r0 = s.getBoundingClientRect();
      const nome = el => (el.className && typeof el.className === 'string' ? el.tagName.toLowerCase() + '.' + el.className.trim().split(/\s+/).join('.') : el.tagName.toLowerCase()) + (el.textContent.trim() ? ` "${el.textContent.trim().replace(/\s+/g, ' ').slice(0, 40)}"` : '');
      s.querySelectorAll('*').forEach(el => {
        if (el.matches(IGN)) return;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const x = r.left - r0.left, y = r.top - r0.top, x2 = x + r.width, y2 = y + r.height;
        if (x < -2 || y < -2 || x2 > 1922 || y2 > 1082) res.push(`ERRO slide ${n}: sai do quadro (${Math.round(x)},${Math.round(y)} → ${Math.round(x2)},${Math.round(y2)}): ${nome(el)}`);
        else if (el.children.length === 0 && el.textContent.trim() && (y < 100 || y2 > 1000)) res.push(`AVISO slide ${n}: texto na faixa do cabeçalho/rodapé (y ${Math.round(y)}–${Math.round(y2)}): ${nome(el)}`);
        if (el.matches('.ln') && el.scrollWidth > el.clientWidth + 2) res.push(`ERRO slide ${n}: linha de título cortada (${el.scrollWidth}px de texto em ${el.clientWidth}px): ${nome(el)}`);
        else if ((cs.overflow === 'hidden' || cs.overflow === 'clip') && el.scrollWidth > el.clientWidth + 2 && !el.matches('.lw,.code,.term,.frame,.slide,.vid')) res.push(`AVISO slide ${n}: conteúdo cortado na horizontal: ${nome(el)}`);
      });
      // texto sobreposto a um bloco (cartão, código, vídeo) que não o contém
      const BLOCO = '.card,.code,.term,.duo,.hot-card,.ink-card,.vid,.stage';
      const vis = el => { const c = getComputedStyle(el); return c.display !== 'none' && c.visibility !== 'hidden' && +c.opacity > 0; };
      const blocos = [...s.querySelectorAll(BLOCO)].filter(b => !b.matches(IGN) && vis(b));
      const textos = [...s.querySelectorAll('h1,h2,h3,p,li,.lw,span,b,small')].filter(t => !t.matches(IGN) && t.children.length === 0 && t.textContent.trim() && vis(t));
      const ja = new Set();
      textos.forEach(t => {
        const rg = document.createRange(); rg.selectNodeContents(t);
        const rt = rg.getBoundingClientRect(), dono = t.closest(BLOCO); // área do texto, não da caixa
        blocos.forEach(bl => {
          if (bl.contains(t) || (dono && (dono.contains(bl) || bl.contains(dono)))) return;
          const rb = bl.getBoundingClientRect();
          const ox = Math.min(rt.right, rb.right) - Math.max(rt.left, rb.left), oy = Math.min(rt.bottom, rb.bottom) - Math.max(rt.top, rb.top);
          const key = nome(t) + '|' + nome(bl);
          if (ox > 6 && oy > 6 && !ja.has(key)) { ja.add(key); res.push(`AVISO slide ${n}: texto sobre outro bloco (confira na captura se é intencional):${nome(t)} × ${nome(bl).slice(0, 60)}`); }
        });
      });
      const words = (s.innerText || '').replace(/\s+/g, ' ').trim().split(' ').length;
      if (words > 110) res.push(`AVISO slide ${n}: ${words} palavras visíveis (ideal até ~80; mova o resto para data-notes)`);
      if (!s.dataset.title) res.push(`AVISO slide ${n}: sem data-title`);
      if (!s.dataset.notes) res.push(`AVISO slide ${n}: sem data-notes (notas do apresentador)`);
    });
    return res;
  });

  const frames = await page.$$('.frame');
  const tiros = [];
  for (let i = 0; i < frames.length; i++) {
    if (only && !only.includes(i + 1)) continue;
    const f = path.join(out, `slide-${String(i + 1).padStart(2, '0')}.png`);
    await frames[i].screenshot({ path: f, scale: 'css' });
    tiros.push(f);
  }

  // folha de contato
  if (tiros.length > 1) {
    const w = Math.round(1920 * escala), h = Math.round(1080 * escala), cols = 3;
    const html = `<body style="margin:0;background:#ddd;display:grid;grid-template-columns:repeat(${cols},${w}px);gap:12px;padding:12px;font:600 18px sans-serif">` +
      tiros.map(t => `<figure style="margin:0;position:relative"><img src="file://${t}" style="width:${w}px;height:${h}px;display:block;border-radius:10px"><figcaption style="position:absolute;left:8px;top:8px;background:#000;color:#fff;padding:2px 8px;border-radius:6px">${path.basename(t, '.png').replace('slide-', '')}</figcaption></figure>`).join('') + '</body>';
    const fh = path.join(out, 'folha.html');
    fs.writeFileSync(fh, html);
    const p2 = await browser.newPage({ viewport: { width: cols * (w + 12) + 12, height: 400 } });
    await p2.goto('file://' + fh);
    await p2.waitForTimeout(400);
    await p2.screenshot({ path: path.join(out, 'folha.png'), fullPage: true });
    fs.unlinkSync(fh);
  }
  await browser.close();

  const todos = [...erros.map(e => 'ERRO ' + e), ...avisos];
  fs.writeFileSync(path.join(out, 'relatorio.txt'), todos.join('\n') + '\n');
  console.log(`${tiros.length} capturas em ${out}`);
  console.log(todos.length ? todos.join('\n') : 'Nenhum problema de layout encontrado.');
  process.exit(todos.some(t => t.startsWith('ERRO')) ? 1 : 0);
})();

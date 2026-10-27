// 校验 content/raids_data.js（格式见 design/dsl.md）：node tools/validate_raids.mjs
import {readFileSync, existsSync} from 'node:fs';
import vm from 'node:vm';

const ctx = {window: {}};
vm.runInNewContext(readFileSync('content/raids_data.js', 'utf8'), ctx, {filename: 'content/raids_data.js'});
const D = ctx.window.RAID_DATA;
const html = readFileSync('game.html', 'utf8');
const skBody = html.match(/\nconst SK=\{([\s\S]*?)\n\};/);
if (!skBody) { console.error('✗ game.html 里找不到 const SK={'); process.exit(1); }
const BUILTIN = new Set([...skBody[1].matchAll(/^ (\w+):\{/gm)].map(m => m[1]));
const SHEETS = new Set([...readFileSync('design/art_todo.md', 'utf8').matchAll(/^### \d+\. `([\w]+)\.png`/gm)].map(m => m[1]));
const ENGINES = new Set(['tel', 'curse', 'stacks', 'playerBomb', 'castBar', 'frenzy', 'followAura', 'teleportPlayer', 'bossShield', 'mindControl',
  'summon', 'shots', 'charge', 'addPhase', 'gaze', 'decimate', 'pull', 'grab', 'trail', 'totem', 'energyBar', 'mirrorImages', 'burrow', 'healTarget',
  'special', 'builtin']);   // builtin = {e:'builtin',k:<SK 键>}，变体/多首领里引用现有技能
const AB = new Set(['pounce', 'chargeLine', 'nova', 'aoeAtPlayer', 'volley', 'beam', 'blink', 'deathExplode', 'deathSplit', 'deathPool', 'packRevive',
  'summon', 'buffAllies', 'heal', 'fear', 'mc', 'stacks',
  // 补充约定（见 raids_data.js 文件头）
  'tel', 'touchDot', 'totem', 'resist', 'enrage', 'curse', 'onHit', 'frenzy', 'onDeath', 'spawnOn', 'stream', 'walkTo', 'leash', 'unkillable',
  'flee', 'sprint', 'grow', 'colorCycle', 'mirror', 'static', 'safeSpot', 'taunt', 'cloud', 'onlyWhileCursed']);
const BASES = new Set(['SK', 'BT', 'SL', 'SA']);
const MAXIDX = {mobs: 3, bosses: 2, adds: 11, tiles: 0, props: 11};

let err = 0, warn = 0;
const E = (w, m) => { console.error(`✗ ${w}: ${m}`); err++; };
const W = (w, m) => { console.warn(`! ${w}: ${m}`); warn++; };
const ids = new Set();
const stat = {raids: 0, bosses: 0, trash: 0, skills: 0, special: {}, engines: {}};

function art(w, a, allowNull) {
  if (a == null) { if (!allowNull) E(w, 'art 缺失'); return; }
  if (!Array.isArray(a) || a.length !== 2 || typeof a[0] !== 'string' || !Number.isInteger(a[1])) return E(w, `art 格式应为 [表名,序号]：${JSON.stringify(a)}`);
  if (!SHEETS.has(a[0])) E(w, `art 表名不在 design/art_todo.md：${a[0]}`);
  const kind = a[0].split('_')[0];
  if (a[1] < 0 || a[1] > (MAXIDX[kind] ?? 11)) E(w, `art 序号越界：${JSON.stringify(a)}`);
}
function fallback(w, f) {
  if (!f) return;
  if (!Array.isArray(f) || !existsSync(`art/${f[0]}.png`)) E(w, `fallback 指向不存在的 art/${f && f[0]}.png`);
}
function skill(w, o) {
  if (!o || typeof o !== 'object') return E(w, '技能不是对象');
  if (!ENGINES.has(o.e)) return E(w, `未知引擎 e=${o.e}`);
  stat.skills++; stat.engines[o.e] = (stat.engines[o.e] || 0) + 1;
  if (o.e === 'special') { if (!o.name) E(w, 'special 缺 name'); stat.special[o.name] = (stat.special[o.name] || 0) + 1; }
  if (o.e === 'builtin' && !BUILTIN.has(o.k)) E(w, `builtin 引用了不存在的 SK.${o.k}`);
  if (o.e === 'tel') {
    if (!['circle', 'cone', 'beam', 'rect'].includes(o.t)) E(w, `tel.t=${o.t}`);
    if (o.dmg > 0 && !(o.T >= 0.6)) E(w, `伤害预警 T=${o.T} < 0.6`);
    if (o.t === 'circle' && !(o.r > 0)) E(w, 'circle 缺 r');
    if (o.t === 'cone' && !(o.len > 0 && o.ang > 0)) E(w, 'cone 缺 len/ang');
  }
  for (const [k, v] of Object.entries(o)) {   // 嵌套技能对象（castBar.then、energyBar.then、classCall.byClass…）
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      if (v.e) skill(`${w}.${k}`, v); else for (const [k2, v2] of Object.entries(v)) if (v2 && typeof v2 === 'object' && v2.e) skill(`${w}.${k}.${k2}`, v2);
    }
    if (Array.isArray(v)) v.forEach((x, i) => x && typeof x === 'object' && x.e && skill(`${w}.${k}[${i}]`, x));
  }
  for (const v of Object.values(o)) if (typeof v === 'string' && /[，。；]/.test(v) && v.length > 20) W(w, `技能参数里出现长句，应改成数值：${v.slice(0, 30)}`);
}
function rotation(w, keys, skills, what) {
  for (const k of keys || []) if (!(skills && k in skills) && !BUILTIN.has(k)) E(w, `${what} 引用的技能 ${k} 既不在 skills 也不是现有 SK`);
}
function abList(w, ab) {
  for (const a of ab || []) {
    if (!AB.has(a.k)) E(w, `未知小怪技能 k=${a.k}`);
    if (['nova', 'aoeAtPlayer', 'chargeLine', 'beam', 'tel', 'deathExplode'].includes(a.k) && a.dmg > 0 && !(a.T >= 0.6)) E(w, `小怪技能 ${a.k} 预警 T=${a.T} < 0.6`);
  }
}
function phase(w, p, skills) {
  if (p.go && !(skills && p.go in skills) && !BUILTIN.has(p.go)) E(w, `阶段 go=${p.go} 不存在`);
  rotation(w, p.sk, skills, '阶段 sk');
  for (const a of p.auto || []) rotation(w, [a.k ?? a], skills, '阶段 auto');
  if (p.form) art(w + '.form', p.form);
  if (p.at !== undefined && !(p.at > 0 && p.at <= 1)) E(w, `阶段 at=${p.at} 不在 (0,1]`);
}

if (D.version !== 1) E('RAID_DATA', 'version 应为 1');
for (const r of D.raids) {
  stat.raids++;
  const w = r.id;
  if (ids.has(r.id)) E(w, 'raid id 重复'); ids.add(r.id);
  if (!['classic', 'tbc', 'wotlk'].includes(r.exp)) E(w, `exp=${r.exp}`);
  if (![1, 2, 3, 4].includes(r.bio)) E(w, `bio=${r.bio}`);
  if (!SHEETS.has(r.tiles)) E(w, `tiles 表不存在：${r.tiles}`);
  for (const p of r.props || []) fallback(`${w}.props.${p.n}`, p.fallback);
  const tk = Object.keys(r.trash || {});
  if (tk.length < 4) W(w, `小怪只有 ${tk.length} 种`);
  if (!tk.some(k => r.trash[k].base === 'SA')) E(w, '没有远程（base SA）小怪');
  for (const [k, t] of Object.entries(r.trash)) {
    stat.trash++;
    const tw = `${w}.trash.${k}`;
    if (!/^[a-z0-9_]+$/.test(k)) E(tw, '小怪键应为 slug');
    if (!t.n) E(tw, '缺中文名 n');
    if (!BASES.has(t.base)) E(tw, `base=${t.base}`);
    if (!(t.hp > 0 && t.dmg > 0)) E(tw, 'hp/dmg 倍率缺失');
    art(tw, t.art); fallback(tw, t.fallback); abList(tw, t.ab);
  }
  for (const b of r.bosses) {
    stat.bosses++;
    const bw = b.id || `${w}/?`;
    if (!b.id || !b.id.startsWith(r.id + '/')) E(bw, `boss id 应为 '${r.id}/<slug>'`);
    if (ids.has(b.id)) E(bw, 'boss id 重复'); ids.add(b.id);
    if (!Number.isInteger(b.rooms) || b.rooms < 2 || b.rooms > 6) E(bw, `rooms=${b.rooms}（首领前小怪房数应为 2~6）`);
    if (!(b.enrage > 0)) E(bw, '缺 enrage');
    if (!(b.hp > 0)) E(bw, '缺 hp');
    if (b.elite && !r.trash[b.elite]) E(bw, `elite ${b.elite} 不在本团 trash`);
    for (const t of b.trash || []) if (!r.trash[t]) E(bw, `trash ${t} 不在本团 trash`);
    if (b.rooms >= 3 && !b.elite) W(bw, 'rooms≥3 但没有 elite');
    art(bw, b.art, !!(b.multi || b.variants)); fallback(bw, b.fallback);
    for (const [k, s] of Object.entries(b.skills || {})) skill(`${bw}.skills.${k}`, s);
    rotation(bw, b.sk, b.skills, 'sk');
    for (const a of b.auto || []) { rotation(bw, [a.k], b.skills, 'auto'); if (!(a.every > 0) && !a.once) E(bw, `auto ${a.k} 缺 every/once`); }
    if (b.open) phase(`${bw}.open`, b.open, b.skills);
    (b.ph || []).forEach((p, i) => phase(`${bw}.ph[${i}]`, p, b.skills));
    for (const f of b.forms || []) { art(`${bw}.forms.${f.n}`, f.art, !!f.fallback); fallback(`${bw}.forms.${f.n}`, f.fallback); }
    for (const a of b.adds || []) {
      const aw = `${bw}.adds.${a.n}`;
      if (!BASES.has(a.base)) E(aw, `base=${a.base}`);
      art(aw, a.art, a.artFrom === 'heroes'); abList(aw, a.ab);
    }
    if (!b.sk?.length && !b.multi && !b.variants && !b.open) E(bw, '没有任何技能轮换');
    for (const m of b.multi || []) {
      const mw = `${bw}.multi.${m.n}`;
      art(mw, m.art, m.artFrom === 'heroes');
      for (const [k, s] of Object.entries(m.skills || {})) skill(`${mw}.${k}`, s);
      rotation(mw, m.sk, m.skills, 'multi.sk');
    }
    if (b.multi && !b.shared) E(bw, 'multi 需要 shared');
    for (const v of b.variants || []) {
      const vw = `${bw}.variants.${v.n}`;
      art(vw, v.art);
      for (const [k, s] of Object.entries(v.skills || {})) skill(`${vw}.${k}`, s);
      rotation(vw, v.sk, v.skills, 'variants.sk');
    }
  }
}
for (const p of D.replays || []) if (!D.raids.some(r => r.id === p.of)) E(`replay ${p.id}`, `of=${p.of} 不存在`);

const byExp = {};
for (const r of D.raids) byExp[r.exp] = (byExp[r.exp] || 0) + r.bosses.length;
console.log(`团本 ${stat.raids} · 首领 ${stat.bosses}（${Object.entries(byExp).map(([k, v]) => k + ' ' + v).join(' / ')}） · 小怪 ${stat.trash} · 技能对象 ${stat.skills}`);
console.log('引擎用量：' + Object.entries(stat.engines).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', '));
console.log('special：' + Object.entries(stat.special).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', '));
console.log(err ? `校验失败：${err} 处错误，${warn} 处提醒` : `校验通过（${warn} 处提醒）`);
process.exit(err ? 1 : 0);

/* ================= ตั้งค่า ================= */
const CONFIG = {
  CHAIN_ID: '0x61', // BSC Testnet
  CHAIN: {
    chainId: '0x61', chainName: 'BNB Smart Chain Testnet',
    nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
    rpcUrls: ['https://data-seed-prebsc-1-s1.bnbchain.org:8545'],
    blockExplorerUrls: ['https://testnet.bscscan.com']
  },
  TOKEN: '0x08243D6c7319e4F8e2d9E21a1435C1dD38415ab4', // เหรียญ NANA
  VAULT: '0x62fa194742E06DF4B55EAc7F2c2d8Ca8B14fF1cB'  // คลังเหรียญ NanoBombVault
};

const FREE_START = 10; // เหรียญฟรีที่ได้ตอนเข้าเกมครั้งแรก (ไม่มีค่าเข้าเกม)
const SUMMON_COST = 10, POTION_COST = 5, MAX_WORK = 15;
const COLS = 15, ROWS = 11, REST_RATE = 0.2; // พลังงานที่ฟื้นต่อวินาทีตอนพัก

const RARITIES = [
  { name: 'Common',   color: '#8D96A3', weight: 50, min: 1, max: 3,  sell: 4 },
  { name: 'Uncommon', color: '#3FA95C', weight: 28, min: 2, max: 4,  sell: 8 },
  { name: 'Rare',     color: '#2F7BF0', weight: 14, min: 3, max: 6,  sell: 18 },
  { name: 'Epic',     color: '#9A4FE6', weight: 6,  min: 5, max: 8,  sell: 45 },
  { name: 'Mythic',   color: '#FF6A2B', weight: 2,  min: 7, max: 10, sell: 120 }
];
const HOUSE = [ // cost = ค่าอัปเกรดเพื่อไปถึงระดับนั้น
  { slots: 0,  mult: 1 },
  { slots: 2,  mult: 2,   nano: 20,  chips: 0 },
  { slots: 4,  mult: 2.5, nano: 50,  chips: 5 },
  { slots: 6,  mult: 3,   nano: 120, chips: 15 },
  { slots: 9,  mult: 3.5, nano: 280, chips: 35 },
  { slots: 12, mult: 4.5, nano: 600, chips: 80 }
];
const BLOCKS = { // p = โอกาสได้ NANO, chip = โอกาสได้ชิป
  crate: { hp: 2,  p: 0.22, min: 0.1, max: 0.4, chip: 0,    color: '#C98A4B', edge: '#8A5528' },
  metal: { hp: 6,  p: 0.5,  min: 0.4, max: 1.2, chip: 0.25, color: '#9DB0C4', edge: '#56687E' },
  chest: { hp: 16, p: 1,    min: 2,   max: 5,   chip: 1,    color: '#F2B531', edge: '#9A6300' }
};
const NAMES = ['Pico', 'Quark', 'Volt', 'Ion', 'Femto', 'Boson', 'Photon', 'Muon', 'Gluon'];
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const STATUS = { work: 'กำลังทำงาน', rest: 'พักผ่อน', house: 'อยู่ในบ้าน' };


/* ================= ตัวช่วย ================= */
const $ = s => document.querySelector(s);
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const rf = (a, b) => a + Math.random() * (b - a);
const fmt = n => (Math.floor(n * 100) / 100).toFixed(2);
const short = a => a.slice(0, 6) + '…' + a.slice(-4);

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast'; el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function rr(g, x, y, w, h, r) { // สี่เหลี่ยมมุมมน
  g.beginPath(); g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

function drawBot(g, cx, cy, s, color, face = 1, t = 0) { // นาโนบอท
  const y = cy + Math.sin(t) * s * 0.035;
  g.lineWidth = Math.max(1.2, s * 0.045); g.strokeStyle = '#2A1F3D';
  g.fillStyle = 'rgba(42,31,61,.22)';
  g.beginPath(); g.ellipse(cx, cy + s * 0.4, s * 0.28, s * 0.07, 0, 0, 7); g.fill();
  g.beginPath(); g.moveTo(cx, y - s * 0.28); g.lineTo(cx + face * s * 0.09, y - s * 0.45); g.stroke();
  g.fillStyle = color; g.beginPath(); g.arc(cx + face * s * 0.09, y - s * 0.47, s * 0.07, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#2A1F3D';
  rr(g, cx - s * 0.25, y + s * 0.22, s * 0.19, s * 0.14, s * 0.06); g.fill();
  rr(g, cx + s * 0.06, y + s * 0.22, s * 0.19, s * 0.14, s * 0.06); g.fill();
  g.fillStyle = color; g.beginPath(); g.arc(cx, y, s * 0.31, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#F4FBF8'; rr(g, cx - s * 0.2 + face * s * 0.04, y - s * 0.13, s * 0.4, s * 0.19, s * 0.08); g.fill(); g.stroke();
  g.fillStyle = '#2A1F3D';
  const ex = cx + face * s * 0.07;
  g.fillRect(ex - s * 0.1, y - s * 0.08, s * 0.05, s * 0.09);
  g.fillRect(ex + s * 0.04, y - s * 0.08, s * 0.05, s * 0.09);
}


/* ================= เซฟ (แยกตามกระเป๋า) ================= */
let account = null, state = null, dirty = false;
const newState = () => ({ nano: FREE_START, chips: 0, heroes: [], house: 0, potions: 0, stage: 1, earned: 0, nextId: 1, autoWork: true, lastSeen: Date.now() });
const saveKey = () => 'nanobomb:v1:' + account.toLowerCase();

function save() {
  if (!state) return;
  state.lastSeen = Date.now();
  try { localStorage.setItem(saveKey(), JSON.stringify(state)); } catch (e) {}
}
function load() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(saveKey())); } catch (e) {}
  state = Object.assign(newState(), s || {});
  if (!s) { save(); setTimeout(() => toast(`ยินดีต้อนรับ! รับ ${FREE_START} NANO ฟรีเข้ากระเป๋าแล้ว`), 300); }
  regenAll((Date.now() - state.lastSeen) / 1000); // ฟื้นพลังตอนออฟไลน์
}
function regenAll(sec) {
  sec = Math.min(sec, 86400);
  for (const h of state.heroes) {
    const rate = h.status === 'rest' ? REST_RATE : h.status === 'house' ? REST_RATE * HOUSE[state.house].mult : 0;
    h.energy = Math.min(h.maxEnergy, h.energy + rate * sec);
  }
}
const count = st => state.heroes.filter(h => h.status === st).length;


/* ================= ฮีโร่ ================= */
function makeHero() {
  const total = RARITIES.reduce((a, r) => a + r.weight, 0);
  let x = Math.random() * total, r = 0;
  while ((x -= RARITIES[r].weight) >= 0) r++;
  const R = RARITIES[r], st = () => ri(R.min, R.max);
  const h = { id: state.nextId++, name: NAMES[ri(0, NAMES.length - 1)] + '-' + ri(100, 999), rarity: r,
    power: st(), speed: st(), stamina: st(), range: Math.min(4, 1 + Math.floor(st() / 3)), status: 'rest' };
  h.maxEnergy = 15 + h.stamina * 5;
  h.energy = h.maxEnergy;
  return h;
}

function setStatus(h, st) {
  if (h.status === st) return;
  if (st === 'work') {
    if (h.energy < 1) return toast(h.name + ' พลังงานไม่พอ');
    if (count('work') >= MAX_WORK) return toast('แผนที่รับได้สูงสุด ' + MAX_WORK + ' ตัว');
    spawn(h);
  } else {
    if (st === 'house' && count('house') >= HOUSE[state.house].slots) return toast('บ้านเต็มหรือยังไม่ได้สร้างบ้าน');
    despawn(h);
  }
  h.status = st;
  dirty = true;
}


/* ================= แผนที่ Treasure Hunt ================= */
let map = null, actors = [];
const idx = (x, y) => y * COLS + x;
const inb = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS;
const cell = (x, y) => map.cells[idx(x, y)];
const bombAt = (x, y) => map.bombs.find(b => b.x === x && b.y === y);

function genMap() {
  const mul = 1 + (state.stage - 1) * 0.15, cells = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    if (x % 2 && y % 2) cells.push({ t: 1 });                       // เสา
    else if (Math.random() < 0.62) {                                 // บล็อก
      const r = Math.random(), kind = r < 0.04 ? 'chest' : r < 0.3 ? 'metal' : 'crate';
      const hp = Math.ceil(BLOCKS[kind].hp * mul);
      cells.push({ t: 2, kind, hp, maxHp: hp, pending: 0, hit: 0 });
    } else cells.push({ t: 0 });                                     // ทางเดิน
  }
  map = { cells, bombs: [], flames: [], floaters: [], clearing: 0 };
  actors.forEach(a => { [a.x, a.y] = freeCell(); a.path = []; a.goal = null; });
  $('#stageNo').textContent = state.stage;
}
function freeCell() {
  const opts = [];
  map.cells.forEach((c, i) => c.t === 0 && opts.push(i));
  const i = opts[ri(0, opts.length - 1)];
  return [i % COLS, Math.floor(i / COLS)];
}
function spawn(h) { const [x, y] = freeCell(); actors.push({ h, x, y, path: [], goal: null, think: 0, t: 0, face: 1 }); }
function despawn(h) { actors = actors.filter(a => a.h !== h); }

// จุดวางได้ = ไม่มีระเบิด และชิดบล็อก 1 ช่องที่ยังต้องการระเบิดเพิ่ม
function canBombAt(x, y) {
  if (bombAt(x, y)) return false;
  return DIRS.some(([dx, dy]) => inb(x + dx, y + dy) && cell(x + dx, y + dy).t === 2 && cell(x + dx, y + dy).pending < cell(x + dx, y + dy).hp);
}
// บล็อกที่ระเบิดจะโดน ตามระยะของฮีโร่
function blocksHit(x, y, range) {
  const res = [];
  for (const [dx, dy] of DIRS) for (let k = 1; k <= range; k++) {
    const nx = x + dx * k, ny = y + dy * k;
    if (!inb(nx, ny) || cell(nx, ny).t === 1) break;
    if (cell(nx, ny).t === 2) { res.push(cell(nx, ny)); break; }
  }
  return res;
}
// BFS หาจุดวางระเบิดที่ใกล้ที่สุด
function findTarget(a) {
  const sx = Math.round(a.x), sy = Math.round(a.y), start = idx(sx, sy);
  const taken = new Set(actors.filter(o => o !== a).map(o => o.goal));
  const prev = new Map(), seen = new Set([start]), q = [[sx, sy]];
  while (q.length) {
    const [x, y] = q.shift(), k = idx(x, y);
    if (!taken.has(k) && canBombAt(x, y)) {
      const path = [];
      for (let c = k; c !== start; c = prev.get(c)) path.unshift([c % COLS, Math.floor(c / COLS)]);
      return { path, goal: k };
    }
    for (const [dx, dy] of DIRS.slice().sort(() => Math.random() - 0.5)) {
      const nx = x + dx, ny = y + dy, nk = idx(nx, ny);
      if (inb(nx, ny) && !seen.has(nk) && cell(nx, ny).t === 0) { seen.add(nk); prev.set(nk, k); q.push([nx, ny]); }
    }
  }
  return null;
}

function updateActor(a, dt) {
  const h = a.h;
  a.t += dt * (a.path.length ? 10 : 4);
  if (a.path.length) { // เดิน
    const [tx, ty] = a.path[0], sp = (1.6 + h.speed * 0.22) * dt;
    const dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy);
    if (Math.abs(dx) > 0.01) a.face = Math.sign(dx);
    if (d <= sp) { a.x = tx; a.y = ty; a.path.shift(); } else { a.x += dx / d * sp; a.y += dy / d * sp; }
    return;
  }
  if ((a.think -= dt) > 0) return;
  const x = Math.round(a.x), y = Math.round(a.y);
  if (a.goal === idx(x, y)) { // ถึงจุดหมาย: วางระเบิดแล้วไปต่อทันที
    if (h.energy >= 1 && canBombAt(x, y)) placeBomb(a, x, y);
    a.goal = null; a.think = 0.12; return;
  }
  if (h.energy < 1) return retire(a);
  const t = findTarget(a);
  if (t) { a.path = t.path; a.goal = t.goal; }
  else { // ไม่มีเป้า: เดินเล่น
    const opts = DIRS.map(([dx, dy]) => [x + dx, y + dy]).filter(([nx, ny]) => inb(nx, ny) && cell(nx, ny).t === 0);
    if (opts.length) a.path = [opts[ri(0, opts.length - 1)]];
    a.think = 0.5 + Math.random();
  }
}
function retire(a) { // หมดพลัง: เข้าบ้านถ้ามีช่อง ไม่งั้นพักข้างนอก
  despawn(a.h);
  a.h.status = count('house') < HOUSE[state.house].slots ? 'house' : 'rest';
  toast(a.h.name + ' หมดพลังงาน ' + (a.h.status === 'house' ? 'เข้าบ้านไปพัก' : 'ออกไปพักผ่อน'));
  dirty = true;
}

function placeBomb(a, x, y) {
  const targets = blocksHit(x, y, a.h.range);
  targets.forEach(c => c.pending += a.h.power);
  a.h.energy -= 1;
  map.bombs.push({ x, y, t: 2.2, owner: a.h, power: a.h.power, range: a.h.range, targets });
}
function explode(b) {
  map.bombs.splice(map.bombs.indexOf(b), 1);
  b.targets.forEach(c => c.pending = Math.max(0, c.pending - b.power));
  map.flames.push({ x: b.x, y: b.y, t: 0.4 });
  for (const [dx, dy] of DIRS) for (let k = 1; k <= b.range; k++) {
    const nx = b.x + dx * k, ny = b.y + dy * k;
    if (!inb(nx, ny) || cell(nx, ny).t === 1) break;
    map.flames.push({ x: nx, y: ny, t: 0.4 });
    const other = bombAt(nx, ny); if (other) other.t = Math.min(other.t, 0.08); // ระเบิดต่อเนื่อง
    if (cell(nx, ny).t === 2) { damage(nx, ny, b.power); break; }
  }
}
function damage(x, y, power) {
  const c = cell(x, y);
  c.hp -= power; c.hit = 0.2;
  if (c.hp > 0) return;
  map.cells[idx(x, y)] = { t: 0 };
  const B = BLOCKS[c.kind];
  let fy = y + 0.3;
  if (Math.random() < B.p) {
    const amt = rf(B.min, B.max) * (1 + (state.stage - 1) * 0.05);
    state.nano += amt; state.earned += amt;
    map.floaters.push({ x: x + 0.5, y: fy, text: '+' + amt.toFixed(2) + ' NANO', color: '#B77A00', t: 1.3 });
    fy -= 0.45;
  }
  if (Math.random() < B.chip) {
    const n = c.kind === 'chest' ? ri(2, 4) : 1;
    state.chips += n;
    map.floaters.push({ x: x + 0.5, y: fy, text: '+' + n + ' ชิป', color: '#0E8A70', t: 1.3 });
  }
  if (!map.cells.some(cc => cc.t === 2)) { // ผ่านด่าน
    map.bonus = 1 + state.stage * 0.5;
    state.nano += map.bonus; state.earned += map.bonus;
    map.bombs = []; map.clearing = 2.2;
    actors.forEach(a => { a.path = []; a.goal = null; });
  }
}


/* ================= วาดแผนที่ ================= */
const cv = $('#map'), ctx = cv.getContext('2d');
let T = 32;
function resize() {
  T = Math.max(16, Math.floor(cv.parentElement.clientWidth / COLS));
  const dpr = window.devicePixelRatio || 1;
  cv.width = T * COLS * dpr; cv.height = T * ROWS * dpr;
  cv.style.width = T * COLS + 'px'; cv.style.height = T * ROWS + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawCell(c, x, y) {
  const px = x * T, py = y * T;
  if (c.t === 1) { // เสา
    ctx.fillStyle = '#3B3355'; rr(ctx, px + 1, py + 1, T - 2, T - 2, T * 0.18); ctx.fill();
    ctx.fillStyle = '#51467A'; rr(ctx, px + 3, py + 3, T - 6, T * 0.34, T * 0.12); ctx.fill();
    return;
  }
  if (c.t !== 2) return;
  const B = BLOCKS[c.kind];
  ctx.fillStyle = c.hit > 0 ? '#fff' : B.color; ctx.strokeStyle = B.edge; ctx.lineWidth = Math.max(1.5, T * 0.06);
  rr(ctx, px + 2, py + 2, T - 4, T - 4, T * 0.12); ctx.fill(); ctx.stroke();
  if (c.kind === 'crate') {
    ctx.beginPath(); ctx.moveTo(px + T * .24, py + T * .24); ctx.lineTo(px + T * .76, py + T * .76);
    ctx.moveTo(px + T * .76, py + T * .24); ctx.lineTo(px + T * .24, py + T * .76); ctx.stroke();
  } else if (c.kind === 'chest') {
    ctx.beginPath(); ctx.moveTo(px + 2, py + T * .45); ctx.lineTo(px + T - 2, py + T * .45); ctx.stroke();
    ctx.fillStyle = '#6B4400'; ctx.fillRect(px + T * .42, py + T * .38, T * .16, T * .2);
  } else {
    ctx.fillStyle = '#BCCADA'; ctx.fillRect(px + T * .24, py + T * .24, T * .52, T * .52);
  }
  if (c.hp < c.maxHp) { // หลอดเลือดบล็อก
    ctx.fillStyle = 'rgba(42,31,61,.7)'; ctx.fillRect(px + 4, py + 3, T - 8, T * 0.1);
    ctx.fillStyle = '#FF5F6D'; ctx.fillRect(px + 4, py + 3, (T - 8) * c.hp / c.maxHp, T * 0.1);
  }
}

function draw() {
  const W = T * COLS, H = T * ROWS;
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    ctx.fillStyle = (x + y) % 2 ? '#C4E5D5' : '#D1ECDF'; ctx.fillRect(x * T, y * T, T, T);
    drawCell(map.cells[idx(x, y)], x, y);
  }
  for (const b of map.bombs) {
    const cx = b.x * T + T / 2, cy = b.y * T + T / 2, r = T * 0.27 * (1 + Math.sin(b.t * 16) * 0.07);
    ctx.strokeStyle = RARITIES[b.owner.rarity].color; ctx.lineWidth = Math.max(2, T * 0.07);
    ctx.fillStyle = '#2A1F3D'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FFB23F'; ctx.beginPath(); ctx.arc(cx + r * 0.8, cy - r * 0.9, T * 0.07, 0, 7); ctx.fill();
  }
  for (const f of map.flames) {
    ctx.globalAlpha = Math.min(1, f.t / 0.25);
    ctx.fillStyle = '#FF8A3D'; rr(ctx, f.x * T + T * .06, f.y * T + T * .06, T * .88, T * .88, T * .3); ctx.fill();
    ctx.fillStyle = '#FFE58A'; rr(ctx, f.x * T + T * .24, f.y * T + T * .24, T * .52, T * .52, T * .2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  for (const a of actors.slice().sort((p, q) => p.y - q.y)) {
    const cx = a.x * T + T / 2, cy = a.y * T + T / 2, pct = a.h.energy / a.h.maxEnergy;
    drawBot(ctx, cx, cy, T * 0.95, RARITIES[a.h.rarity].color, a.face, a.t);
    ctx.fillStyle = 'rgba(42,31,61,.75)'; ctx.fillRect(cx - T * .36, cy - T * .68, T * .72, T * .1);
    ctx.fillStyle = energyColor(pct); ctx.fillRect(cx - T * .36, cy - T * .68, T * .72 * pct, T * .1);
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 4; ctx.strokeStyle = '#fff';
  ctx.font = `600 ${Math.max(11, T * 0.36)}px Mitr, sans-serif`;
  for (const f of map.floaters) {
    ctx.strokeText(f.text, f.x * T, f.y * T);
    ctx.fillStyle = f.color; ctx.fillText(f.text, f.x * T, f.y * T);
  }
  const overlay = map.clearing > 0 ? `ผ่านด่าน ${state.stage}! โบนัส +${fmt(map.bonus)} NANO`
    : !actors.length ? (state.heroes.length ? 'ส่งฮีโร่ไปทำงานเพื่อเริ่มล่าสมบัติ' : 'สุ่มฮีโร่ตัวแรกในแท็บฮีโร่') : '';
  if (overlay) {
    ctx.fillStyle = 'rgba(42,31,61,.55)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff'; ctx.font = `500 ${Math.max(13, T * 0.5)}px Mitr, sans-serif`;
    ctx.fillText(overlay, W / 2, H / 2);
  }
}


/* ================= ลูปหลัก ================= */
let running = false, lastFrame = 0, tickAcc = 0, lastRegen = Date.now(), saveCount = 0;

function update(dt) {
  if (map.clearing > 0) {
    if ((map.clearing -= dt) <= 0) { state.stage++; genMap(); save(); }
  } else actors.slice().forEach(a => updateActor(a, dt));
  map.bombs.slice().forEach(b => (b.t -= dt) <= 0 && explode(b));
  map.flames = map.flames.filter(f => (f.t -= dt) > 0);
  map.floaters = map.floaters.filter(f => { f.y -= dt * 0.7; return (f.t -= dt) > 0; });
  map.cells.forEach(c => c.hit > 0 && (c.hit -= dt));
  if ((tickAcc += dt) >= 1) { tickAcc = 0; everySecond(); }
}
function everySecond() {
  const now = Date.now();
  regenAll((now - lastRegen) / 1000);
  lastRegen = now;
  if (state.autoWork) { // พลังเต็มแล้วกลับไปทำงานเอง
    for (const h of state.heroes)
      if (h.status !== 'work' && h.energy >= h.maxEnergy && count('work') < MAX_WORK) setStatus(h, 'work');
  }
  if (dirty) { dirty = false; renderTab(); }
  liveUI();
  if (++saveCount >= 5) { saveCount = 0; save(); }
}
function loop(t) {
  if (!running) return;
  update(Math.min(0.1, (t - lastFrame) / 1000 || 0));
  lastFrame = t;
  draw();
  requestAnimationFrame(loop);
}
window.addEventListener('beforeunload', save);
window.addEventListener('resize', () => map && resize());


/* ================= หน้าจอ UI ================= */
let tab = 'heroes';
const energyColor = p => p > 0.5 ? '#3FCB8A' : p > 0.2 ? '#FFB23F' : '#FF5F6D';

function liveUI() {
  $('#nanoVal').textContent = fmt(state.nano);
  $('#chipVal').textContent = state.chips;
  $('#workCount').textContent = count('work');
  $('#blocksLeft').textContent = map.cells.filter(c => c.t === 2).length;
  $('#summonBtn').disabled = state.nano < SUMMON_COST;
  document.querySelectorAll('#heroList .hero').forEach(el => { // อัปเดตแค่หลอดพลัง
    const h = state.heroes.find(x => x.id == el.dataset.id), p = h.energy / h.maxEnergy;
    el.querySelector('.en-fill').style.cssText = `width:${p * 100}%;background:${energyColor(p)}`;
    el.querySelector('.en-text').textContent = `พลังงาน ${Math.floor(h.energy)}/${h.maxEnergy}`;
  });
}

function statsHTML(h) {
  return `<dl class="hstats">
    <div><dt>พลัง</dt><dd>${h.power}</dd></div><div><dt>ความเร็ว</dt><dd>${h.speed}</dd></div>
    <div><dt>สแตมินา</dt><dd>${h.stamina}</dd></div><div><dt>ระยะ</dt><dd>${h.range}</dd></div></dl>`;
}
function paintAvatars(root) {
  root.querySelectorAll('canvas.ava').forEach(c =>
    drawBot(c.getContext('2d'), c.width / 2, c.height / 2 + 6, c.width * 0.82, RARITIES[c.dataset.r].color));
}

function renderHeroes() {
  const hs = state.heroes.slice().sort((a, b) => b.rarity - a.rarity || b.power - a.power);
  $('#heroList').innerHTML = hs.length ? hs.map(h => {
    const R = RARITIES[h.rarity];
    const btn = (act, label, cls = '') => `<button class="btn small ${cls}" data-act="${act}">${label}</button>`;
    let acts = h.status === 'work' ? btn('rest', 'เรียกกลับมาพัก') : btn('work', 'ส่งไปทำงาน', 'primary');
    if (h.status === 'rest' && state.house) acts += btn('house', 'เข้าบ้าน');
    if (h.status === 'house') acts += btn('rest', 'ออกจากบ้าน');
    if (state.potions && h.energy < h.maxEnergy) acts += btn('potion', `ดื่มยาพลังงาน (${state.potions})`);
    acts += btn('sell', `ขาย ${R.sell} NANO`, 'ghost');
    return `<article class="hero" data-id="${h.id}" style="--rc:${R.color}">
      <canvas class="ava" width="112" height="112" data-r="${h.rarity}"></canvas>
      <div><div class="hname"><strong>${h.name}</strong><span class="rtag">${R.name}</span></div>
        ${statsHTML(h)}
        <div class="energy"><div class="en-fill"></div></div>
        <div class="en-row"><span class="en-text"></span><span class="st ${h.status}">${STATUS[h.status]}</span></div></div>
      <div class="hact">${acts}</div></article>`;
  }).join('') : `<div class="empty">ยังไม่มีฮีโร่ กดสุ่มฮีโร่เพื่อเริ่มเล่น</div>`;
  paintAvatars($('#heroList'));
}

function renderHouse() {
  const lv = state.house, H = HOUSE[lv], next = HOUSE[lv + 1];
  const can = next && state.nano >= next.nano && state.chips >= next.chips;
  $('#tab-house').innerHTML = `
    <h3>บ้านนาโน</h3>
    <p class="lead">ฮีโร่ที่พักในบ้านฟื้นพลังเร็วกว่าพักข้างนอก ฮีโร่ที่หมดพลังจะเข้าบ้านเองถ้ามีช่องว่าง</p>
    <dl class="kv">
      <dt>ระดับบ้าน</dt><dd>${lv ? lv + ' / 5' : 'ยังไม่ได้สร้าง'}</dd>
      <dt>ช่องพัก</dt><dd>${count('house')} / ${H.slots}</dd>
      <dt>ฟื้นพลังในบ้าน</dt><dd>เร็วกว่า ${H.mult} เท่า</dd>
    </dl>
    ${next ? `<button class="btn primary" id="upgradeBtn" style="width:100%" ${can ? '' : 'disabled'}>
      ${lv ? 'อัปเกรดเป็นระดับ ' + (lv + 1) : 'สร้างบ้าน'} ใช้ ${next.nano} NANO${next.chips ? ' และ ' + next.chips + ' ชิป' : ''}</button>`
      : '<p class="lead">บ้านระดับสูงสุดแล้ว</p>'}`;
  if (next) $('#upgradeBtn').onclick = () => {
    state.nano -= next.nano; state.chips -= next.chips; state.house++;
    toast('บ้านระดับ ' + state.house + ' พร้อมใช้งาน'); save(); renderTab();
  };
}

function renderShop() {
  $('#tab-shop').innerHTML = `
    <h3>ร้านค้า</h3>
    <div class="card"><h4>ยาพลังงาน</h4>
      <p>เติมพลังฮีโร่ 1 ตัวจนเต็ม ใช้จากการ์ดฮีโร่ ตอนนี้มี ${state.potions} ขวด</p>
      <button class="btn small primary" id="buyPotion" ${state.nano < POTION_COST ? 'disabled' : ''}>ซื้อ ${POTION_COST} NANO</button></div>
    <div class="card"><h4>อัตราสุ่มฮีโร่</h4>
      <p>${RARITIES.map(r => `${r.name} ${r.weight}%`).join(', ')}</p></div>`;
  $('#buyPotion').onclick = () => {
    state.nano -= POTION_COST; state.potions++;
    toast('ซื้อยาพลังงานแล้ว มี ' + state.potions + ' ขวด'); save(); renderTab();
  };
}

function renderWallet() {
  $('#tab-wallet').innerHTML = `
    <h3>กระเป๋า</h3>
    <dl class="kv">
      <dt>แอดเดรส</dt><dd>${short(account)}</dd>
      <dt>${symbol} บนเชน</dt><dd id="tokBal">…</dd>
      <dt>NANO ในเกม</dt><dd>${fmt(state.nano)}</dd>
    </dl>
    <div class="card"><h4>ถอนเข้ากระเป๋า</h4>
      <p id="claimInfo">กำลังอ่านข้อมูลคลังเหรียญ…</p>
      <div class="claim-row">
        <input id="claimAmt" type="number" min="0.01" step="0.01" inputmode="decimal" placeholder="จำนวน ${symbol}">
        <button class="btn small" id="maxBtn">สูงสุด</button>
      </div>
      <button class="btn coin" id="claimBtn" style="width:100%">ถอน</button></div>`;
  $('#maxBtn').onclick = async () => $('#claimAmt').value = fmt(await maxClaim());
  $('#claimBtn').onclick = claimReward;
  loadWalletInfo();
}

function renderTab() {
  renderHeroes();
  if (tab === 'house') renderHouse();
  if (tab === 'shop') renderShop();
  if (tab === 'wallet') renderWallet();
  liveUI();
}

/* ---------- ปุ่มต่างๆ ---------- */
document.querySelector('.tabs').onclick = e => {
  const b = e.target.closest('[data-tab]'); if (!b) return;
  tab = b.dataset.tab;
  document.querySelectorAll('.tabs button').forEach(x => x.setAttribute('aria-selected', x === b));
  document.querySelectorAll('.tabpanel').forEach(p => p.hidden = p.id !== 'tab-' + tab);
  renderTab();
};
$('#heroList').onclick = e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const h = state.heroes.find(x => x.id == b.closest('.hero').dataset.id), act = b.dataset.act;
  if (act === 'potion') { state.potions--; h.energy = h.maxEnergy; }
  else if (act === 'sell') {
    if (!confirm(`ขาย ${h.name} ได้ ${RARITIES[h.rarity].sell} NANO?`)) return;
    despawn(h); state.heroes = state.heroes.filter(x => x !== h); state.nano += RARITIES[h.rarity].sell;
  }
  else setStatus(h, act);
  save(); renderTab();
};
$('#summonBtn').onclick = () => {
  if (state.nano < SUMMON_COST) return;
  state.nano -= SUMMON_COST;
  const h = makeHero(), R = RARITIES[h.rarity];
  state.heroes.push(h); save(); renderTab();
  openModal(`<canvas class="ava big" width="240" height="240" data-r="${h.rarity}"></canvas>
    <h3 style="text-align:center">${h.name} <span class="rtag" style="--rc:${R.color}">${R.name}</span></h3>
    ${statsHTML(h)}
    <div class="actions"><button class="btn ghost" data-close>ปิด</button><button class="btn primary" id="sendNow">ส่งไปทำงานเลย</button></div>`);
  paintAvatars($('#modal'));
  $('#sendNow').onclick = () => { closeModal(); setStatus(h, 'work'); save(); renderTab(); };
};
$('#autoWork').onchange = e => { state.autoWork = e.target.checked; save(); };
$('#allWork').onclick = () => { state.heroes.forEach(h => h.energy >= 1 && count('work') < MAX_WORK && setStatus(h, 'work')); save(); renderTab(); };
$('#allRest').onclick = () => { state.heroes.forEach(h => h.status === 'work' && setStatus(h, count('house') < HOUSE[state.house].slots ? 'house' : 'rest')); save(); renderTab(); };

/* ---------- หน้าต่างป๊อปอัป ---------- */
function openModal(html) { $('#modal').innerHTML = `<div class="dialog">${html}</div>`; $('#modal').hidden = false; }
function closeModal() { $('#modal').hidden = true; }
$('#modal').onclick = e => (e.target.id === 'modal' || e.target.closest('[data-close]')) && closeModal();


/* ================= เข้าเกม / ออกจากเกม ================= */
function enterGame(addr) {
  account = addr; load(); lastRegen = Date.now(); actors = [];
  $('#gate').hidden = true; $('#app').hidden = false;
  $('#addrShort').textContent = short(account);
  $('#autoWork').checked = state.autoWork;
  $('#maxWork').textContent = MAX_WORK;
  resize(); genMap();
  state.heroes.forEach(h => { if (h.status === 'work') { if (h.energy >= 1) spawn(h); else h.status = 'rest'; } });
  renderTab();
  if (!running) { running = true; requestAnimationFrame(loop); }
}


/* ================= MetaMask + คลังเหรียญ =================
   1. connectWallet()  เชื่อมกระเป๋า เปลี่ยนเป็น BSC Testnet
   (ไม่มีค่าเข้าเกม ผู้เล่นใหม่ได้ NANO ฟรี FREE_START เหรียญ)
   2. claimReward()    ถอนเหรียญจากคลังเข้ากระเป๋าผู้เล่น ตามจำนวนที่ระบุ
   ======================================================== */
const eth = window.ethereum;
let signer, token, vault, decimals = 18n, symbol = 'NANA';

const toCoin = v => Number(ethers.formatUnits(v, decimals));
const fromCoin = n => ethers.parseUnits(String(n), decimals);

function gateMsg(text, isErr) { $('#gateMsg').textContent = text; $('#gateMsg').className = isErr ? 'err' : ''; }
function errText(e) {
  if (e.code === 'ACTION_REJECTED' || e.code === 4001) return 'คุณยกเลิกคำขอใน MetaMask';
  return { 'daily limit reached': 'ถอนเกินเพดานของวันนี้', 'vault is empty': 'เหรียญในคลังไม่พอ' }[e.reason]
    || e.shortMessage || e.reason || e.message;
}

async function connectWallet() {
  if (!eth) return gateMsg('ไม่พบ MetaMask ติดตั้งก่อนเข้าเล่น (metamask.io)', true);
  try {
    gateMsg('รอการยืนยันใน MetaMask…');
    await eth.request({ method: 'eth_requestAccounts' });
    if (await eth.request({ method: 'eth_chainId' }) !== CONFIG.CHAIN_ID) {
      try { await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CONFIG.CHAIN_ID }] }); }
      catch (e) { if (e.code === 4902) await eth.request({ method: 'wallet_addEthereumChain', params: [CONFIG.CHAIN] }); else throw e; }
    }
    signer = await new ethers.BrowserProvider(eth).getSigner();
    token = new ethers.Contract(CONFIG.TOKEN, [
      'function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)',
      'function symbol() view returns (string)'], signer);
    vault = new ethers.Contract(CONFIG.VAULT, [
      'function remainingToday(address) view returns (uint256)',
      'function vaultBalance() view returns (uint256)', 'function claim(uint256)'], signer);
    [decimals, symbol] = await Promise.all([token.decimals(), token.symbol()]);
    gateMsg(''); enterGame(signer.address); // เข้าเกมได้เลย ไม่ต้องจ่ายค่าเข้า
  } catch (e) { gateMsg(errText(e), true); }
}

// ถอนได้สูงสุด = น้อยที่สุดของ (NANO ในเกม, เพดานวันนี้, เหรียญในคลัง)
async function maxClaim() {
  const [left, inVault] = await Promise.all([vault.remainingToday(signer.address), vault.vaultBalance()]);
  return Math.floor(Math.min(state.nano, toCoin(left), toCoin(inVault)) * 100) / 100;
}

async function loadWalletInfo() {
  try {
    const [bal, inVault, max] = await Promise.all([token.balanceOf(signer.address), vault.vaultBalance(), maxClaim()]);
    $('#tokBal').textContent = toCoin(bal).toLocaleString('en-US', { maximumFractionDigits: 2 });
    $('#claimInfo').textContent = `1 NANO = 1 ${symbol} ถอนได้สูงสุด ${fmt(max)} ${symbol} (ในคลังมี ${toCoin(inVault).toLocaleString('en-US')})`;
  } catch (e) { $('#claimInfo').textContent = 'อ่านข้อมูลไม่ได้: ' + errText(e); }
}

async function claimReward() {
  const amount = Math.floor(Number($('#claimAmt').value) * 100) / 100; // ปัดเหลือทศนิยม 2 ตำแหน่ง
  if (!(amount > 0)) return toast('ใส่จำนวนที่ต้องการถอน');
  const btn = $('#claimBtn'); btn.disabled = true;
  try {
    const max = await maxClaim();
    if (amount > max) throw new Error(`ถอนได้สูงสุด ${fmt(max)} ${symbol}`);
    btn.textContent = 'ยืนยันใน MetaMask…';
    const tx = await vault.claim(fromCoin(amount.toFixed(2)));
    btn.textContent = 'รอธุรกรรมยืนยัน…';
    await tx.wait();
    state.nano -= amount; save();
    toast(`ถอน ${amount} ${symbol} เข้ากระเป๋าแล้ว`);
  } catch (e) { toast('ถอนไม่สำเร็จ: ' + errText(e)); }
  if (tab === 'wallet') renderWallet();
  liveUI();
}

// เปลี่ยนบัญชีหรือเครือข่ายใน MetaMask: โหลดหน้าใหม่
if (eth?.on) { eth.on('accountsChanged', () => { save(); location.reload(); }); eth.on('chainChanged', () => { save(); location.reload(); }); }

$('#connectBtn').onclick = connectWallet;
drawBot($('#gateBot').getContext('2d'), 160, 170, 230, RARITIES[4].color);

// เคยอนุญาตเว็บนี้แล้วและอยู่บน BSC Testnet: เข้าเกมต่อได้เลย
(async () => {
  if (!eth) return gateMsg('ไม่พบ MetaMask ติดตั้งก่อนเข้าเล่น (metamask.io)', true);
  const [accs, chain] = await Promise.all([eth.request({ method: 'eth_accounts' }), eth.request({ method: 'eth_chainId' })]);
  if (accs.length && chain === CONFIG.CHAIN_ID) connectWallet();
})();

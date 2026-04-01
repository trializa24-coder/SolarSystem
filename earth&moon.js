/* ═══════════════════════════════════════
   EARTH & MOON PAGE — earth-moon.js
═══════════════════════════════════════ */
// Auto-switch tab dari URL parameter
window.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  if (tab === 'moon') {
    switchTab('moon');
  } else {
    switchTab('earth');
  }
});

/* ── CURSOR ── */
const cursor = document.getElementById('cursor');
const trail  = document.getElementById('cursorTrail');

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
  setTimeout(() => {
    trail.style.left = e.clientX + 'px';
    trail.style.top  = e.clientY + 'px';
  }, 80);
});

document.querySelectorAll('a, button, .stat-card, .info-card, .eff, .pm-node').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width  = '24px';
    cursor.style.height = '24px';
    cursor.style.background = 'var(--glow)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width  = '16px';
    cursor.style.height = '16px';
    cursor.style.background = 'var(--cyan)';
  });
});

/* ── DROPDOWN NAV ── */
const ddp = document.querySelector('.has-dropdown');
ddp?.querySelector(':scope > a')?.addEventListener('click', e => {
  e.preventDefault();
  ddp.classList.toggle('open');
});
document.addEventListener('click', e => {
  if (!ddp?.contains(e.target)) ddp?.classList.remove('open');
});

/* ── TAB SWITCH ── */
function switchTab(t) {
  ['earth', 'moon'].forEach(id => {
    document.getElementById('panel-' + id).classList.toggle('on', id === t);
    document.getElementById('btn-' + id).className =
      'tab-btn tab-' + id + (id === t ? ' on' : '');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════════════════════════════
   EARTH MOTION ANIMATION — single canvas, two modes
══════════════════════════════════════════════════════ */

const canvas = document.getElementById('earthCanvas');
const ctx    = canvas ? canvas.getContext('2d') : null;

let animMode  = 'rotation'; // 'rotation' | 'revolution'
let rotAngle  = 0;           // continents spin angle
let revAngle  = 0;           // orbital position angle
let lastTime  = 0;

/* mode data — what shows in the right info panel */
const modeData = {
  rotation: {
    tag: 'ROTATION',
    heading: 'Rotation &\nDay / Night',
    desc: 'Earth spins on its own axis — an imaginary line through the North and South Poles — from <strong>west to east</strong>, completing one full spin every <strong>24 hours</strong>. The side facing the Sun is daytime; the opposite side is night.',
    badge: 'ROTATION — DAY & NIGHT',
    badgeClass: 'rot-badge',
    effects: [
      { n: '01', t: 'Day and Night',   tx: 'As Earth rotates, different parts face the Sun, creating the 24-hour cycle of day and night.', c: '#22d3ee' },
      { n: '02', t: 'Time Zones',      tx: 'Earth rotates west to east, so the Sun rises earlier in the east — creating Indonesia\'s WIB, WITA, and WIT time zones.', c: '#22d3ee' },
      { n: '03', t: 'Sunrise & Sunset',tx: 'The Sun always rises in the east and sets in the west — a direct result of Earth\'s west-to-east rotation.', c: '#22d3ee' },
      { n: '04', t: '23.5° Axial Tilt',tx: 'Earth\'s axis is not straight up — it tilts at 23.5°. This is what causes longer days and nights near the poles.', c: '#22d3ee' },
    ],
  },
  revolution: {
    tag: 'REVOLUTION',
    heading: 'Revolution &\nSeasons',
    desc: 'Earth orbits the Sun along an elliptical path, completing one full revolution in <strong>365.25 days</strong> (1 year). Combined with Earth\'s 23.5° axial tilt, this orbit creates the <strong>changing of seasons</strong> across the globe.',
    badge: 'REVOLUTION — ORBIT & SEASONS',
    badgeClass: 'rev-badge',
    effects: [
      { n: '01', t: 'Year Length',           tx: 'One revolution = 1 year (365.25 days). The extra 0.25 day accumulates into a leap year every 4 years.', c: '#a78bfa' },
      { n: '02', t: 'Four Seasons',          tx: 'Regions above/below the equator experience Spring, Summer, Autumn, and Winter based on axial tilt orientation.', c: '#a78bfa' },
      { n: '03', t: 'Two Seasons at Equator',tx: 'Indonesia only has rainy and dry seasons, as equatorial regions receive consistent sunlight year-round.', c: '#a78bfa' },
      { n: '04', t: 'Day Length Variation',  tx: 'In polar regions during summer, the Sun can shine for 24 hours. In winter, some areas experience total darkness.', c: '#a78bfa' },
    ],
  },
};

function setMode(m) {
  animMode = m;

  /* buttons */
  document.getElementById('btn-rot').className =
    'motion-btn' + (m === 'rotation' ? ' rot-on' : '');
  document.getElementById('btn-rev').className =
    'motion-btn' + (m === 'revolution' ? ' rev-on' : '');

  /* badge */
  const badge = document.getElementById('canvasBadge');
  const d = modeData[m];
  badge.textContent  = d.badge;
  badge.className    = 'canvas-badge ' + d.badgeClass;

  /* info panel — hide both, show active */
  document.getElementById('infoRot').classList.toggle('show', m === 'rotation');
  document.getElementById('infoRev').classList.toggle('show', m === 'revolution');
}

/* build info panel HTML once */
function buildInfoPanels() {
  ['rotation', 'revolution'].forEach(m => {
    const d   = modeData[m];
    const id  = m === 'rotation' ? 'infoRot' : 'infoRev';
    const el  = document.getElementById(id);
    const tagCls = m === 'rotation' ? 'rot' : 'rev';

    el.innerHTML = `
      <span class="mode-tag ${tagCls}">${d.tag}</span>
      <div class="mode-heading">${d.heading.replace('\n', '<br>')}</div>
      <p class="mode-desc">${d.desc}</p>
      <div class="mode-effects">
        ${d.effects.map(e => `
          <div class="eff" style="--ec:${e.c}">
            <span class="eff-num">${e.n}</span>
            <div>
              <div class="eff-title">${e.t}</div>
              <div class="eff-text">${e.tx}</div>
            </div>
          </div>`).join('')}
      </div>`;
  });
}

/* ── SEASONS for revolution mode ── */
const SEASONS = [
  { a: 0,               n: 'MARCH EQUINOX',  c: '#4ade80', s: 'Spring (N) / Autumn (S)' },
  { a: Math.PI / 2,     n: 'JUNE SOLSTICE',  c: '#f97316', s: 'Summer (N) / Winter (S)' },
  { a: Math.PI,         n: 'SEPT EQUINOX',   c: '#f59e0b', s: 'Autumn (N) / Spring (S)' },
  { a: 3 * Math.PI / 2, n: 'DEC SOLSTICE',   c: '#60a5fa', s: 'Winter (N) / Summer (S)' },
];

/* ─── DRAW: ROTATION mode ─── */
function drawRotation(W, H, angle) {
  const cx = W / 2, cy = H / 2, R = W * 0.29;

  /* space bg */
  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * .75);
  bg.addColorStop(0, '#0d1a36'); bg.addColorStop(1, '#020818');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  /* sunlight glow from right */
  const sg = ctx.createRadialGradient(W, cy, 0, W, cy, W * .9);
  sg.addColorStop(0, 'rgba(251,191,36,.15)'); sg.addColorStop(1, 'rgba(251,191,36,0)');
  ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);

  /* Sun (partially clipped at right edge) */
  const sunX = W - 16, sunY = cy, sunR = 62;
  const sunGr = ctx.createRadialGradient(sunX - 10, sunY - 10, 0, sunX, sunY, sunR);
  sunGr.addColorStop(0, '#fff9c4'); sunGr.addColorStop(.2, '#fbbf24');
  sunGr.addColorStop(.55, '#f97316'); sunGr.addColorStop(1, '#c2410c');
  ctx.save();
  ctx.beginPath(); ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fillStyle = sunGr; ctx.fill();
  ctx.restore();

  ctx.font = '600 7.5px Orbitron, sans-serif';
  ctx.fillStyle = 'rgba(251,191,36,.7)';
  ctx.textAlign = 'center';
  ctx.fillText('SUN', sunX, sunY + sunR + 14);

  /* ─ Earth ─ */
  ctx.save();
  ctx.translate(cx, cy);

  /* base ocean */
  const eg = ctx.createRadialGradient(-R * .15, -R * .2, 0, 0, 0, R);
  eg.addColorStop(0, '#93c5fd'); eg.addColorStop(.2, '#3b82f6');
  eg.addColorStop(.55, '#1d4ed8'); eg.addColorStop(.85, '#1e3a5f');
  eg.addColorStop(1, '#0f172a');
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fillStyle = eg; ctx.fill();

  /* spinning continents */
  ctx.save(); ctx.rotate(angle);
  ctx.fillStyle = 'rgba(22,163,74,.72)';
  [
    [-.06, -.10, .18, .22,  .2],
    [-.36,  .02, .13, .28, -.3],
    [ .22, -.16, .22, .18, -.1],
    [ .30,  .28, .10, .08,  .2],
  ].forEach(([x, y, rx, ry, r]) => {
    ctx.beginPath();
    ctx.ellipse(R * x, R * y, R * rx, R * ry, r, 0, Math.PI * 2);
    ctx.fill();
  });
  /* ice caps */
  ctx.fillStyle = 'rgba(226,232,240,.5)';
  ctx.beginPath(); ctx.ellipse(0,  R * .83, R * .44, R * .11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -R * .83, R * .40, R * .11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  /* day / night terminator */
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.clip();
  /* dark night hemisphere (left) */
  ctx.beginPath(); ctx.arc(0, 0, R, Math.PI / 2, 3 * Math.PI / 2); ctx.closePath();
  ctx.fillStyle = 'rgba(0,0,16,.83)'; ctx.fill();
  /* soft edge */
  const term = ctx.createLinearGradient(-R * .2, 0, R * .2, 0);
  term.addColorStop(0, 'rgba(0,0,16,.78)'); term.addColorStop(1, 'rgba(0,0,16,0)');
  ctx.fillStyle = term; ctx.fillRect(-R * .2, -R, R * .4, R * 2);
  /* city lights */
  ctx.globalCompositeOperation = 'screen';
  [
    [-R * .30, -R * .20], [-R * .22, -R * .09], [-R * .45,  R * .05],
    [-R * .30,  R * .20], [-R * .14,  R * .10], [-R * .10, -R * .22],
    [-R * .38, -R * .14],
  ].forEach(([lx, ly]) => {
    const rx = lx * Math.cos(-angle) - ly * Math.sin(-angle);
    if (rx < R * .12) {
      const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, R * .068);
      lg.addColorStop(0, 'rgba(255,230,120,.55)'); lg.addColorStop(1, 'rgba(255,180,60,0)');
      ctx.beginPath(); ctx.arc(lx, ly, R * .068, 0, Math.PI * 2);
      ctx.fillStyle = lg; ctx.fill();
    }
  });
  ctx.restore();

  /* atmosphere rim */
  const atm = ctx.createRadialGradient(0, 0, R * .88, 0, 0, R * 1.12);
  atm.addColorStop(0, 'rgba(96,165,250,0)');
  atm.addColorStop(.55, 'rgba(96,165,250,.2)');
  atm.addColorStop(1, 'rgba(96,165,250,0)');
  ctx.beginPath(); ctx.arc(0, 0, R * 1.12, 0, Math.PI * 2);
  ctx.fillStyle = atm; ctx.fill();

  /* tilt axis */
  ctx.save(); ctx.rotate(-23.5 * Math.PI / 180);
  ctx.strokeStyle = 'rgba(167,139,250,.55)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(0, -R * 1.3); ctx.lineTo(0, R * 1.3); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#a78bfa';
  ctx.beginPath(); ctx.arc(0, -R * 1.3, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0,  R * 1.3, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  ctx.restore(); /* end Earth translate */

  /* rotation arrow */
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(34,211,238,.55)'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.arc(cx, cy, R + 18, -Math.PI * .65, Math.PI * .35); ctx.stroke();
  const ae = { x: cx + (R + 18) * Math.cos(Math.PI * .35), y: cy + (R + 18) * Math.sin(Math.PI * .35) };
  ctx.beginPath(); ctx.moveTo(ae.x, ae.y);
  ctx.lineTo(ae.x - 8, ae.y - 4); ctx.lineTo(ae.x - 3, ae.y + 6);
  ctx.closePath(); ctx.fillStyle = 'rgba(34,211,238,.65)'; ctx.fill();

  /* labels */
  ctx.font = '600 8px Orbitron, sans-serif'; ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(148,163,184,.8)'; ctx.fillText('EARTH', cx, cy + R + 26);
  ctx.font = '600 7px Orbitron, sans-serif';
  ctx.fillStyle = 'rgba(251,191,36,.75)'; ctx.fillText('DAY',   cx + R * .55, cy - 8);
  ctx.fillStyle = 'rgba(96,165,250,.55)'; ctx.fillText('NIGHT', cx - R * .55, cy - 8);
  ctx.fillStyle = 'rgba(167,139,250,.7)'; ctx.font = '600 6.5px Orbitron, sans-serif';
  ctx.fillText('23.5° TILT', cx + R * .82, cy - R * 1.12);
}

/* ─── DRAW: REVOLUTION mode ─── */
function drawRevolution(W, H, angle) {
  const cx = W / 2, cy = H / 2;
  const orx = W * .37, ory = H * .35;

  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * .75);
  bg.addColorStop(0, '#0d1a36'); bg.addColorStop(1, '#020818');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  /* Sun at center */
  const sgl = ctx.createRadialGradient(cx, cy, 0, cx, cy, 88);
  sgl.addColorStop(.5, 'rgba(251,191,36,.28)'); sgl.addColorStop(1, 'rgba(251,191,36,0)');
  ctx.beginPath(); ctx.arc(cx, cy, 88, 0, Math.PI * 2); ctx.fillStyle = sgl; ctx.fill();

  const sg = ctx.createRadialGradient(cx - 8, cy - 8, 0, cx, cy, 42);
  sg.addColorStop(0, '#fff9c4'); sg.addColorStop(.2, '#fbbf24');
  sg.addColorStop(.55, '#f97316'); sg.addColorStop(1, '#c2410c');
  ctx.beginPath(); ctx.arc(cx, cy, 42, 0, Math.PI * 2); ctx.fillStyle = sg; ctx.fill();
  ctx.font = '700 8px Orbitron, sans-serif'; ctx.fillStyle = 'rgba(251,191,36,.8)';
  ctx.textAlign = 'center'; ctx.fillText('SUN', cx, cy + 56);

  /* orbit ellipse */
  ctx.beginPath(); ctx.ellipse(cx, cy, orx, ory, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(148,163,184,.2)'; ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);

  /* season markers */
  SEASONS.forEach(s => {
    const mx = cx + orx * Math.cos(s.a);
    const my = cy + ory * Math.sin(s.a);
    ctx.beginPath(); ctx.arc(mx, my, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = s.c + '88'; ctx.fill();
    const lx = cx + (orx + 28) * Math.cos(s.a);
    const ly = cy + (ory + 20) * Math.sin(s.a);
    ctx.font = '600 6px Orbitron, sans-serif'; ctx.fillStyle = s.c + 'cc';
    ctx.textAlign = 'center'; ctx.fillText(s.n, lx, ly);
  });

  /* ─ Earth on orbit ─ */
  const ex = cx + orx * Math.cos(angle);
  const ey = cy + ory * Math.sin(angle);
  const dx = ex - cx, dy = ey - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / dist, ny = dy / dist;
  const R = 21;

  /* atmosphere */
  const atmG = ctx.createRadialGradient(ex, ey, R * .8, ex, ey, R * 1.55);
  atmG.addColorStop(0, 'rgba(96,165,250,0)');
  atmG.addColorStop(.5, 'rgba(96,165,250,.22)');
  atmG.addColorStop(1, 'rgba(96,165,250,0)');
  ctx.beginPath(); ctx.arc(ex, ey, R * 1.55, 0, Math.PI * 2);
  ctx.fillStyle = atmG; ctx.fill();

  /* body */
  const eg = ctx.createRadialGradient(ex - 5, ey - 5, 0, ex, ey, R);
  eg.addColorStop(0, '#93c5fd'); eg.addColorStop(.25, '#3b82f6');
  eg.addColorStop(.6, '#1d4ed8'); eg.addColorStop(.9, '#1e3a5f'); eg.addColorStop(1, '#0f172a');
  ctx.beginPath(); ctx.arc(ex, ey, R, 0, Math.PI * 2); ctx.fillStyle = eg; ctx.fill();

  /* continents */
  ctx.save(); ctx.translate(ex, ey); ctx.rotate(angle * 1.5);
  ctx.fillStyle = 'rgba(22,163,74,.65)';
  [[-4, -5, 7, 9, .2], [6, -2, 8, 7, -.2], [-9, 4, 5, 10, -.3]].forEach(([x, y, rx, ry, r]) => {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, r, 0, Math.PI * 2); ctx.fill();
  });
  ctx.restore();

  /* night side */
  ctx.save(); ctx.beginPath(); ctx.arc(ex, ey, R, 0, Math.PI * 2); ctx.clip();
  const na = Math.atan2(ny, nx);
  ctx.beginPath(); ctx.arc(ex, ey, R, na + Math.PI / 2, na + 3 * Math.PI / 2); ctx.closePath();
  ctx.fillStyle = 'rgba(0,0,16,.83)'; ctx.fill();
  const tg = ctx.createLinearGradient(ex + nx * (-3), ey + ny * (-3), ex + nx * 3, ey + ny * 3);
  tg.addColorStop(0, 'rgba(0,0,16,.65)'); tg.addColorStop(1, 'rgba(0,0,16,0)');
  ctx.fillStyle = tg; ctx.fillRect(ex - R, ey - R, R * 2, R * 2);
  ctx.restore();

  /* tilt axis */
  ctx.save(); ctx.translate(ex, ey); ctx.rotate(-23.5 * Math.PI / 180);
  ctx.strokeStyle = 'rgba(167,139,250,.65)'; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]);
  ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(0, 32); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  /* light ray */
  ctx.strokeStyle = 'rgba(251,191,36,.07)'; ctx.lineWidth = 1; ctx.setLineDash([3, 7]);
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.setLineDash([]);

  /* labels */
  ctx.font = '600 7px Orbitron, sans-serif'; ctx.fillStyle = 'rgba(148,163,184,.8)';
  ctx.textAlign = 'center'; ctx.fillText('EARTH', ex, ey + R + 14);

  /* current season note */
  let nearest = SEASONS[0], md = Infinity;
  SEASONS.forEach(s => {
    const d = Math.abs(((angle - s.a + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
    if (d < md) { md = d; nearest = s; }
  });
  ctx.font = '700 7px Orbitron, sans-serif'; ctx.fillStyle = nearest.c + 'ee';
  ctx.fillText('▲ ' + nearest.s, cx, H - 12);
}

/* ─── ANIMATION LOOP ─── */
function animate(t) {
  if (!ctx) return;
  const dt = Math.min((t - lastTime) / 1000, 0.05);
  lastTime = t;

  rotAngle += dt * 0.80;   /* rotation speed */
  revAngle += dt * 0.22;   /* orbit speed */

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (animMode === 'rotation') {
    drawRotation(canvas.width, canvas.height, rotAngle);
  } else {
    drawRevolution(canvas.width, canvas.height, revAngle);
  }

  requestAnimationFrame(animate);
}

/* ══════════════════════════════
   MOON PHASES
══════════════════════════════ */
const phaseData = {
  new:  { num: '01', name: 'New Moon',        icon: '🌑', sf: 'dark',
    desc: 'The Moon is between Earth and the Sun. Its sunlit side faces completely away from us — the Moon is invisible in the night sky.',
    detail: 'Start of the lunar cycle. Moon, Earth, and Sun are almost aligned. The bright side faces the Sun, not Earth.' },
  waxc: { num: '02', name: 'Waxing Crescent', icon: '🌒', sf: 'waxc',
    desc: 'A thin crescent sliver of light appears on the right side. The Moon grows brighter each night after sunset.',
    detail: 'Occurs 1–7 days after New Moon. "Waxing" means growing — the lit area keeps expanding.' },
  fq:   { num: '03', name: 'First Quarter',   icon: '🌓', sf: 'fq',
    desc: 'The right half of the Moon is illuminated. The Moon is 90° from the Sun as seen from Earth.',
    detail: 'Called "quarter" because the Moon has completed ¼ of its orbit. Visible from afternoon until midnight.' },
  waxg: { num: '04', name: 'Waxing Gibbous',  icon: '🌔', sf: 'waxg',
    desc: 'More than half of the Moon is illuminated, and the lit area continues to grow toward Full Moon.',
    detail: '"Gibbous" means hump-shaped. Most of the Earth-facing surface is now lit by the Sun.' },
  full: { num: '05', name: 'Full Moon',        icon: '🌕', sf: 'full',
    desc: 'The entire visible face of the Moon is fully illuminated. Earth is positioned between the Moon and the Sun.',
    detail: 'Occurs around day 14–15. This is also the phase when lunar eclipses can occur.' },
  wang: { num: '06', name: 'Waning Gibbous',  icon: '🌖', sf: 'wang',
    desc: 'More than half is still lit, but illumination is decreasing from the right side each night.',
    detail: '"Waning" means shrinking. The Moon has passed full and is now moving back toward New Moon.' },
  lq:   { num: '07', name: 'Last Quarter',    icon: '🌗', sf: 'lq',
    desc: 'The left half of the Moon is illuminated — a mirror of First Quarter. The Moon is 270° from the Sun.',
    detail: 'Also called "Third Quarter." Rises around midnight, visible in the morning sky.' },
  wanc: { num: '08', name: 'Waning Crescent', icon: '🌘', sf: 'wanc',
    desc: 'Only a thin crescent sliver remains on the left side. The Moon is returning toward New Moon.',
    detail: 'The final phase of the 29.5-day cycle. After this, the Moon disappears and the cycle resets.' },
};

function moonSVG(id) {
  const svgs = {
    dark: `<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="md0"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#060e1f"/></radialGradient></defs><circle cx="36" cy="36" r="34" fill="url(#md0)"/><circle cx="28" cy="30" r="3" fill="#162032"/><circle cx="44" cy="44" r="2" fill="#162032"/></svg>`,
    waxc: `<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="ml1" cx="36%" cy="32%"><stop offset="0%" stop-color="#e2e8f0"/><stop offset="50%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#334155"/></radialGradient></defs><circle cx="36" cy="36" r="34" fill="url(#ml1)"/><path d="M36,2 A34,34 0,0,0 36,70 A17,34 0,0,1 36,2 Z" fill="#060e1f"/></svg>`,
    fq:   `<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="ml2" cx="36%" cy="32%"><stop offset="0%" stop-color="#e2e8f0"/><stop offset="50%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#334155"/></radialGradient></defs><circle cx="36" cy="36" r="34" fill="url(#ml2)"/><path d="M36,2 A34,34 0,0,0 36,70 Z" fill="#060e1f"/></svg>`,
    waxg: `<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="ml3" cx="36%" cy="32%"><stop offset="0%" stop-color="#e2e8f0"/><stop offset="50%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#334155"/></radialGradient></defs><circle cx="36" cy="36" r="34" fill="url(#ml3)"/><path d="M36,2 A34,34 0,0,0 36,70 A17,34 0,0,0 36,2 Z" fill="#060e1f"/></svg>`,
    full: `<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="ml4" cx="36%" cy="32%"><stop offset="0%" stop-color="#f8fafc"/><stop offset="40%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#475569"/></radialGradient></defs><circle cx="36" cy="36" r="34" fill="url(#ml4)"/><circle cx="28" cy="30" r="4" fill="rgba(0,0,0,.12)"/><circle cx="44" cy="44" r="3" fill="rgba(0,0,0,.1)"/></svg>`,
    wang: `<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="ml5" cx="36%" cy="32%"><stop offset="0%" stop-color="#e2e8f0"/><stop offset="50%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#334155"/></radialGradient></defs><circle cx="36" cy="36" r="34" fill="url(#ml5)"/><path d="M36,2 A34,34 0,0,1 36,70 A17,34 0,0,1 36,2 Z" fill="#060e1f"/></svg>`,
    lq:   `<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="ml6" cx="36%" cy="32%"><stop offset="0%" stop-color="#e2e8f0"/><stop offset="50%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#334155"/></radialGradient></defs><circle cx="36" cy="36" r="34" fill="url(#ml6)"/><path d="M36,2 A34,34 0,0,1 36,70 Z" fill="#060e1f"/></svg>`,
    wanc: `<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="ml7" cx="36%" cy="32%"><stop offset="0%" stop-color="#e2e8f0"/><stop offset="50%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#334155"/></radialGradient></defs><circle cx="36" cy="36" r="34" fill="url(#ml7)"/><path d="M36,2 A34,34 0,0,1 36,70 A17,34 0,0,0 36,2 Z" fill="#060e1f"/></svg>`,
  };
  return svgs[id] || svgs['full'];
}

function selectPhase(id) {
  const p = phaseData[id]; if (!p) return;
  document.querySelectorAll('.pm-node').forEach(n => {
    const active = n.dataset.id === id;
    n.querySelector('.pm-aring')?.setAttribute('opacity', active ? '1' : '0');
    n.querySelector('.pm-lbl')?.setAttribute('fill', active ? '#e2e8f0' : '#64748b');
  });
  const panel = document.getElementById('phasePanel');
  panel.classList.add('active');
  document.getElementById('phaseDefault').style.display = 'none';
  document.querySelectorAll('.phase-detail').forEach(d => d.remove());
  const det = document.createElement('div');
  det.className = 'phase-detail show';
  det.innerHTML = `
    <div class="pd-num">PHASE ${p.num} / 08 · ${p.icon}</div>
    <div class="pd-row">
      <div class="pd-moon-big">${moonSVG(p.sf)}</div>
      <div class="pd-name">${p.name}</div>
    </div>
    <div class="pd-text">${p.desc}</div>
    <div class="pd-sub">${p.detail}</div>`;
  panel.appendChild(det);
}

/* ══════════════════════════════
   ECLIPSE
══════════════════════════════ */
const EC = {
  total:     { moonX: 770, moonY: 160, mFill: 'url(#emb)', darkOp: 0,    uOp: '.75', pOp: '0',   lbl: 'BLOOD MOON',  title: 'TOTAL LUNAR ECLIPSE',   icon: '🌑', name: 'Total Lunar Eclipse — Blood Moon', desc: 'The Moon enters completely into Earth\'s <strong>umbra</strong> (dark inner shadow). Sunlight bending through Earth\'s atmosphere casts red light onto the Moon\'s surface — creating the dramatic <strong>Blood Moon</strong>. Totality can last up to 100 minutes.' },
  partial:   { moonX: 735, moonY: 130, mFill: 'url(#emn)', darkOp: .55,  uOp: '.75', pOp: '.55', lbl: 'PARTIAL',     title: 'PARTIAL LUNAR ECLIPSE',  icon: '🌗', name: 'Partial Lunar Eclipse',            desc: 'Only part of the Moon enters Earth\'s <strong>umbra</strong>. The shadowed portion appears very dark, while the rest stays bright — the shadow boundary is clearly visible on the Moon\'s surface.' },
  penumbral: { moonX: 700, moonY: 100, mFill: 'url(#emn)', darkOp: 0,    uOp: '0',   pOp: '.75', lbl: 'PENUMBRAL',  title: 'PENUMBRAL LUNAR ECLIPSE', icon: '🌕', name: 'Penumbral Lunar Eclipse',          desc: 'The Moon passes only through Earth\'s <strong>penumbra</strong> (outer shadow). The dimming is very subtle — often <strong>barely noticeable</strong> to the naked eye. No dramatic red color occurs.' },
};

function setEclipse(type) {
  const c = EC[type];
  document.querySelectorAll('.ecl-btn').forEach(b => b.classList.toggle('on', b.dataset.type === type));
  const mg = document.getElementById('moonGroup');
  mg.style.transition = 'transform .7s ease';
  mg.setAttribute('transform', `translate(${c.moonX},${c.moonY})`);
  document.getElementById('moonBody').setAttribute('fill', c.mFill);
  const dk = document.getElementById('moonDark');
  dk.setAttribute('opacity', c.darkOp);
  type === 'partial'
    ? dk.setAttribute('clip-path', 'url(#mclipR)')
    : dk.removeAttribute('clip-path');
  document.getElementById('moonLabel').setAttribute('x', c.moonX);
  document.getElementById('moonLabel').setAttribute('y', c.moonY + 32);
  document.getElementById('moonLabel').textContent = c.lbl;
  ['umbraL', 'umbraR'].forEach(id => document.getElementById(id).setAttribute('opacity', c.uOp));
  ['penUp', 'penLow', 'penUp2', 'penLow2'].forEach(id => document.getElementById(id).setAttribute('opacity', c.pOp));
  document.getElementById('umbraLabel').setAttribute('opacity', c.uOp === '0' ? '0' : '.5');
  document.getElementById('penumbraLbl').setAttribute('opacity', c.pOp === '0' ? '0' : '.6');
  document.getElementById('eclTitle').textContent = c.title;
  document.getElementById('eclIcon').textContent  = c.icon;
  document.getElementById('eclName').textContent  = c.name;
  document.getElementById('eclDesc').innerHTML    = c.desc;
}

/* ══════════════════════════════
   SCROLL REVEAL
══════════════════════════════ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '0';
      e.target.style.transform = 'translateY(28px)';
      setTimeout(() => {
        e.target.style.transition = 'opacity .5s ease, transform .5s ease';
        e.target.style.opacity   = '1';
        e.target.style.transform = 'translateY(0)';
      }, +e.target.dataset.d || 0);
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: .08 });

document.querySelectorAll('.stat-card, .info-card, .eff').forEach((el, i) => {
  el.dataset.d = i * 50;
  revealObs.observe(el);
});

document.querySelectorAll('.has-dropdown > a').forEach(function(a) {
  a.addEventListener('click', function(e) {
    e.preventDefault(); // cegah scroll ke atas
    e.stopPropagation();
    this.parentElement.classList.toggle('open');
  });
});

document.addEventListener('click', function() {
  document.querySelectorAll('.has-dropdown').forEach(function(item) {
    item.classList.remove('open');
  });
});

/* ══════════════════════════════
   INIT
══════════════════════════════ */
buildInfoPanels();
setMode('rotation');
setEclipse('total');
requestAnimationFrame(animate);
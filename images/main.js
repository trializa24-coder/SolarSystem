// ─── CUSTOM CURSOR ───
const cursor = document.getElementById('cursor');
const trail = document.getElementById('cursorTrail');

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
  setTimeout(() => {
    trail.style.left = e.clientX + 'px';
    trail.style.top = e.clientY + 'px';
  }, 80);
});

document.querySelectorAll('a, button, .planet-card, .planet, .planet-saturn-wrap').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '24px';
    cursor.style.height = '24px';
    cursor.style.background = 'var(--glow)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '16px';
    cursor.style.height = '16px';
    cursor.style.background = 'var(--cyan)';
  });
});

// ─── SCROLL REVEAL PLANET CARDS ───
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '0';
      entry.target.style.transform = 'translateY(40px)';
      setTimeout(() => {
        entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, entry.target.dataset.delay || 0);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.planet-card').forEach((card, i) => {
  card.dataset.delay = i * 80;
  observer.observe(card);
});

// ─── PARALLAX SOLAR SYSTEM ───
document.addEventListener('mousemove', e => {
  const ss = document.getElementById('solarSystem');
  if (!ss) return;
  const xRatio = (e.clientX / window.innerWidth - 0.5) * 20;
  const yRatio = (e.clientY / window.innerHeight - 0.5) * 20;
  ss.style.transform = `translate(${xRatio}px, ${yRatio}px)`;
});

// ─── COUNTER-ROTATE PLANET LABELS ───
document.querySelectorAll('.orbit').forEach(orbit => {
  const dur = parseFloat(getComputedStyle(orbit).animationDuration);
  const planet = orbit.querySelector('.planet, .planet-saturn-wrap');
  if (planet) {
    planet.style.animation = `orbitSpin ${dur}s linear infinite reverse`;
  }
});

// ─── DROPDOWN TOGGLE ───
document.querySelectorAll('.has-dropdown > a').forEach(function(a) {
  a.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.parentElement.classList.toggle('open');
  });
});

document.addEventListener('click', function() {
  document.querySelectorAll('.has-dropdown').forEach(function(item) {
    item.classList.remove('open');
  });
});

/* ═══════════════════════════════════════════════════════
   BIG QUESTION SECTION — JavaScript
   Add this to your main.js (or a separate bq.js file
   linked before </body>)
   ═══════════════════════════════════════════════════════ */

// ─── BIG QUESTION: Scroll-triggered reveal ───
(function () {
  'use strict';

  const bqCard = document.querySelector('.bq-card');
  if (!bqCard) return;

  // Reset animation so it triggers on scroll into view (not just on load)
  // The CSS already handles initial hidden state with opacity:0
  // This IntersectionObserver adds the "seen" class to fire CSS animations
  // when the card enters the viewport.

  const bqObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('bq-visible');
          bqObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  bqObserver.observe(bqCard);
})();

// ─── BIG QUESTION: Pillar hover glow cursor effect ───
(function () {
  'use strict';

  const pillars = document.querySelectorAll('.bq-pillar');
  if (!pillars.length) return;

  pillars.forEach((pillar) => {
    pillar.addEventListener('mousemove', (e) => {
      const rect = pillar.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      pillar.style.setProperty('--mx', x + '%');
      pillar.style.setProperty('--my', y + '%');
    });
  });
})();

// ─── BIG QUESTION: Extend cursor hover for pillars & chip ───
// This works alongside your existing cursor code in main.js.
// Make sure this runs AFTER the cursor elements are available.
document.addEventListener('DOMContentLoaded', function () {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  const bqTargets = document.querySelectorAll(
    '.bq-pillar, .bq-chip, .bq-card'
  );

  bqTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '32px';
      cursor.style.height = '32px';
      cursor.style.background = 'var(--gold)';
      cursor.style.boxShadow = '0 0 24px var(--gold)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '16px';
      cursor.style.height = '16px';
      cursor.style.background = 'var(--cyan)';
      cursor.style.boxShadow = '0 0 20px var(--cyan)';
    });
  });
});
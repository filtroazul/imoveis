/* =====================================================
   AH IMOBILIÁRIA — script.js (AJUSTADO p/ CMS + JSON + Cloudinary)
   ===================================================== */

/* ─── PRELOADER ─── */
const preloader = document.getElementById('preloader');
window.addEventListener('load', () => {
  setTimeout(() => preloader.classList.add('hide'), 1700);
});

/* ─── CUSTOM CURSOR ─── */
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mx = -200, my = -200, rx = -200, ry = -200;

document.addEventListener('mousemove', (e) => {
  mx = e.clientX; my = e.clientY;
  dot.style.left  = mx + 'px';
  dot.style.top   = my + 'px';
});

(function animRing() {
  rx += (mx - rx) * 0.14;
  ry += (my - ry) * 0.14;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animRing);
})();

/* ✅ hover funcionando também para cards criados dinamicamente */
document.addEventListener('mouseover', (e) => {
  if (e.target.closest('a, button, .project-card, .nav')) ring.classList.add('hover');
});
document.addEventListener('mouseout', (e) => {
  if (e.target.closest('a, button, .project-card, .nav')) ring.classList.remove('hover');
});

/* ─── TYPING EFFECT ─── */
const roles = [
  'Imóveis de Alto Padrão',
  'Residências Exclusivas',
  'Apartamentos',
  'Galpões Comerciais',
  'Seu Próximo Lar'
];

const typedText = document.getElementById('typed-text');
let roleIndex = 0, letterIndex = 0, deleting = false;

function typingLoop() {
  const current = roles[roleIndex];
  if (!deleting) {
    typedText.textContent = current.slice(0, letterIndex + 1);
    letterIndex++;
    if (letterIndex === current.length) {
      deleting = true;
      setTimeout(typingLoop, 1600);
      return;
    }
    setTimeout(typingLoop, 85);
  } else {
    typedText.textContent = current.slice(0, letterIndex - 1);
    letterIndex--;
    if (letterIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
    setTimeout(typingLoop, 42);
  }
}
typingLoop();

/* ─── SCROLL REVEAL ─── */
const revealEls = document.querySelectorAll('.reveal, .reveal-bg');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    e.isIntersecting ? e.target.classList.add('show') : e.target.classList.remove('show');
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObs.observe(el));

/* ─── SPLIT TEXT ─── */
document.querySelectorAll('.split').forEach(node => {
  const text = node.textContent;
  node.textContent = '';
  [...text].forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'char';
    span.style.setProperty('--i', i);
    span.textContent = char === ' ' ? '\u00A0' : char;
    node.appendChild(span);
  });
});

/* ─── PARALLAX ─── */
const parallaxNodes = [...document.querySelectorAll('.parallax')];
let ticking = false;

function applyParallax() {
  const y = window.scrollY;
  parallaxNodes.forEach(node => {
    const speed = parseFloat(node.dataset.speed ?? '0.08');
    node.style.transform = `translateY(${y * speed}px)`;
  });
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(applyParallax); ticking = true; }
}, { passive: true });
applyParallax();

/* ─── CAROUSEL ─── */
const track      = document.getElementById('project-track');
const prevButton = document.querySelector('.nav.prev');
const nextButton = document.querySelector('.nav.next');
let currentSlide = 0;

function cardPerView() {
  if (window.innerWidth <= 640)  return 1;
  if (window.innerWidth <= 980)  return 2;
  return 4;
}
function maxSlideIndex() {
  if (!track) return 0;
  return Math.max(0, track.children.length - cardPerView());
}
function updateCarousel() {
  if (!track) return;
  const card = track.querySelector('.project-card');
  if (!card) return;

  const gap  = parseFloat(getComputedStyle(track).gap || '20');
  const step = card.getBoundingClientRect().width + gap;

  track.style.transform = `translateX(-${currentSlide * step}px)`;

  if (prevButton) prevButton.disabled = currentSlide === 0;
  if (nextButton) nextButton.disabled = currentSlide >= maxSlideIndex();
}

if (prevButton) prevButton.addEventListener('click', () => {
  currentSlide = Math.max(0, currentSlide - 1);
  updateCarousel();
});
if (nextButton) nextButton.addEventListener('click', () => {
  currentSlide = Math.min(maxSlideIndex(), currentSlide + 1);
  updateCarousel();
});
window.addEventListener('resize', () => {
  currentSlide = Math.min(currentSlide, maxSlideIndex());
  updateCarousel();
});
updateCarousel();

/* ─── PROPERTY DATA (AGORA VEM DO JSON / CMS) ───
   ✅ Coloque seu arquivo em: /content/imoveis.json
   ✅ Formato esperado:
   {
     "items": [
       {
         "title": "Cobertura ...",
         "badge": "Destaque",
         "img": "https://res.cloudinary.com/.../image.jpg",
         "price": "R$ 4.800.000",
         "type": "Venda",
         "location": "Jardins, São Paulo – SP",
         "area": "320 m²",
         "rooms": "4 Suítes",
         "date": "Disponível ...",
         "condo": "R$ ...",
         "features": ["...", "..."],
         "desc": "texto ...",
         "published": true
       }
     ]
   }
*/
let properties = [];

async function loadProperties() {
  try {
    const res = await fetch('/content/imoveis.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Falha ao carregar /content/imoveis.json (${res.status})`);

    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];

    // se usar "published" no CMS:
    properties = items.filter(p => p.published !== false);

    renderPropertyCards();
    currentSlide = 0;
    updateCarousel();
  } catch (err) {
    console.error('[loadProperties]', err);
    // fallback: só mantém o HTML atual e atualiza carousel
    updateCarousel();
  }
}

function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/* ✅ Gera os cards no mesmo container do carrossel.
   IMPORTANTÍSSIMO:
   - Se seu CSS/HTML usa outras classes internas (badge/title/price etc),
     adapte só o HTML abaixo mantendo: <li class="project-card">.
*/
function renderPropertyCards() {
  if (!track) return;

  track.innerHTML = properties.map((p, index) => {
    const badge = escapeHtml(p.badge || '');
    const title = escapeHtml(p.title || '');
    const location = escapeHtml(p.location || '');
    const desc = escapeHtml(p.desc || p.excerpt || '');
    const price = escapeHtml(p.price || '');
    const type = escapeHtml(p.type || '');

    const imgSrc = escapeHtml(p.img || '');
    const imgTag = imgSrc ? `<img src="${imgSrc}" alt="${title}" loading="lazy">` : '';

    return `
      <li class="project-card" data-index="${index}">
        <span class="badge">${badge}</span>

        <div class="thumb">
          ${imgTag}
        </div>

        <h3 class="title">${title}</h3>
        <p class="location">${location}</p>
        <p class="desc">${desc}</p>

        <div class="bottom">
          <div class="price">${price}</div>
          <button class="open-btn" type="button" aria-label="Ver detalhes">${type || 'Ver'}</button>
        </div>
      </li>
    `;
  }).join('');

  // abrir modal por clique no card ou no botão
  track.querySelectorAll('.project-card').forEach(card => {
    const idx = Number(card.dataset.index || '0');

    card.addEventListener('click', () => openModal(idx));

    const btn = card.querySelector('.open-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(idx);
      });
    }
  });
}

/* ─── MODAL ─── */
const overlay    = document.getElementById('propModal');
const modalClose = document.getElementById('modalClose');

function openModal(index) {
  const p = properties[index];
  if (!p) return;

  const modalImg = document.getElementById('modalImg');
  if (modalImg) {
    modalImg.src = p.img || '';
    modalImg.alt = p.title || 'Imóvel';
  }

  const badgeEl = document.getElementById('modalBadge');
  if (badgeEl) badgeEl.textContent = p.badge || '';

  const titleEl = document.getElementById('modalTitle');
  if (titleEl) titleEl.textContent = p.title || '';

  const priceEl = document.getElementById('modalPrice');
  if (priceEl) priceEl.innerHTML = (p.price || '') + `<span>${p.type || ''}</span>`;

  const descEl = document.getElementById('modalDesc');
  if (descEl) descEl.textContent = p.desc || p.excerpt || '';

  // details
  const details = [
    { label: 'Localização', value: p.location || '—' },
    { label: 'Área',        value: p.area || '—' },
    { label: 'Quartos',     value: p.rooms || '—' },
    { label: 'Condomínio',  value: p.condo || '—' },
    { label: 'Disponib.',   value: p.date || '—'  },
  ];

  const detailsEl = document.getElementById('modalDetails');
  if (detailsEl) {
    detailsEl.innerHTML = details.map(d =>
      `<div class="detail-row">
         <span class="detail-label">${escapeHtml(d.label)}</span>
         <span class="detail-value">${escapeHtml(d.value)}</span>
       </div>`
    ).join('');
  }

  // features
  const featuresEl = document.getElementById('modalFeatures');
  if (featuresEl) {
    const feats = Array.isArray(p.features) ? p.features : [];
    featuresEl.innerHTML = feats.map(f =>
      `<span class="feature-tag">${escapeHtml(f)}</span>`
    ).join('');
  }

  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

if (modalClose) modalClose.addEventListener('click', closeModal);
if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

/* ✅ Carrega do JSON quando o DOM estiver pronto */
document.addEventListener('DOMContentLoaded', () => {
  loadProperties();
});

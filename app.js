// ── app.js v3 — renderiza cards com fallback para db.json estático ──────

async function loadAulas() {
  let db = null;

  // Tenta API do servidor Node primeiro
  try {
    const res = await fetch('/api/db');
    if (res.ok) { db = await res.json(); }
  } catch(e) {}

  // Fallback: fetch direto do db.json
  if (!db) {
    try {
      const res = await fetch('./db.json');
      if (res.ok) { db = await res.json(); }
    } catch(e) {}
  }

  if (!db) { console.warn('Não foi possível carregar db.json'); return; }

  window._db = db;
  renderCards(db.aulas);
  renderTotal(db.aulas);
}

function renderTotal(aulas) {
  const n = aulas.filter(a => a.status === 'publicada').length;
  const el = document.getElementById('totalAulas');
  if (el) el.textContent = n;
}

function renderCards(aulas) {
  const grid = document.getElementById('aulas-grid');
  if (!grid) return;
  grid.innerHTML = '';

  aulas.forEach((aula, i) => {
    const delay = i > 0 ? ` reveal-d${Math.min(i,4)}` : '';
    const ok    = aula.status === 'publicada';

    const badge = ok
      ? `<div class="aula-status status-ok"><span class="status-dot"></span>Publicada</div>`
      : `<div class="aula-status status-soon"><span class="status-dot"></span>Em breve</div>`;

    const numBg = ok
      ? `background:var(--grad-btn)`
      : `background:linear-gradient(135deg,#9b8abf,#7B6B9B)`;

    // Datas turma A e B
    let metaDates = '';
    if (ok) {
      if (aula.dataA && aula.dataB && aula.dataA !== aula.dataB) {
        metaDates = `
          <div class="aula-meta-item"><i data-lucide="calendar" style="width:13px;height:13px"></i>A · ${aula.dataA}</div>
          <div class="aula-meta-item"><i data-lucide="calendar" style="width:13px;height:13px"></i>B · ${aula.dataB}</div>`;
      } else {
        const d = aula.dataA || aula.dataB || '';
        metaDates = `
          <div class="aula-meta-item"><i data-lucide="calendar" style="width:13px;height:13px"></i>${d}</div>
          <div class="aula-meta-item"><i data-lucide="clock" style="width:13px;height:13px"></i>${aula.duracao || '1h20'}</div>`;
      }
    } else {
      metaDates = `<div class="aula-meta-item"><i data-lucide="calendar" style="width:13px;height:13px"></i>Em breve</div>`;
    }

    const arrow  = ok ? `<div class="aula-arrow"><i data-lucide="arrow-up-right" style="width:18px;height:18px"></i></div>` : '';
    const topics = (aula.topicos||[]).map(t=>`<span class="topic-tag">${t}</span>`).join('');

    const inner = `
      <div class="aula-card-top">
        <div class="aula-num-bg">${aula.numero}</div>
        <div class="aula-header">
          <div class="aula-num-badge" style="${numBg}">${aula.numero}</div>
          ${badge}
        </div>
        <div class="aula-title">${aula.titulo} <em>${aula.tituloEm}</em></div>
        <div class="aula-desc">${aula.descricao}</div>
      </div>
      <div class="aula-topics">${topics}</div>
      <div class="aula-card-bottom">
        <div class="aula-meta-row">${metaDates}</div>
        ${arrow}
      </div>`;

    let card;
    if (ok && aula.href) {
      card = document.createElement('a');
      card.href = aula.href;
      card.className = `aula-card reveal${delay}`;
    } else {
      card = document.createElement('div');
      card.className = `aula-card em-breve reveal${delay}`;
    }
    card.innerHTML = inner;
    grid.appendChild(card);
  });

  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Re-observa os reveals novos
  const revObs = new IntersectionObserver(e => {
    e.forEach(x => { if(x.isIntersecting) x.target.classList.add('vis'); });
  }, {threshold:.1});
  grid.querySelectorAll('.reveal').forEach(el => revObs.observe(el));
}

document.addEventListener('DOMContentLoaded', loadAulas);

// ── Card "Nova Aula" — aparece só no modo admin ──────────────────────────
function renderNewAulaCard() {
  const grid = document.getElementById('aulas-grid');
  if (!grid) return;

  // Remove card anterior se existir
  grid.querySelector('.aula-card-new')?.remove();

  if (!document.body.classList.contains('admin-mode')) return;

  const card = document.createElement('div');
  card.className = 'aula-card aula-card-new';
  card.innerHTML = `
    <div class="aula-card-new-inner">
      <div class="aula-new-icon">
        <i data-lucide="plus" style="width:28px;height:28px"></i>
      </div>
      <div class="aula-new-label">Nova Aula</div>
      <div class="aula-new-hint">Clique para criar</div>
    </div>`;
  card.addEventListener('click', () => {
    if (typeof openNewModal !== 'undefined') openNewModal();
    else if (typeof openNewAulaModal !== 'undefined') openNewAulaModal();
  });
  grid.appendChild(card);
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Observa mudanças no admin-mode para mostrar/esconder o card
const _adminObserver = new MutationObserver(() => renderNewAulaCard());
document.addEventListener('DOMContentLoaded', () => {
  _adminObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
});

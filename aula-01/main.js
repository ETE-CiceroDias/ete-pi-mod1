// ── Lucide icons ──────────────────────────────
lucide.createIcons();

// ── Progress bar ──────────────────────────────
const prog = document.getElementById('prog');
window.addEventListener('scroll', () => {
  const p = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  prog.style.width = (p * 100) + '%';
});

// ── Nav scrolled ──────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 60);
});

// ── Active nav ────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[data-section]');
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => {
        a.classList.toggle('active', a.dataset.section === e.target.id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => sectionObs.observe(s));

// ── Back to top ───────────────────────────────
const btt = document.getElementById('btt');
window.addEventListener('scroll', () => {
  btt.classList.toggle('show', window.scrollY > 400);
});

// ── Scroll reveal ─────────────────────────────
const reveals = document.querySelectorAll('.reveal');
const revObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
}, { threshold: 0.1 });
reveals.forEach(el => revObs.observe(el));

// ── Fases stagger ─────────────────────────────
const fases = document.querySelectorAll('.fase-card');
const fasesRow = document.getElementById('fasesRow');
if (fasesRow) {
  const faseObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        fases.forEach((f, i) => setTimeout(() => f.classList.add('vis'), i * 80));
        faseObs.disconnect();
      }
    });
  }, { threshold: 0.2 });
  faseObs.observe(fasesRow);
}

// ── Pessoas Scrum ─────────────────────────────
function activatePerson(el) {
  document.querySelectorAll('.person-panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}

// ── Mobile menu ───────────────────────────────
function toggleMobile() {
  document.getElementById('mobileMenu').classList.toggle('open');
  lucide.createIcons();
}

// ── Kanban: add ticket ────────────────────────
function addTicket(colId, tagLabel) {
  const col = document.getElementById('col-' + colId);
  const tagClasses = { backlog: 'tag-p', todo: 'tag-r', doing: 'tag-a', done: 'tag-g' };
  const div = document.createElement('div');
  div.className = 'k-ticket';
  div.innerHTML = '<span class="k-ticket-tag ' + tagClasses[colId] + '">' + tagLabel + '</span><div class="k-ticket-inner" contenteditable="true">Nova tarefa</div><button class="k-del" onclick="delTicket(this)"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
  col.appendChild(div);
  const inner = div.querySelector('.k-ticket-inner');
  inner.focus();
  const range = document.createRange();
  range.selectNodeContents(inner);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
}

function delTicket(btn) {
  btn.closest('.k-ticket').remove();
}

// ── Rich text toolbar ─────────────────────────
const toolbar = document.getElementById('toolbar');
let lastRange = null;

document.addEventListener('mouseup', (e) => {
  if (toolbar.contains(e.target)) return;
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed) { toolbar.classList.remove('show'); return; }
  const range = sel.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const el = container.nodeType === 3 ? container.parentElement : container;
  if (!el.closest('[contenteditable]')) { toolbar.classList.remove('show'); return; }
  lastRange = range.cloneRange();
  const rect = range.getBoundingClientRect();
  toolbar.style.top  = (rect.top + window.scrollY - 48) + 'px';
  toolbar.style.left = (rect.left + rect.width / 2 - toolbar.offsetWidth / 2) + 'px';
  toolbar.classList.add('show');
});

document.addEventListener('mousedown', (e) => {
  if (!toolbar.contains(e.target)) toolbar.classList.remove('show');
});

function restoreAndExec(cmd, val) {
  const sel = window.getSelection();
  if (lastRange) { sel.removeAllRanges(); sel.addRange(lastRange); }
  document.execCommand(cmd, false, val || null);
}

document.getElementById('tb-b').addEventListener('mousedown', e => { e.preventDefault(); restoreAndExec('bold'); });
document.getElementById('tb-i').addEventListener('mousedown', e => { e.preventDefault(); restoreAndExec('italic'); });
document.getElementById('tb-u').addEventListener('mousedown', e => { e.preventDefault(); restoreAndExec('underline'); });
document.getElementById('tb-clr').addEventListener('mousedown', e => { e.preventDefault(); restoreAndExec('removeFormat'); });

document.querySelectorAll('.tb-color').forEach(btn => {
  btn.addEventListener('mousedown', e => {
    e.preventDefault();
    restoreAndExec('foreColor', btn.dataset.color);
  });
});

// ── Persistência com localStorage ─────────────
const STORAGE_KEY = 'ete-aula01-v1';

function saveEdits() {
  const data = {};
  document.querySelectorAll('[contenteditable]').forEach((el, i) => {
    data['ce-' + i] = el.innerHTML;
  });
  // Salva kanban
  ['backlog','todo','doing','done'].forEach(col => {
    const cards = [];
    document.querySelectorAll('#col-' + col + ' .k-ticket').forEach(t => {
      cards.push({
        tag: t.querySelector('.k-ticket-tag')?.textContent || '',
        tagClass: t.querySelector('.k-ticket-tag')?.className.replace('k-ticket-tag ','') || 'tag-p',
        text: t.querySelector('.k-ticket-inner')?.innerHTML || ''
      });
    });
    data['kanban-' + col] = JSON.stringify(cards);
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadEdits() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  const data = JSON.parse(saved);
  document.querySelectorAll('[contenteditable]').forEach((el, i) => {
    if (data['ce-' + i]) el.innerHTML = data['ce-' + i];
  });
  ['backlog','todo','doing','done'].forEach(col => {
    if (!data['kanban-' + col]) return;
    const cards = JSON.parse(data['kanban-' + col]);
    const container = document.getElementById('col-' + col);
    if (!container) return;
    container.innerHTML = '';
    cards.forEach(c => {
      const div = document.createElement('div');
      div.className = 'k-ticket';
      div.innerHTML = `<span class="k-ticket-tag ${c.tagClass}">${c.tag}</span><div class="k-ticket-inner" contenteditable="true">${c.text}</div><button class="k-del" onclick="delTicket(this)"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`;
      container.appendChild(div);
    });
  });
}

// Auto-save a cada mudança
document.addEventListener('input', saveEdits);
document.addEventListener('DOMContentLoaded', loadEdits);
loadEdits();

// ── SDLC Accordion ────────────────────────────
function toggleFase(headEl) {
  const item = headEl.closest('.sdlc-item');
  const isActive = item.classList.contains('active');
  document.querySelectorAll('.sdlc-item').forEach(i => i.classList.remove('active'));
  if (!isActive) item.classList.add('active');
  lucide.createIcons();
}

// ── Sprint Calendar ───────────────────────────
const eventsData = {
  planning: {
    icon: 'calendar-check',
    title: 'Sprint Planning',
    desc: 'Time e PO se reúnem no início da Sprint. Decidem quais itens do Backlog serão trabalhados e como. Define o objetivo da Sprint — o que vamos entregar?'
  },
  daily: {
    icon: 'sun',
    title: 'Daily Scrum · 15 min',
    desc: 'Reunião diária de pé. Três perguntas: O que fiz ontem? O que farei hoje? Tem algum impedimento? Foco total em manter o time alinhado.'
  },
  review: {
    icon: 'presentation',
    title: 'Sprint Review',
    desc: 'Time apresenta o Incremento ao cliente ou stakeholders. Feedback real, não relatório. O que foi feito? O que muda para a próxima Sprint?'
  },
  retro: {
    icon: 'search',
    title: 'Retrospectiva',
    desc: 'Reunião interna do time. O que foi bem? O que pode melhorar? Como melhorar? O time aprende sobre o próprio processo antes de iniciar o próximo ciclo.'
  }
};

function showEvent(key) {
  const panel = document.getElementById('sprintInfo');
  const data = eventsData[key];
  const iconMap = { 'calendar-check': '📅', 'sun': '☀️', 'presentation': '🎯', 'search': '🔍' };
  document.getElementById('sprintInfoTitle').textContent = data.title;
  document.getElementById('sprintInfoDesc').textContent = data.desc;
  document.getElementById('sprintInfoIcon').textContent = iconMap[data.icon] || '📌';
  document.getElementById('sprintInfoIcon').style.background = 'none';
  document.getElementById('sprintInfoIcon').style.fontSize = '1.4rem';
  panel.classList.add('open');
}

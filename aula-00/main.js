// ── aula-00/main.js ────────────────────────────
lucide.createIcons();

// Progress bar
const prog = document.getElementById('prog');
window.addEventListener('scroll', () => {
  const p = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  prog.style.width = (p * 100) + '%';
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 60);
  document.getElementById('btt').classList.toggle('show', window.scrollY > 400);
});

// Active nav
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[data-section]');
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle('active', a.dataset.section === e.target.id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => sectionObs.observe(s));

// Scroll reveal
const revObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

// Mobile menu
function toggleMobile() {
  document.getElementById('mobileMenu').classList.toggle('open');
  lucide.createIcons();
}

// Rich text toolbar (só funciona se admin — auth.js controla visibilidade)
const toolbar = document.getElementById('toolbar');
let lastRange = null;
document.addEventListener('mouseup', (e) => {
  if (toolbar && toolbar.contains(e.target)) return;
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed) { toolbar && toolbar.classList.remove('show'); return; }
  const range = sel.getRangeAt(0);
  const el = range.commonAncestorContainer.nodeType === 3
    ? range.commonAncestorContainer.parentElement
    : range.commonAncestorContainer;
  if (!el.closest('[contenteditable="true"]')) { toolbar && toolbar.classList.remove('show'); return; }
  lastRange = range.cloneRange();
  const rect = range.getBoundingClientRect();
  toolbar.style.top  = (rect.top + window.scrollY - 48) + 'px';
  toolbar.style.left = (rect.left + rect.width / 2 - toolbar.offsetWidth / 2) + 'px';
  toolbar.classList.add('show');
});
document.addEventListener('mousedown', (e) => {
  if (toolbar && !toolbar.contains(e.target)) toolbar.classList.remove('show');
});
function restoreAndExec(cmd, val) {
  const sel = window.getSelection();
  if (lastRange) { sel.removeAllRanges(); sel.addRange(lastRange); }
  document.execCommand(cmd, false, val || null);
}
document.getElementById('tb-b')?.addEventListener('mousedown', e => { e.preventDefault(); restoreAndExec('bold'); });
document.getElementById('tb-i')?.addEventListener('mousedown', e => { e.preventDefault(); restoreAndExec('italic'); });
document.getElementById('tb-u')?.addEventListener('mousedown', e => { e.preventDefault(); restoreAndExec('underline'); });
document.getElementById('tb-clr')?.addEventListener('mousedown', e => { e.preventDefault(); restoreAndExec('removeFormat'); });
document.querySelectorAll('.tb-color').forEach(btn => {
  btn.addEventListener('mousedown', e => { e.preventDefault(); restoreAndExec('foreColor', btn.dataset.color); });
});

// Persistência
const STORAGE_KEY = 'ete-aula00-v1';
function saveEdits() {
  const data = {};
  document.querySelectorAll('[contenteditable]').forEach((el, i) => { data['ce-' + i] = el.innerHTML; });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function loadEdits() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  const data = JSON.parse(saved);
  document.querySelectorAll('[contenteditable]').forEach((el, i) => {
    if (data['ce-' + i]) el.innerHTML = data['ce-' + i];
  });
}
document.addEventListener('input', saveEdits);
document.addEventListener('DOMContentLoaded', loadEdits);
loadEdits();

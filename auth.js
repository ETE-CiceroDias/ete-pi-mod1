// ── auth.js v2 — login admin + dark mode ───────────────────────────────
const AUTH_KEY  = 'ete-pi-admin';
const THEME_KEY = 'ete-pi-theme';
const AUTH_USER = 'sams';
const AUTH_PASS = 'cicero2026';

function getTheme()  { return localStorage.getItem(THEME_KEY) || 'light'; }
function setTheme(t) {
  localStorage.setItem(THEME_KEY, t);
  document.documentElement.setAttribute('data-theme', t);
  const btn = document.getElementById('theme-btn');
  if (btn) {
    btn.innerHTML = t === 'dark'
      ? '<i data-lucide="sun"  style="width:16px;height:16px"></i>'
      : '<i data-lucide="moon" style="width:16px;height:16px"></i>';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}
function toggleTheme() { setTheme(getTheme() === 'dark' ? 'light' : 'dark'); }
function isLoggedIn()  { return sessionStorage.getItem(AUTH_KEY) === 'true'; }

function login(user, pass) {
  if (user === AUTH_USER && pass === AUTH_PASS) {
    sessionStorage.setItem(AUTH_KEY, 'true');
    applyAuthState(true);
    return true;
  }
  return false;
}
function logout() { sessionStorage.removeItem(AUTH_KEY); applyAuthState(false); }

function applyAuthState(loggedIn) {
  document.querySelectorAll('[contenteditable]').forEach(el => {
    el.contentEditable = loggedIn ? 'true' : 'false';
    el.style.cursor    = loggedIn ? 'text' : 'default';
  });
  const adminBtn  = document.getElementById('admin-btn');
  if (adminBtn)   adminBtn.textContent = loggedIn ? 'Sair' : 'Entrar';
  const editBadge = document.getElementById('edit-badge');
  if (editBadge)  editBadge.style.display = loggedIn ? 'flex' : 'none';
  const fab = document.getElementById('editor-fab');
  if (fab) fab.style.display = loggedIn ? 'flex' : 'none';
  if (loggedIn) document.body.classList.add('admin-mode');
  else          document.body.classList.remove('admin-mode');
  if (loggedIn && typeof initEditor !== 'undefined') {
    const aulaId = document.body.dataset.aulaId || null;
    initEditor(aulaId ? 'aula' : 'index', aulaId);
  }
}

function buildModal() {
  if (document.getElementById('auth-modal')) return;
  const m = document.createElement('div');
  m.id = 'auth-modal';
  m.innerHTML = '<div class="auth-overlay" id="auth-overlay"></div><div class="auth-box"><div class="auth-header"><div class="auth-logo">ETE <em>Cícero Dias</em></div><p class="auth-sub">Modo edição — somente professora</p></div><div class="auth-body"><input class="auth-input" id="auth-user" type="text" placeholder="Usuário" autocomplete="off"/><input class="auth-input" id="auth-pass" type="password" placeholder="Senha"/><div class="auth-error" id="auth-error">Usuário ou senha incorretos.</div><button class="auth-submit" id="auth-submit">Entrar</button></div></div>';
  document.body.appendChild(m);
  document.getElementById('auth-overlay').addEventListener('click', closeModal);
  document.getElementById('auth-submit').addEventListener('click', handleLogin);
  document.getElementById('auth-pass').addEventListener('keydown', e => { if(e.key==='Enter') handleLogin(); });
}
function openModal()  { buildModal(); document.getElementById('auth-modal').classList.add('open'); setTimeout(()=>document.getElementById('auth-user')?.focus(),50); }
function closeModal() { document.getElementById('auth-modal')?.classList.remove('open'); }
function handleLogin() {
  const user=document.getElementById('auth-user')?.value.trim();
  const pass=document.getElementById('auth-pass')?.value;
  const err =document.getElementById('auth-error');
  if(login(user,pass)){closeModal();if(err)err.style.display='none';}
  else{if(err)err.style.display='block';document.getElementById('auth-pass').value='';document.getElementById('auth-pass').focus();}
}

function injectNavItems() {
  const nav = document.querySelector('.nav-right') || document.querySelector('.nav');
  if (!nav) return;
  if (!document.getElementById('edit-badge')) {
    const b=document.createElement('div');b.id='edit-badge';b.innerHTML='<span class="edit-dot"></span>Editando';b.style.display='none';nav.appendChild(b);
  }
  if (!document.getElementById('theme-btn')) {
    const t=document.createElement('button');t.id='theme-btn';t.className='nav-icon-btn';t.title='Tema';
    t.innerHTML='<i data-lucide="moon" style="width:16px;height:16px"></i>';
    t.addEventListener('click',toggleTheme);nav.appendChild(t);
  }
  if (!document.getElementById('admin-btn')) {
    const a=document.createElement('button');a.id='admin-btn';a.className='nav-admin-btn';a.textContent='Entrar';
    a.addEventListener('click',()=>{if(isLoggedIn())logout();else openModal();});nav.appendChild(a);
  }
}

function injectFixedBlobs() {
  if (document.getElementById('blobs-fixed')) return;
  const d=document.createElement('div');d.id='blobs-fixed';d.className='blobs-fixed';
  d.innerHTML='<div class="blob-f1"></div><div class="blob-f2"></div><div class="blob-f3"></div>';
  document.body.insertBefore(d,document.body.firstChild);
}

function injectAuthStyles() {
  if (document.getElementById('auth-styles')) return;
  const s=document.createElement('style');s.id='auth-styles';
  s.textContent=`
[data-theme="dark"]{--bg:#0d0820;--surface:rgba(30,15,60,.8);--elevated:rgba(25,12,50,.95);--glass:rgba(124,74,224,.1);--glass-b:rgba(124,74,224,.22);--text:#e8e0ff;--text-2:#c4b5fd;--text-3:#9b8abf;--border:rgba(124,74,224,.2);--shadow-sm:0 1px 3px rgba(0,0,0,.4);--shadow-md:0 6px 20px rgba(0,0,0,.5);--shadow-lg:0 18px 50px rgba(0,0,0,.6);}
[data-theme="dark"] body{background:var(--bg);color:var(--text);}
[data-theme="dark"] .nav{background:rgba(13,8,32,.92);}
[data-theme="dark"] .alt-bg{background-color:#130826;}
[data-theme="dark"] .aula-card{background:rgba(25,12,50,.9);border-color:rgba(124,74,224,.25);}
[data-theme="dark"] .comp-card,.section-inner .reveal{color:var(--text-2);}
[data-theme="dark"] .footer{background:#0a0618;border-top-color:rgba(124,74,224,.15);}
[data-theme="dark"] .sdlc-item,[data-theme="dark"] .sprint-cal,[data-theme="dark"] .bl-priority-list,[data-theme="dark"] .manifesto-item,[data-theme="dark"] .aval-card{background:rgba(25,12,50,.9);}
[data-theme="dark"] .section-title,[data-theme="dark"] .hero-medium-title,[data-theme="dark"] .article-title,[data-theme="dark"] h1,[data-theme="dark"] h2,[data-theme="dark"] h3{color:var(--text);}
[data-theme="dark"] .prose p,[data-theme="dark"] .article-lead,[data-theme="dark"] .callout-text{color:var(--text-2);}
[data-theme="dark"] .highlight{background:rgba(124,74,224,.2);}
[data-theme="dark"] .auth-box{background:#1a0533;}
[data-theme="dark"] .auth-logo{color:#e8e0ff;}
[data-theme="dark"] .auth-input{background:#0f0a1e;color:#e8e0ff;border-color:rgba(124,74,224,.3);}
.blobs-fixed{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
.blob-f1{position:absolute;width:600px;height:400px;border-radius:60% 40% 55% 45%/50% 60% 40% 50%;background:radial-gradient(circle at 40%,rgba(124,74,224,.15),rgba(193,77,216,.08) 60%,transparent);top:-10%;left:0%;filter:blur(80px);animation:bdf1 22s ease-in-out infinite;}
.blob-f2{position:absolute;width:500px;height:600px;border-radius:40% 60% 45% 55%/65% 35% 65% 35%;background:radial-gradient(circle at 60%,rgba(100,150,255,.12),rgba(193,77,216,.08) 55%,transparent);top:30%;right:-5%;filter:blur(80px);animation:bdf2 28s ease-in-out infinite;}
.blob-f3{position:absolute;width:400px;height:500px;border-radius:70% 30% 50% 50%/35% 70% 30% 65%;background:radial-gradient(circle at 35%,rgba(67,233,123,.08),rgba(124,74,224,.06) 60%,transparent);bottom:10%;left:20%;filter:blur(80px);animation:bdf3 24s ease-in-out infinite;}
@keyframes bdf1{0%,100%{transform:translate(0,0) scale(1);}33%{transform:translate(50px,-40px) scale(1.06);}66%{transform:translate(-30px,25px) scale(.96);}}
@keyframes bdf2{0%,100%{transform:translate(0,0);}40%{transform:translate(-40px,50px) scale(.94);}75%{transform:translate(25px,-30px) scale(1.04);}}
@keyframes bdf3{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(40px,-45px) scale(1.07) rotate(8deg);}}
section,.section,.hero,.hero-medium{position:relative;z-index:1;}
#auth-modal{display:none;position:fixed;inset:0;z-index:9000;align-items:center;justify-content:center;}
#auth-modal.open{display:flex;}
.auth-overlay{position:absolute;inset:0;background:rgba(9,11,32,.55);backdrop-filter:blur(6px);}
.auth-box{position:relative;z-index:1;background:#fff;border-radius:20px;padding:2rem 2.5rem;width:100%;max-width:360px;box-shadow:0 24px 60px rgba(0,0,0,.25);animation:auth-in .25s ease;}
@keyframes auth-in{from{opacity:0;transform:translateY(16px) scale(.97);}to{opacity:1;transform:none;}}
.auth-header{text-align:center;margin-bottom:1.5rem;}
.auth-logo{font-family:'Cormorant Garamond',Georgia,serif;font-size:1.4rem;font-weight:300;letter-spacing:-.02em;margin-bottom:.3rem;}
.auth-logo em{font-style:italic;color:#7c4ae0;}
.auth-sub{font-size:.78rem;color:#7B6B9B;}
.auth-body{display:flex;flex-direction:column;gap:.75rem;}
.auth-input{width:100%;padding:.75rem 1rem;border:1.5px solid rgba(124,74,224,.2);border-radius:10px;font-family:inherit;font-size:.9rem;outline:none;transition:border-color .2s;box-sizing:border-box;}
.auth-input:focus{border-color:#7c4ae0;}
.auth-error{font-size:.8rem;color:#dc2626;display:none;text-align:center;}
.auth-submit{padding:.8rem;background:linear-gradient(135deg,#7c4ae0,#532d9f);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:.9rem;font-weight:700;cursor:pointer;transition:opacity .2s;}
.auth-submit:hover{opacity:.9;}
.nav-icon-btn{width:34px;height:34px;border-radius:9px;border:1.5px solid var(--border,rgba(124,74,224,.14));background:transparent;color:var(--text-2,#4A3C6B);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,border-color .2s;}
.nav-icon-btn:hover{background:var(--glass,rgba(124,74,224,.07));border-color:#7c4ae0;color:#7c4ae0;}
.nav-admin-btn{padding:.35rem .9rem;border-radius:8px;border:1.5px solid rgba(124,74,224,.3);background:transparent;color:#7c4ae0;font-family:inherit;font-size:.75rem;font-weight:700;cursor:pointer;transition:all .2s;}
.nav-admin-btn:hover{background:rgba(124,74,224,.08);border-color:#7c4ae0;}
#edit-badge{display:flex;align-items:center;gap:.4rem;font-size:.68rem;font-weight:700;color:#7c4ae0;background:rgba(124,74,224,.1);border:1px solid rgba(124,74,224,.2);border-radius:99px;padding:.22rem .7rem;}
.edit-dot{width:6px;height:6px;border-radius:50%;background:#7c4ae0;animation:pulse 2s ease-in-out infinite;}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(1.5);}}
body.admin-mode [contenteditable]:hover{outline:1px dashed rgba(124,74,224,.35);border-radius:4px;}
body.admin-mode [contenteditable]:focus{outline:2px solid rgba(124,74,224,.45);border-radius:4px;background:rgba(124,74,224,.04);}
  `;
  document.head.appendChild(s);
}

function initAuth() {
  injectAuthStyles();
  injectFixedBlobs();
  injectNavItems();
  setTheme(getTheme());
  applyAuthState(isLoggedIn());
}
document.addEventListener('DOMContentLoaded', initAuth);

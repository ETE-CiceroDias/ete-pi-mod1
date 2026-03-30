// ── editor.js v2 — WYSIWYG ──────────────────────────────────────────────

async function saveDB(db){await fetch('/api/db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(db)});}
async function saveAulaContent(id,content){await fetch('/api/aula/'+id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(content)});}
async function loadAulaContent(id){try{const r=await fetch('/api/aula/'+id);return await r.json();}catch(e){return {};}}

function showToast(msg){
  document.querySelectorAll('.wy-toast').forEach(t=>t.remove());
  const t=document.createElement('div');t.className='wy-toast';t.textContent=msg;
  document.body.appendChild(t);requestAnimationFrame(()=>t.classList.add('wy-toast-show'));
  setTimeout(()=>{t.classList.remove('wy-toast-show');setTimeout(()=>t.remove(),300);},2500);
}

let _lastRange=null,_aulaId=null,_db=null,_saveTimer=null;
function isAdmin(){return document.body.classList.contains('admin-mode');}
function autoSave(){clearTimeout(_saveTimer);_saveTimer=setTimeout(saveAll,1500);}

// ── Toolbar WYSIWYG ─────────────────────────────────────────────────────
function buildToolbar(){
  if(document.getElementById('wy-toolbar'))return;
  const t=document.createElement('div');t.id='wy-toolbar';
  t.innerHTML=`
    <button class="wtb" data-cmd="bold"         title="Negrito"><b>B</b></button>
    <button class="wtb" data-cmd="italic"        title="Itálico"><i>I</i></button>
    <button class="wtb" data-cmd="underline"     title="Sublinhado"><u>U</u></button>
    <button class="wtb" data-cmd="strikeThrough" title="Tachado"><s>S</s></button>
    <div class="wtb-sep"></div>
    <select class="wtb-sel" id="wtb-sz">
      <option value="1">Pequeno</option><option value="3" selected>Normal</option>
      <option value="5">Grande</option><option value="7">Enorme</option>
    </select>
    <select class="wtb-sel" id="wtb-al">
      <option value="left">← Esq</option><option value="center">↔ Centro</option>
      <option value="right">→ Dir</option><option value="justify">⇔ Just</option>
    </select>
    <div class="wtb-sep"></div>
    <div class="wtb-color" style="background:#7c4ae0" data-color="#7c4ae0"></div>
    <div class="wtb-color" style="background:#c14dd8" data-color="#c14dd8"></div>
    <div class="wtb-color" style="background:#10b981" data-color="#10b981"></div>
    <div class="wtb-color" style="background:#ef4444" data-color="#ef4444"></div>
    <div class="wtb-color" style="background:#f59e0b" data-color="#f59e0b"></div>
    <div class="wtb-color" style="background:#fff;border:1px solid rgba(255,255,255,.3)" data-color="#ffffff"></div>
    <input class="wtb-cp" type="color" id="wtb-cp" title="Cor personalizada"/>
    <div class="wtb-sep"></div>
    <button class="wtb wtb-sm" data-cmd="removeFormat" title="Limpar">✕</button>
    <button class="wtb wtb-sm" id="wtb-link" title="Link">🔗</button>`;
  document.body.appendChild(t);
  function restore(){if(!_lastRange)return;const s=window.getSelection();s.removeAllRanges();s.addRange(_lastRange);}
  t.querySelectorAll('[data-cmd]').forEach(b=>b.addEventListener('mousedown',e=>{e.preventDefault();restore();document.execCommand(b.dataset.cmd,false,null);autoSave();}));
  t.querySelectorAll('[data-color]').forEach(b=>b.addEventListener('mousedown',e=>{e.preventDefault();restore();document.execCommand('foreColor',false,b.dataset.color);autoSave();}));
  document.getElementById('wtb-cp').addEventListener('input',e=>{restore();document.execCommand('foreColor',false,e.target.value);autoSave();});
  document.getElementById('wtb-sz').addEventListener('change',e=>{restore();document.execCommand('fontSize',false,e.target.value);autoSave();});
  document.getElementById('wtb-al').addEventListener('change',e=>{restore();const m={left:'justifyLeft',center:'justifyCenter',right:'justifyRight',justify:'justifyFull'};document.execCommand(m[e.target.value],false,null);autoSave();});
  document.getElementById('wtb-link').addEventListener('mousedown',e=>{e.preventDefault();restore();const u=prompt('URL:','https://');if(u){document.execCommand('createLink',false,u);autoSave();}});
  document.addEventListener('mousedown',e=>{if(!t.contains(e.target)&&!e.target.closest('[contenteditable]'))t.classList.remove('wtb-show');});
}

function positionToolbar(range){
  const t=document.getElementById('wy-toolbar');if(!t)return;
  const r=range.getBoundingClientRect(),tw=t.offsetWidth||380;
  let l=r.left+window.scrollX+r.width/2-tw/2;
  l=Math.max(8,Math.min(l,window.innerWidth-tw-8));
  const top=r.top+window.scrollY-56;
  t.style.left=l+'px';t.style.top=(top<10?r.bottom+window.scrollY+8:top)+'px';
  t.classList.add('wtb-show');
}

function initTextSelect(){
  document.addEventListener('mouseup',e=>{
    if(!isAdmin())return;
    const t=document.getElementById('wy-toolbar');
    if(t&&t.contains(e.target))return;
    setTimeout(()=>{
      const sel=window.getSelection();
      if(!sel||sel.isCollapsed||!sel.rangeCount){t&&t.classList.remove('wtb-show');return;}
      const el=sel.anchorNode?.parentElement;
      if(!el?.closest('[contenteditable="true"]')){t&&t.classList.remove('wtb-show');return;}
      _lastRange=sel.getRangeAt(0).cloneRange();
      positionToolbar(_lastRange);
    },10);
  });
}

// ── Tornar tudo editável ─────────────────────────────────────────────────
function makeEditable(){
  const SELS=[
    'h1','h2','h3','h4','p','li',
    '.section-title','.section-sub','.section-label',
    '.hero-ed-title','.hero-cover-title','.hero-cover-sub','.hero-ed-sub',
    '.article-title','.article-lead','.article-body',
    '.callout-title','.callout-text',
    '.hero-ed-name','.hero-ed-role',
    '.kw','.ct','.sig','.highlight',
    '.aula-title','.aula-desc','.aula-meta-item',
    '.footer-logo','.footer-sub','.footer-text',
    '.bl-desc-t','.bl-title-t','.bl-example',
    '.sdlc-name','.sip-title','.sip-desc',
    '.person-desc','.person-name','.person-role',
    '.comp-card-title','.comp-card-body p',
    '.sprint-dates','.st-foco',
    '.sobre-bio','.sobre-role',
    '.prose p','.section-sub',
    '[class*="title"]:not(title)',
    '[class*="desc"]',
    '[class*="sub"]:not(sub)',
    '.nav-aula-info'
  ];
  SELS.forEach(sel=>{
    document.querySelectorAll(sel).forEach(el=>{
      if(el.closest('#wy-toolbar,#wy-panel,#wy-index-panel,.wy-toast,#blobs-fixed,nav'))return;
      if(el.contentEditable==='true')return;
      el.contentEditable='true';el.dataset.wyEl='1';
      el.addEventListener('input',autoSave);
    });
  });
  // Imagens
  document.querySelectorAll('img:not([data-wy-img])').forEach(img=>{
    img.dataset.wyImg='1';img.style.cursor='pointer';img.title='Clique para trocar imagem';
    img.addEventListener('click',()=>{
      if(!isAdmin())return;
      const u=prompt('URL da nova imagem:',img.src);if(u){img.src=u;autoSave();}
    });
  });
}

function disableEditable(){
  document.querySelectorAll('[data-wy-el]').forEach(el=>{el.contentEditable='false';delete el.dataset.wyEl;});
  document.querySelectorAll('img[data-wy-img]').forEach(img=>{img.style.cursor='';img.title='';});
}

// ── Drag-and-drop de seções ─────────────────────────────────────────────
let _dragSec=null,_dragPh=null;
function initDrag(){
  document.querySelectorAll('section[id]:not(#hero)').forEach(sec=>{
    if(sec.dataset.wyDrag)return;sec.dataset.wyDrag='1';
    const h=document.createElement('div');h.className='wy-drag-h';h.innerHTML='⠿';h.title='Arrastar seção';h.setAttribute('draggable','true');
    sec.style.position='relative';sec.insertBefore(h,sec.firstChild);
    h.addEventListener('dragstart',e=>{_dragSec=sec;sec.classList.add('wy-dragging');e.dataTransfer.effectAllowed='move';_dragPh=document.createElement('div');_dragPh.className='wy-drag-ph';_dragPh.style.height=sec.offsetHeight+'px';});
    h.addEventListener('dragend',()=>{_dragSec?.classList.remove('wy-dragging');_dragPh?.remove();_dragSec=null;_dragPh=null;autoSave();showToast('Seção movida ✓');});
  });
  document.addEventListener('dragover',e=>{
    if(!_dragSec)return;e.preventDefault();
    const tgt=e.target.closest('section[id]:not(#hero)');if(!tgt||tgt===_dragSec)return;
    const r=tgt.getBoundingClientRect();const before=(e.clientY-r.top)<r.height/2;
    if(_dragPh)tgt.parentNode.insertBefore(_dragPh,before?tgt:tgt.nextSibling);
  });
  document.addEventListener('drop',e=>{
    if(!_dragSec||!_dragPh)return;e.preventDefault();
    _dragPh.parentNode?.insertBefore(_dragSec,_dragPh);
  });
}

// ── Salvar tudo ──────────────────────────────────────────────────────────
async function saveAll(){
  if(!_aulaId)return;
  const data={id:_aulaId,editables:{},images:{},sectionOrder:[]};
  document.querySelectorAll('[data-wy-el],[contenteditable="true"]').forEach((el,i)=>{data.editables['c'+i]=el.innerHTML;});
  document.querySelectorAll('img[data-wy-img]').forEach((img,i)=>{data.images['i'+i]=img.src;});
  document.querySelectorAll('section[id]').forEach(s=>{data.sectionOrder.push(s.id);});
  await saveAulaContent(_aulaId,data);showToast('Salvo ✓');
}

async function restoreAll(id){
  const data=await loadAulaContent(id);if(!data||!data.editables)return;
  document.querySelectorAll('[data-wy-el],[contenteditable="true"]').forEach((el,i)=>{if(data.editables['c'+i]!==undefined)el.innerHTML=data.editables['c'+i];});
  if(data.images)document.querySelectorAll('img[data-wy-img]').forEach((img,i)=>{if(data.images['i'+i])img.src=data.images['i'+i];});
}

// ── Painel lateral ───────────────────────────────────────────────────────
function buildPanel(){
  if(document.getElementById('wy-panel'))return;
  const p=document.createElement('div');p.id='wy-panel';
  p.innerHTML=`<div class="wyp-head"><span>Editor</span><button id="wyp-close">✕</button></div>
    <div class="wyp-body">
      <div class="wyp-lbl">Adicionar bloco</div>
      <div class="wyp-blocks">
        <button class="wyp-b" data-t="text">📝 Parágrafo</button>
        <button class="wyp-b" data-t="heading">🔤 Título</button>
        <button class="wyp-b" data-t="callout">💡 Destaque</button>
        <button class="wyp-b" data-t="image">🖼 Imagem</button>
        <button class="wyp-b" data-t="divider">— Divisor</button>
        <button class="wyp-b" data-t="quote">❝ Citação</button>
      </div>
      <div class="wyp-lbl" style="margin-top:1.25rem">Ações</div>
      <button class="wyp-action" id="wyp-save">💾 Salvar aula</button>
      <button class="wyp-action wyp-danger" id="wyp-reload">↺ Restaurar</button>
    </div>`;
  document.body.appendChild(p);
  document.getElementById('wyp-close').onclick=()=>p.classList.remove('wyp-open');
  document.getElementById('wyp-save').onclick=saveAll;
  document.getElementById('wyp-reload').onclick=()=>{if(confirm('Restaurar?'))location.reload();};
  p.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>addBlock(b.dataset.t));
}

function addBlock(type){
  const zone=document.getElementById('editor-drop-zone')||document.querySelector('.section-inner')||document.body;
  const w=document.createElement('div');w.className='wy-blk wy-blk-'+type;
  const ctrl='<div class="wy-blk-ctrl"><span class="wy-blk-drag">⠿</span><button onclick="this.closest(\'.wy-blk\').remove();autoSave()">✕</button></div>';
  if(type==='text')w.innerHTML=ctrl+'<p contenteditable="true" class="wy-blk-p">Clique para editar...</p>';
  else if(type==='heading')w.innerHTML=ctrl+'<h2 contenteditable="true" class="section-title">Novo <em>título</em></h2>';
  else if(type==='callout')w.innerHTML=ctrl+'<div class="article-callout"><div class="callout-icon">💡</div><div><div class="callout-title" contenteditable="true">Destaque</div><p class="callout-text" contenteditable="true">Texto de destaque</p></div></div>';
  else if(type==='image'){w.innerHTML=ctrl+'<div class="wy-blk-img"><input class="wy-blk-url" placeholder="URL da imagem..."/><button class="wy-blk-load">Carregar</button><img class="img-section" src="" style="display:none"/><p contenteditable="true" class="wy-blk-cap">Legenda</p></div>';w.querySelector('.wy-blk-load').onclick=()=>{const u=w.querySelector('.wy-blk-url').value.trim();if(u){const i=w.querySelector('img');i.src=u;i.style.display='block';autoSave();}}}
  else if(type==='divider')w.innerHTML=ctrl+'<hr style="border:none;border-top:2px solid var(--border);margin:1.5rem 0"/>';
  else if(type==='quote')w.innerHTML=ctrl+'<blockquote contenteditable="true" class="wy-blk-q">"Sua citação aqui."</blockquote>';
  zone.appendChild(w);makeEditable();w.querySelector('[contenteditable]')?.focus();autoSave();
}

// FAB
function buildFAB(){
  if(document.getElementById('wy-fab'))return;
  const f=document.createElement('button');f.id='wy-fab';
  f.innerHTML='<i data-lucide="pencil" style="width:20px;height:20px"></i>';f.title='Editor';
  f.onclick=()=>{const p=document.getElementById('wy-panel')||document.getElementById('wy-index-panel');p&&p.classList.toggle('wyp-open');};
  document.body.appendChild(f);if(typeof lucide!=='undefined')lucide.createIcons();
}

// ── Index editor ─────────────────────────────────────────────────────────
function buildIndexPanel(){
  if(document.getElementById('wy-index-panel'))return;
  const p=document.createElement('div');p.id='wy-index-panel';
  p.innerHTML=`<div class="wyp-head"><span>Gerenciar Aulas</span><button id="wyip-close">✕</button></div>
    <div class="wyp-body">
      <button class="wyp-action" id="wyip-new">➕ Nova Aula</button>
      <div id="wyip-list"></div>
    </div>`;
  document.body.appendChild(p);
  document.getElementById('wyip-close').onclick=()=>p.classList.remove('wyp-open');
  document.getElementById('wyip-new').onclick=openNewModal;
}

function renderList(){
  const l=document.getElementById('wyip-list');if(!l||!_db)return;l.innerHTML='';
  _db.aulas.forEach((a,i)=>{
    const d=document.createElement('div');d.className='wy-ai';
    d.innerHTML=`<div class="wy-ai-i"><span class="wy-ai-n">${a.numero}</span><span class="wy-ai-t">${a.titulo} ${a.tituloEm}</span></div>
      <div class="wy-ai-a">
        <button onclick="editCard(${i})" title="Editar">✏️</button>
        <button onclick="mvCard(${i},-1)">↑</button>
        <button onclick="mvCard(${i},1)">↓</button>
        <button onclick="togStatus(${i})">${a.status==='publicada'?'👁':'🔒'}</button>
      </div>`;
    l.appendChild(d);
  });
}
window.editCard=function(i){const a=_db.aulas[i];const t=prompt('Título:',a.titulo)??a.titulo;const e=prompt('Em itálico:',a.tituloEm)??a.tituloEm;const d=prompt('Descrição:',a.descricao)??a.descricao;const dA=prompt('Data Turma A:',a.dataA||'')??a.dataA;const dB=prompt('Data Turma B:',a.dataB||'')??a.dataB;_db.aulas[i]={...a,titulo:t,tituloEm:e,descricao:d,dataA:dA,dataB:dB};saveDB(_db).then(()=>{renderList();if(window.renderCards)renderCards(_db.aulas);showToast('Atualizado ✓');});};
window.mvCard=async function(i,d){const n=i+d;if(n<0||n>=_db.aulas.length)return;[_db.aulas[i],_db.aulas[n]]=[_db.aulas[n],_db.aulas[i]];await saveDB(_db);renderList();if(window.renderCards)renderCards(_db.aulas);showToast('Ordem salva ✓');};
window.togStatus=async function(i){_db.aulas[i].status=_db.aulas[i].status==='publicada'?'em-breve':'publicada';await saveDB(_db);renderList();if(window.renderCards)renderCards(_db.aulas);showToast('Status atualizado ✓');};

function openNewModal(){
  const m=document.createElement('div');m.id='wy-nm';
  m.innerHTML=`<div class="wy-mo"></div><div class="wy-mb"><h3>Nova Aula</h3>
    <label>ID</label><input id="nm-id" placeholder="05"/>
    <label>Título</label><input id="nm-titulo"/>
    <label>Em itálico</label><input id="nm-em"/>
    <label>Descrição</label><textarea id="nm-desc" rows="2"></textarea>
    <label>Data Turma A</label><input id="nm-dA" placeholder="10 abr 2026"/>
    <label>Data Turma B</label><input id="nm-dB" placeholder="11 abr 2026"/>
    <label>Duração</label><input id="nm-dur" value="1h20"/>
    <label>Tópicos (vírgula)</label><input id="nm-top"/>
    <label>Cover URL</label><input id="nm-cover"/>
    <div class="wy-ma"><button id="nm-cancel">Cancelar</button><button id="nm-ok">Criar</button></div>
    <div id="nm-err" style="color:#ef4444;font-size:.8rem;margin-top:.5rem"></div></div>`;
  document.body.appendChild(m);
  m.querySelector('.wy-mo').onclick=()=>m.remove();
  document.getElementById('nm-cancel').onclick=()=>m.remove();
  document.getElementById('nm-ok').onclick=async()=>{
    const id=document.getElementById('nm-id').value.trim().padStart(2,'0');
    const titulo=document.getElementById('nm-titulo').value.trim();
    if(!id||!titulo){document.getElementById('nm-err').textContent='ID e Título obrigatórios.';return;}
    const body={id,titulo,tituloEm:document.getElementById('nm-em').value.trim(),descricao:document.getElementById('nm-desc').value.trim(),dataA:document.getElementById('nm-dA').value.trim(),dataB:document.getElementById('nm-dB').value.trim(),duracao:document.getElementById('nm-dur').value||'1h20',topicos:document.getElementById('nm-top').value.split(',').map(t=>t.trim()).filter(Boolean),coverUrl:document.getElementById('nm-cover').value.trim()};
    const r=await fetch('/api/nova-aula',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const d=await r.json();if(!r.ok){document.getElementById('nm-err').textContent=d.error||'Erro.';return;}
    m.remove();await fetch('/api/db').then(r=>r.json()).then(db=>{_db=db;renderList();if(window.renderCards)renderCards(_db.aulas);});showToast('Aula '+id+' criada ✓');
  };
}

// ── CSS ──────────────────────────────────────────────────────────────────
function injectStyles(){
  if(document.getElementById('wy-css'))return;
  const s=document.createElement('style');s.id='wy-css';
  s.textContent=`
#wy-toolbar{position:fixed;z-index:9100;display:none;align-items:center;gap:.3rem;flex-wrap:wrap;background:#1a0533;border-radius:12px;padding:.5rem .75rem;box-shadow:0 8px 32px rgba(0,0,0,.5);border:1px solid rgba(124,74,224,.3);}
#wy-toolbar.wtb-show{display:flex;}
.wtb{min-width:30px;height:28px;border:none;border-radius:7px;background:transparent;color:#e8e0ff;font-size:.82rem;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;transition:background .15s;}
.wtb:hover{background:rgba(255,255,255,.15);}
.wtb-sm{min-width:24px;font-size:.72rem;}
.wtb-sep{width:1px;height:20px;background:rgba(255,255,255,.15);margin:0 .2rem;}
.wtb-sel{background:#2a1050;color:#e8e0ff;border:1px solid rgba(124,74,224,.3);border-radius:7px;padding:.2rem .4rem;font-size:.75rem;cursor:pointer;outline:none;}
.wtb-color{width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,.25);cursor:pointer;transition:transform .15s;flex-shrink:0;}
.wtb-color:hover{transform:scale(1.25);}
.wtb-cp{width:22px;height:22px;border-radius:50%;border:2px solid rgba(255,255,255,.25);cursor:pointer;padding:0;background:transparent;}
#wy-fab{position:fixed;bottom:5rem;right:1.5rem;z-index:8900;width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#7c4ae0,#532d9f);color:#fff;border:none;cursor:pointer;display:none;align-items:center;justify-content:center;box-shadow:0 6px 24px rgba(124,74,224,.5);transition:transform .2s;}
body.admin-mode #wy-fab{display:flex;}
#wy-fab:hover{transform:scale(1.08) translateY(-2px);}
#wy-panel,#wy-index-panel{position:fixed;right:-320px;top:0;bottom:0;width:300px;z-index:8800;background:#fff;box-shadow:-4px 0 30px rgba(0,0,0,.12);transition:right .3s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;font-family:'Plus Jakarta Sans',sans-serif;}
#wy-panel.wyp-open,#wy-index-panel.wyp-open{right:0;}
.wyp-head{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;background:linear-gradient(135deg,#7c4ae0,#532d9f);color:#fff;}
.wyp-head span{font-weight:700;font-size:.9rem;}
.wyp-head button{background:rgba(255,255,255,.15);border:none;color:#fff;width:28px;height:28px;border-radius:7px;cursor:pointer;font-size:.9rem;display:flex;align-items:center;justify-content:center;}
.wyp-body{flex:1;overflow-y:auto;padding:1.25rem;}
.wyp-lbl{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#7B6B9B;margin-bottom:.75rem;}
.wyp-blocks{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;}
.wyp-b{padding:.6rem .5rem;border:1.5px solid rgba(124,74,224,.2);border-radius:10px;background:transparent;font-family:inherit;font-size:.78rem;cursor:pointer;text-align:center;transition:background .15s,border-color .15s;}
.wyp-b:hover{background:rgba(124,74,224,.08);border-color:#7c4ae0;}
.wyp-action{width:100%;padding:.7rem;margin-top:.5rem;background:#7c4ae0;color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:.85rem;font-weight:700;cursor:pointer;transition:opacity .2s;}
.wyp-action:hover{opacity:.88;}
.wyp-danger{background:#ef4444;}
.wy-blk{position:relative;margin:1rem 0;padding:1rem 1rem 1rem 2rem;border:2px dashed rgba(124,74,224,.2);border-radius:12px;}
.wy-blk:hover{border-color:rgba(124,74,224,.4);}
.wy-blk-ctrl{position:absolute;top:.5rem;right:.5rem;display:flex;gap:.25rem;opacity:0;transition:opacity .2s;}
.wy-blk:hover .wy-blk-ctrl{opacity:1;}
.wy-blk-drag{cursor:grab;color:#7c4ae0;font-size:1rem;padding:.2rem;}
.wy-blk-ctrl button{width:24px;height:24px;border-radius:6px;border:none;cursor:pointer;background:rgba(239,68,68,.1);color:#ef4444;font-size:.8rem;display:flex;align-items:center;justify-content:center;}
.wy-blk-p{font-size:1rem;color:var(--text-2);line-height:1.85;outline:none;margin:0;}
.wy-blk-q{border-left:3px solid var(--primary);padding:.75rem 1.25rem;font-family:var(--font-h);font-size:1.3rem;font-style:italic;color:var(--text-2);outline:none;margin:0;}
.wy-blk-img{display:flex;flex-direction:column;gap:.5rem;}
.wy-blk-url{padding:.5rem .75rem;border:1.5px solid rgba(124,74,224,.2);border-radius:8px;font-family:inherit;font-size:.82rem;outline:none;}
.wy-blk-load{padding:.4rem .9rem;background:#7c4ae0;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:.82rem;font-weight:700;width:fit-content;}
.wy-blk-cap{font-size:.8rem;color:#7B6B9B;font-style:italic;outline:none;margin:0;}
.wy-drag-h{display:none;position:absolute;left:-36px;top:50%;transform:translateY(-50%);width:28px;height:28px;border-radius:8px;background:rgba(124,74,224,.1);color:#7c4ae0;cursor:grab;align-items:center;justify-content:center;font-size:1.1rem;z-index:100;transition:background .2s;}
body.admin-mode .wy-drag-h{display:flex;}
.wy-drag-h:hover{background:rgba(124,74,224,.2);}
.wy-dragging{opacity:.4;}
.wy-drag-ph{background:rgba(124,74,224,.08);border:2px dashed rgba(124,74,224,.3);border-radius:12px;margin:.5rem 0;}
.wy-toast{position:fixed;bottom:1.5rem;left:50%;z-index:9999;transform:translateX(-50%) translateY(20px);background:#1a0533;color:#fff;padding:.6rem 1.5rem;border-radius:99px;font-size:.82rem;font-weight:600;opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;}
.wy-toast-show{opacity:1;transform:translateX(-50%) translateY(0);}
#wy-nm{position:fixed;inset:0;z-index:9500;display:flex;align-items:center;justify-content:center;}
.wy-mo{position:absolute;inset:0;background:rgba(9,11,32,.55);backdrop-filter:blur(5px);}
.wy-mb{position:relative;z-index:1;background:#fff;border-radius:18px;padding:2rem;width:100%;max-width:420px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 60px rgba(0,0,0,.2);}
.wy-mb h3{font-family:'Cormorant Garamond',serif;font-size:1.6rem;font-weight:300;color:#7c4ae0;margin-bottom:1.25rem;}
.wy-mb label{display:block;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#7B6B9B;margin:.75rem 0 .3rem;}
.wy-mb input,.wy-mb textarea{width:100%;padding:.65rem .85rem;border:1.5px solid rgba(124,74,224,.2);border-radius:9px;font-family:inherit;font-size:.88rem;outline:none;box-sizing:border-box;}
.wy-mb input:focus,.wy-mb textarea:focus{border-color:#7c4ae0;}
.wy-ma{display:flex;gap:.75rem;margin-top:1.25rem;}
.wy-ma button{flex:1;padding:.75rem;border-radius:10px;font-family:inherit;font-size:.88rem;font-weight:700;cursor:pointer;border:none;}
.wy-ma button:first-child{background:#f5f0ff;color:#7c4ae0;}
.wy-ma button:last-child{background:linear-gradient(135deg,#7c4ae0,#532d9f);color:#fff;}
.wy-ai{border:1.5px solid rgba(124,74,224,.15);border-radius:10px;padding:.65rem 1rem;display:flex;align-items:center;justify-content:space-between;margin-top:.5rem;}
.wy-ai-i{display:flex;align-items:center;gap:.5rem;flex:1;min-width:0;}
.wy-ai-n{font-size:.7rem;font-weight:700;color:#7c4ae0;min-width:1.5rem;}
.wy-ai-t{font-size:.8rem;color:#090B20;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.wy-ai-a{display:flex;gap:.3rem;}
.wy-ai-a button{width:26px;height:26px;border:1px solid #eee;border-radius:6px;background:#fff;cursor:pointer;font-size:.8rem;display:flex;align-items:center;justify-content:center;}
.wy-ai-a button:hover{background:#f0e8ff;border-color:#7c4ae0;}
body.admin-mode [contenteditable="true"]:hover{background:rgba(124,74,224,.04);border-radius:3px;}
body.admin-mode [contenteditable="true"]:focus{background:rgba(124,74,224,.07);border-radius:3px;outline:1px solid rgba(124,74,224,.3);}
body.admin-mode section[id]{position:relative;}
body.admin-mode img[data-wy-img]:hover{outline:2px solid #7c4ae0;cursor:pointer;}
[data-theme="dark"] #wy-panel,[data-theme="dark"] #wy-index-panel{background:#1a0533;border-left:1px solid rgba(124,74,224,.2);}
[data-theme="dark"] .wyp-lbl{color:#9b8abf;}
[data-theme="dark"] .wyp-b{border-color:rgba(124,74,224,.3);color:#e8e0ff;}
[data-theme="dark"] .wy-ai-t{color:#e8e0ff;}
[data-theme="dark"] .wy-mb{background:#1a0533;}
[data-theme="dark"] .wy-mb input,[data-theme="dark"] .wy-mb textarea{background:#0f0a1e;color:#e8e0ff;border-color:rgba(124,74,224,.3);}
  `;
  document.head.appendChild(s);
}

// ── Init ─────────────────────────────────────────────────────────────────
function initEditor(mode,aulaId){
  injectStyles();
  if(mode==='aula'&&aulaId){
    _aulaId=aulaId;
    buildToolbar();buildPanel();buildFAB();
    initTextSelect();initDrag();
    makeEditable();restoreAll(aulaId);
    window.addEventListener('beforeunload',saveAll);
  } else if(mode==='index'){
    buildIndexPanel();buildFAB();
    fetch('/api/db').then(r=>r.json()).then(db=>{_db=db;renderList();});
    document.getElementById('wy-fab').onclick=()=>{const p=document.getElementById('wy-index-panel');p&&p.classList.toggle('wyp-open');};
  }
}
function destroyEditor(){disableEditable();document.getElementById('wy-toolbar')?.classList.remove('wtb-show');document.getElementById('wy-panel')?.classList.remove('wyp-open');document.getElementById('wy-index-panel')?.classList.remove('wyp-open');}

// ── Garante que initEditor roda após DOM completo ────────────────────────
// Chamado pelo auth.js quando admin loga — re-expõe com garantia de DOM
const _origInitEditor = initEditor;
window.initEditor = function(mode, aulaId) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => _origInitEditor(mode, aulaId));
  } else {
    _origInitEditor(mode, aulaId);
  }
};

// Quando admin-mode muda, atualiza card nova aula se existir
document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderNewAulaCard !== 'undefined') {
    new MutationObserver(() => renderNewAulaCard())
      .observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }
});

// ── server.js — ETE PI Mod1 ─────────────────────────────────────────────
const express  = require('express');
const fs       = require('fs');
const path     = require('path');

const app  = express();
const PORT = 3000;
const ROOT = __dirname;

app.use(express.json());
app.use(express.static(ROOT));
// Serve arquivos estáticos da pasta public
app.use(express.static(path.join(ROOT, 'public')));

// Serve arquivos estáticos do restante do projeto (assets, CSS, etc.)
app.use('/assets', express.static(path.join(ROOT, 'assets')));
app.use('/css', express.static(path.join(ROOT))); // se quiser servir base.css e index.css

// ── GET /api/db — retorna db.json ───────────────────────────────────────
app.get('/api/db', (req, res) => {
  try {
    const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'db.json'), 'utf8'));
    res.json(db);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao ler db.json' });
  }
});

// ── POST /api/db — salva db.json inteiro ────────────────────────────────
app.post('/api/db', (req, res) => {
  try {
    fs.writeFileSync(
      path.join(ROOT, 'db.json'),
      JSON.stringify(req.body, null, 2),
      'utf8'
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao salvar db.json' });
  }
});

// ── GET /api/aula/:id — retorna conteúdo de uma aula ───────────────────
app.get('/api/aula/:id', (req, res) => {
  const file = path.join(ROOT, `aula-${req.params.id}`, 'content.json');
  if (!fs.existsSync(file)) return res.json({ sections: [] });
  try {
    res.json(JSON.parse(fs.readFileSync(file, 'utf8')));
  } catch (e) {
    res.status(500).json({ error: 'Erro ao ler content.json' });
  }
});

// ── POST /api/aula/:id — salva conteúdo de uma aula ────────────────────
app.post('/api/aula/:id', (req, res) => {
  const dir  = path.join(ROOT, `aula-${req.params.id}`);
  const file = path.join(dir, 'content.json');
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao salvar content.json' });
  }
});

// ── POST /api/nova-aula — cria pasta + arquivos de nova aula ───────────
app.post('/api/nova-aula', (req, res) => {
  const { id, titulo, tituloEm, descricao, data, duracao, topicos, coverUrl } = req.body;
  if (!id) return res.status(400).json({ error: 'id obrigatório' });

  const dir = path.join(ROOT, `aula-${id}`);
  if (fs.existsSync(dir)) return res.status(409).json({ error: 'Aula já existe' });

  try {
    fs.mkdirSync(dir, { recursive: true });

    // content.json inicial vazio
    const content = {
      id,
      titulo: titulo || `Aula ${id}`,
      tituloEm: tituloEm || '',
      descricao: descricao || '',
      coverUrl: coverUrl || '',
      sections: []
    };
    fs.writeFileSync(path.join(dir, 'content.json'), JSON.stringify(content, null, 2));

    // Atualiza db.json
    const dbFile = path.join(ROOT, 'db.json');
    const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    db.aulas.push({
      id,
      numero: id,
      titulo: titulo || `Aula`,
      tituloEm: tituloEm || id,
      descricao: descricao || '',
      data: data || null,
      duracao: duracao || '1h20',
      status: 'em-breve',
      href: `aula-${id}/index.html`,
      topicos: topicos || [],
      coverUrl: coverUrl || ''
    });
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));

    res.json({ ok: true, dir: `aula-${id}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── POST /api/publish/:id — marca aula como publicada ──────────────────
app.post('/api/publish/:id', (req, res) => {
  try {
    const dbFile = path.join(ROOT, 'db.json');
    const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    const aula = db.aulas.find(a => a.id === req.params.id);
    if (!aula) return res.status(404).json({ error: 'Aula não encontrada' });
    aula.status = req.body.status || 'publicada';
    if (req.body.data) aula.data = req.body.data;
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Serve index.html na raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 ETE PI Mod1 rodando em http://localhost:${PORT}`);
  console.log(`   Admin: http://localhost:${PORT} — login sams/cicero2026\n`);
});

# ETE PI Mod1 — v20

## Como rodar

```bash
# 1. Instalar dependências (só na primeira vez)
npm install

# 2. Iniciar o servidor
npm start

# 3. Abrir no navegador
http://localhost:3000
```

## Login admin

- **Usuário:** `sams`
- **Senha:** `cicero2026`

## Funcionalidades do admin

- ✏️ **Editar textos** — clique em qualquer texto para editar
- 🎨 **Formatar** — selecione texto para abrir toolbar (negrito, itálico, cores)
- ➕ **Adicionar blocos** — clique no FAB (lápis) para abrir o painel e adicionar texto, título, destaque, imagem ou divisor
- 💾 **Salvar** — botão "Salvar aula" no painel lateral
- 🌙 **Dark mode** — botão de lua/sol no nav
- 🗂 **Gerenciar aulas** — no index, o FAB abre o painel de gerenciamento
  - Reordenar aulas (↑↓)
  - Publicar / despublicar
  - Editar dados do card (título, datas, descrição)
  - Criar nova aula (gera pasta automaticamente)

## Estrutura

```
ete-pi-v20/
├── server.js          ← servidor Node
├── db.json            ← dados das aulas
├── auth.js            ← login + dark mode + blobs
├── editor.js          ← sistema de edição white label
├── app.js             ← renderiza cards do index
├── base.css           ← tokens globais
├── index.html         ← página inicial
├── index.css          ← estilos do index
├── aula-00/           ← apresentação da disciplina
│   ├── index.html
│   ├── style.css
│   ├── main.js
│   └── content.json   ← gerado pelo editor
└── aula-01/           ← metodologia ágil
    ├── index.html
    ├── style.css
    ├── main.js
    └── content.json   ← gerado pelo editor
```

## Criar nova aula (via admin)

1. Faça login
2. No index, clique no FAB (lápis)
3. Clique em "➕ Nova Aula"
4. Preencha ID (ex: `05`), título, datas da Turma A e B, etc.
5. Clique em "Criar Aula"
6. A pasta `aula-05/` é criada automaticamente com `content.json`
7. Acesse `http://localhost:3000/aula-05/` para editar o conteúdo

> **Nota:** A nova aula começa como template em branco. Use o painel de edição para adicionar blocos de texto, títulos, destaques e imagens.

<img width="1568" height="392" alt="classroom-pi" src="https://github.com/user-attachments/assets/1ebcb758-b3d3-4042-b05a-0ca2f9201162" />

# PI I — Material de Aula

![DISCIPLINA](https://img.shields.io/static/v1?label=DISCIPLINA&message=Projeto%20Integrador%20I&color=7c3aed&style=for-the-badge)
![TIPO](https://img.shields.io/static/v1?label=TIPO&message=Material%20de%20Aula&color=231f20&style=for-the-badge)
![STATUS](https://img.shields.io/static/v1?label=STATUS&message=Encerrado&color=6b7280&style=for-the-badge)
![AULAS](https://img.shields.io/static/v1?label=AULAS&message=7%20publicadas&color=0ea5e9&style=for-the-badge)
![STACK](https://img.shields.io/static/v1?label=STACK&message=Astro%206%20%2B%20MDX&color=ff5d01&style=for-the-badge)
![ETE Cícero Dias](https://img.shields.io/static/v1?label=ETE%20C%C3%ADcero%20Dias&message=2026&color=db1e2f&style=for-the-badge)

Site de documentação da disciplina **Projeto Integrador I** do curso técnico em Desenvolvimento de Sistemas da ETE Cícero Dias (Recife, PE), turma de 2026.

Cada aula vira uma página com o conteúdo teórico, exemplos de código, avisos e vídeos recomendados. O site também reúne três trilhas de apoio para quem está começando: Git, terminal e VS Code.

**Acesse:** [ete-pi-mod1.vercel.app](https://ete-pi-mod1.vercel.app)

**Código feito em sala:** [pi-mod1-2026](https://github.com/ETE-CiceroDias/pi-mod1-2026)

---

## O que tem no site

**Aulas**

| Nº | Aula | Tópicos |
|---|---|---|
| 00 | Apresentação da disciplina | Como o semestre funciona, avaliações, projeto ODS |
| 01 | Metodologia ágil | Scrum, Kanban, backlog |
| 02 | Como a web funciona | Cliente, servidor, navegador |
| 03 | HTML: tags e estrutura | Tag, atributo, elemento, estrutura do documento |
| 04 | Formatação de texto | Títulos h1–h6, `strong`, `em`, `mark`, `del`, `sub`, `sup` |
| 05 | Links | `href`, `target`, `rel`, âncoras, links internos e externos |
| 06 | Desafio: página pessoal | Atividade avaliativa (em breve) |
| 07 | Listas | `ul`, `ol`, `li`, `type`, `start`, aninhamento |

**Trilhas de apoio**

- **Universo Git:** versionamento do zero, com os comandos do dia a dia.
- **Universo Terminal:** o básico da linha de comando.
- **Universo VS Code:** configuração do editor, extensões e fonte.

---

## Para quem mantém o site

### Rodando localmente

**Pré-requisito:** Node.js 22 ou superior.

```bash
git clone -b version-astro https://github.com/ETE-CiceroDias/ete-pi-mod1.git
cd ete-pi-mod1
npm install
npm run dev
```

O site abre em `http://localhost:4321`.

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com recarga automática |
| `npm run build` | Gera o site estático em `dist/` |
| `npm run preview` | Serve o build localmente para conferência |

**Stack:** [Astro 6](https://astro.build) com a integração [MDX](https://docs.astro.build/en/guides/integrations-guide/mdx/). O deploy é feito na Vercel a cada push.

### Estrutura

```
src/
├── content/
│   └── aulas/              # Uma aula = um arquivo .mdx
├── content.config.ts       # Schema das coleções (campos obrigatórios de cada aula)
├── components/             # Componentes usados dentro das aulas
├── layouts/
│   ├── Base.astro          # Estrutura HTML comum
│   ├── AulaLayout.astro    # Layout das páginas de aula
│   └── UniversoGitLayout.astro
├── pages/
│   ├── index.astro         # Home com a lista de aulas e trilhas
│   ├── aulas/[slug].astro  # Gera uma página para cada .mdx de aulas/
│   ├── universo-git/
│   ├── universo-terminal/
│   └── universo-vscode/
└── styles/global.css
```

As aulas são **conteúdo** (arquivos MDX em `src/content/aulas/`). As trilhas são **páginas** (arquivos `.astro` em `src/pages/`). Para uma aula nova, você só mexe em `src/content/aulas/`.

---

### Publicando uma aula nova

**1. Crie o arquivo** em `src/content/aulas/`, com o número na frente para manter a ordem:

```
src/content/aulas/08-imagens.mdx
```

O nome do arquivo vira a URL: `/aulas/08-imagens`.

**2. Preencha o frontmatter.** O Astro valida esses campos no build, e a página não é gerada se faltar algum obrigatório.

```mdx
---
numero: "08"
titulo: "HTML —"
tituloEm: "Imagens"
subtitulo: "img, alt, formatos e caminhos relativos."
dataA: "14 mai 2026"
duracao: "1h20"
status: "publicada"
topicos: ["<img>", "alt", "src", "caminhos"]
coverUrl: "https://images.unsplash.com/..."
---
```

| Campo | Obrigatório | Descrição |
|---|---|---|
| `numero` | sim | Número da aula, como texto (`"08"`) |
| `titulo` | sim | Primeira parte do título |
| `tituloEm` | sim | Parte do título exibida em destaque |
| `subtitulo` | sim | Uma frase sobre o que a aula cobre |
| `duracao` | sim | Duração prevista, ex.: `"1h20"` |
| `status` | não | `publicada` (padrão), `em-breve` ou `trilha`. Aulas `em-breve` aparecem na home sem link. |
| `dataA`, `dataB` | não | Data da aula para a turma A e para a turma B |
| `disciplina` | não | Padrão: `"PI I"` |
| `topicos` | não | Lista de tópicos exibida no card da home |
| `coverUrl` | não | Imagem de capa. Arquivos locais ficam em `public/` e são referenciados como `/nome.png` |
| `tipo` | não | Categoria livre da aula |

**3. Escreva o conteúdo** em Markdown, abaixo do frontmatter. Comece pelos objetivos da aula e use `##` para as seções.

**4. Confira** com `npm run dev` e abra `/aulas/08-imagens`.

---

### Componentes disponíveis

Importe no topo do `.mdx`, logo depois do frontmatter:

```mdx
import Callout from '../../components/Callout.astro'
import VideosRecomendados from '../../components/VideosRecomendados.astro'
```

**`Callout`:** caixa de destaque para dicas, avisos e erros comuns.

```mdx
<Callout type="warn" title="Cuidado com o target=_blank">
  Sempre use `rel="noopener noreferrer"` junto.
</Callout>
```

| Prop | Valores | Padrão |
|---|---|---|
| `type` | `tip`, `info`, `warn`, `danger` | `info` |
| `title` | Texto do título da caixa | — |

**`VideosRecomendados`:** grade de vídeos do YouTube com miniatura, canal e descrição.

```mdx
<VideosRecomendados videos={[
  { id: "aiOEBhozEOg", titulo: "Hierarquia de Títulos", canal: "Curso em Vídeo", descricao: "h1 ao h6 com semântica." },
]} />
```

| Campo | Obrigatório | Descrição |
|---|---|---|
| `id` | sim | ID do vídeo, a parte depois de `youtu.be/` |
| `titulo` | sim | Título exibido no card |
| `canal` | sim | Nome do canal |
| `descricao` | não | Uma linha sobre o vídeo |

Também existem `Terminal` (bloco estilizado de linha de comando, prop `title`) e `ExCard` (card de exercício, props `num` e `title`).

---

## Convenções de escrita

- **Um conceito novo por vez.** Cada termo é explicado na primeira vez em que aparece e usado sem cerimônia depois.
- **Exemplo antes da regra.** Mostre o código, depois explique o que cada parte faz.
- **Tabelas para anatomia.** Quando o código tem partes (tag, atributo, valor), uma tabela explica cada uma.
- **Referências no fim.** Toda aula termina com links para a MDN ou documentação oficial.

---

*ETE Cícero Dias · Curso Técnico em Desenvolvimento de Sistemas · Projeto Integrador I · 2026*

import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const aulas = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/aulas' }),
  schema: z.object({
    numero:     z.string(),
    titulo:     z.string(),
    tituloEm:   z.string(),
    subtitulo:  z.string(),
    dataA:      z.string().nullable().optional(),
    dataB:      z.string().nullable().optional(),
    duracao:    z.string(),
    status:     z.enum(['publicada', 'em-breve', 'trilha']).default('publicada'),
    disciplina: z.string().default('PI I'),
    topicos:    z.array(z.string()).default([]),
    coverUrl:   z.string().optional(),
    tipo:       z.string().optional(),
  }),
})

const atividades = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/atividades' }),
  schema: z.object({
    titulo:      z.string(),
    tipo:        z.enum(['exercicio', 'desafio', 'projeto', 'quiz']).default('exercicio'),
    aulaRef:     z.string(),           // slug da aula — ex: "04-intro-html-parte1"
    subtitulo:   z.string(),
    duracao:     z.string().optional(),
    nivel:       z.enum(['basico', 'intermediario', 'avancado']).default('basico'),
    entrega:     z.string().nullable().optional(),
    status:      z.enum(['aberta', 'em-breve', 'encerrada']).default('aberta'),
    topicos:     z.array(z.string()).default([]),
  }),
})

export const collections = { aulas, atividades }

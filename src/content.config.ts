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
    paginaRica: z.string().optional(),
  }),
})

export const collections = { aulas }

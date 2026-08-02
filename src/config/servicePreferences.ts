export type FieldType = 'multiselect' | 'text' | 'number' | 'select' | 'multiselect_nested'

export interface NestedOption {
  label: string
  suboptions?: string[]
}

export interface ServiceField {
  key: string
  label: string
  type: FieldType
  options?: string[]
  nestedOptions?: NestedOption[]
  placeholder?: string
  hint?: string
  summaryFn?: (value: unknown, context: Record<string, unknown>) => string | null
}

export interface ServiceConfig {
  categoryNames: string[]
  fields: ServiceField[]
}

export const SERVICE_CONFIGS: ServiceConfig[] = [
  {
    categoryNames: ['DJ'],
    fields: [
      {
        key: 'estilos',
        label: 'Estilos musicais preferidos',
        type: 'multiselect',
        options: ['Funk', 'Sertanejo', 'Pagode', 'Axé', 'Forró', 'Pop', 'Rock', 'Eletrônico', 'Hip-Hop', 'Reggaeton', 'MPB', 'Samba', 'Gospel', 'Flashback'],
      },
      {
        key: 'musicas_pedidas',
        label: 'Músicas que não podem faltar',
        type: 'text',
        placeholder: 'Ex: Evidências - Chitãozinho e Xororó...',
        hint: 'Separe por vírgula',
      },
      {
        key: 'musicas_proibidas',
        label: 'Músicas que NÃO podem tocar',
        type: 'text',
        placeholder: 'Ex: qualquer funk pesado...',
      },
      {
        key: 'observacoes_dj',
        label: 'Observações para o DJ',
        type: 'text',
        placeholder: 'Ex: público mais velho, crianças presentes...',
      },
    ],
  },
  {
    categoryNames: ['Bartender', 'Open Bar'],
    fields: [
      {
        key: 'bebedores',
        label: 'Quantas pessoas vão beber?',
        type: 'number',
        placeholder: 'Ex: 80',
        hint: 'Usado para calcular a quantidade de insumos',
      },
      {
        key: 'bebidas',
        label: 'Bebidas desejadas',
        type: 'multiselect_nested',
        nestedOptions: [
          { label: 'Caipirinha', suboptions: ['Limão', 'Morango', 'Maracujá', 'Kiwi', 'Abacaxi', 'Uva', 'Manga', 'Mista'] },
          { label: 'Cerveja', suboptions: ['Lager', 'IPA', 'Pilsen', 'Weiss', 'Sem álcool'] },
          { label: 'Vinho', suboptions: ['Tinto seco', 'Tinto suave', 'Branco seco', 'Branco suave', 'Rosé', 'Espumante'] },
          { label: 'Drinks sem álcool', suboptions: ['Limonada', 'Suco de frutas', 'Água com gás', 'Refrigerante'] },
          { label: 'Whisky' },
          { label: 'Vodka' },
          { label: 'Gin' },
          { label: 'Rum' },
          { label: 'Tequila' },
          { label: 'Chopp' },
          { label: 'Outros', suboptions: [] },
        ],
        summaryFn: (value, ctx) => {
          const bebedores = Number(ctx.bebedores) || 0
          if (!bebedores || !value) return null
          const sel = value as Record<string, string[]>
          const linhas: string[] = []
          if (sel['Caipirinha']?.length) linhas.push(`🍋 Caipirinha (${sel['Caipirinha'].join(', ')}): ~${bebedores * 2} frutas, ${(bebedores * 0.05).toFixed(1)}L de cachaça`)
          if (sel['Cerveja']?.length) linhas.push(`🍺 Cerveja: ~${Math.ceil(bebedores * 3)} unidades (350ml)`)
          if (sel['Vinho']?.length) linhas.push(`🍷 Vinho: ~${Math.ceil(bebedores / 5)} garrafas`)
          if (sel['Chopp']?.length) linhas.push(`🍺 Chopp: ~${Math.ceil(bebedores * 0.5)}L`)
          if (sel['Whisky']?.length) linhas.push(`🥃 Whisky: ~${Math.ceil(bebedores / 10)} garrafas`)
          if (sel['Vodka']?.length) linhas.push(`🍸 Vodka: ~${Math.ceil(bebedores / 10)} garrafas`)
          if (sel['Gin']?.length) linhas.push(`🍸 Gin: ~${Math.ceil(bebedores / 10)} garrafas`)
          if (sel['Rum']?.length) linhas.push(`🍹 Rum: ~${Math.ceil(bebedores / 10)} garrafas`)
          if (sel['Tequila']?.length) linhas.push(`🥃 Tequila: ~${Math.ceil(bebedores / 15)} garrafas`)
          const outros = (ctx.bebidas_outros as string | undefined)?.trim()
          if (outros) linhas.push(`🍹 Outros drinks: ${outros}`)
          return linhas.length ? linhas.join('\n') : null
        },
      },
      {
        key: 'restricoes_bar',
        label: 'Restrições / observações',
        type: 'text',
        placeholder: 'Ex: sem bebida alcoólica para menores...',
      },
    ],
  },
  {
    categoryNames: ['Fotografia'],
    fields: [
      {
        key: 'estilo_foto',
        label: 'Estilo de fotografia',
        type: 'multiselect',
        options: ['Clássico', 'Fotojornalismo', 'Artístico', 'Espontâneo', 'Posado', 'Preto e branco', 'Colorido vibrante'],
      },
      {
        key: 'momentos_foto',
        label: 'Momentos que não podem faltar',
        type: 'text',
        placeholder: 'Ex: entrada dos noivos, primeiro beijo, corte do bolo...',
      },
      {
        key: 'pessoas_especiais',
        label: 'Pessoas especiais para destacar',
        type: 'text',
        placeholder: 'Ex: avós, padrinho João...',
      },
    ],
  },
  {
    categoryNames: ['Filmagem'],
    fields: [
      {
        key: 'estilo_video',
        label: 'Estilo do vídeo',
        type: 'multiselect',
        options: ['Cinematográfico', 'Documental', 'Clipe musical', 'Tradicional', 'Drone incluso'],
      },
      {
        key: 'musica_video',
        label: 'Música para o vídeo',
        type: 'text',
        placeholder: 'Ex: nossa música favorita é...',
      },
    ],
  },
  {
    categoryNames: ['Buffet'],
    fields: [
      {
        key: 'restricoes_alimentares',
        label: 'Restrições alimentares',
        type: 'multiselect',
        options: ['Vegetariano', 'Vegano', 'Sem glúten', 'Sem lactose', 'Sem frutos do mar', 'Sem amendoim', 'Halal', 'Kosher'],
      },
      {
        key: 'preferencias_buffet',
        label: 'Preferências do cardápio',
        type: 'text',
        placeholder: 'Ex: comida mineira, frutos do mar, massas...',
      },
      {
        key: 'cardapio_infantil',
        label: 'Haverá cardápio infantil?',
        type: 'select',
        options: ['Sim', 'Não'],
      },
    ],
  },
  {
    categoryNames: ['Bolo'],
    fields: [
      {
        key: 'sabor_bolo',
        label: 'Sabores do bolo',
        type: 'multiselect',
        hint: 'O valor do pacote pode variar de acordo com os sabores escolhidos.',
        options: ['Chocolate', 'Baunilha', 'Morango', 'Limão', 'Red Velvet', 'Cenoura', 'Coco', 'Maracujá', 'Nozes', 'Prestígio'],
      },
      {
        key: 'cobertura',
        label: 'Tipo de cobertura',
        type: 'select',
        options: ['Chantilly', 'Pasta americana', 'Ganache', 'Buttercream', 'Naked cake'],
      },
      {
        key: 'tema_bolo',
        label: 'Tema / decoração do bolo',
        type: 'text',
        placeholder: 'Ex: floral, minimalista, tema da festa...',
      },
    ],
  },
  {
    categoryNames: ['Decoração'],
    fields: [
      {
        key: 'estilo_decoracao',
        label: 'Estilo da decoração',
        type: 'multiselect',
        options: ['Clássico', 'Moderno', 'Rústico', 'Romântico', 'Minimalista', 'Tropical', 'Boho', 'Luxo', 'Temático'],
      },
      {
        key: 'cores',
        label: 'Paleta de cores',
        type: 'text',
        placeholder: 'Ex: dourado e branco, azul marinho e prata...',
      },
      {
        key: 'referencias',
        label: 'Referências / inspirações',
        type: 'text',
        placeholder: 'Ex: link do Pinterest, descrição do que imagina...',
      },
    ],
  },
  {
    categoryNames: ['Cabine de Fotos', 'Foto 360°'],
    fields: [
      {
        key: 'tema_cabine',
        label: 'Tema da cabine',
        type: 'text',
        placeholder: 'Ex: tema da festa, cores predominantes...',
      },
      {
        key: 'props',
        label: 'Acessórios desejados',
        type: 'multiselect',
        options: ['Chapéus', 'Óculos', 'Bigodes', 'Placas', 'Molduras', 'Perucas', 'Temáticos'],
      },
    ],
  },
  {
    categoryNames: ['Brinquedos', 'Brinquedos Infláveis', 'Personagens'],
    fields: [
      {
        key: 'faixa_etaria',
        label: 'Faixa etária das crianças',
        type: 'multiselect',
        options: ['0-2 anos', '3-5 anos', '6-9 anos', '10-12 anos', '13+ anos'],
      },
      {
        key: 'temas_infantis',
        label: 'Temas preferidos',
        type: 'text',
        placeholder: 'Ex: Frozen, Homem-Aranha, Peppa Pig...',
      },
      {
        key: 'qtd_criancas',
        label: 'Quantidade de crianças esperada',
        type: 'number',
        placeholder: 'Ex: 20',
      },
    ],
  },
  {
    categoryNames: ['Cerimonial'],
    fields: [
      {
        key: 'tipo_cerimonia',
        label: 'Tipo de cerimônia',
        type: 'select',
        options: ['Religiosa', 'Civil', 'Simbólica', 'Mista'],
      },
      {
        key: 'musica_entrada',
        label: 'Música de entrada',
        type: 'text',
        placeholder: 'Ex: Canon in D, música personalizada...',
      },
      {
        key: 'votos',
        label: 'Votos personalizados?',
        type: 'select',
        options: ['Sim, escreveremos nossos votos', 'Não, usar votos tradicionais'],
      },
    ],
  },
]

export function getConfigForCategory(categoryName: string): ServiceConfig | null {
  if (!categoryName) return null
  return SERVICE_CONFIGS.find(c =>
    c.categoryNames.some(n => categoryName.toLowerCase().includes(n.toLowerCase()))
  ) ?? null
}

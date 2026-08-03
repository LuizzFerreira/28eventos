export type FieldType = 'multiselect' | 'text' | 'number' | 'select' | 'multiselect_nested' | 'info'

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
    categoryNames: ['Bartender', 'Barman', 'Barmen', 'Bar', 'Open Bar', 'Barr'],
    fields: [
      {
        key: 'bebedores',
        label: 'Quantas pessoas vão beber?',
        type: 'number',
        placeholder: 'Ex: 80',
        hint: 'Usado para calcular a quantidade de insumos',
      },
      {
        key: 'drinks',
        label: 'Drinks desejados',
        type: 'multiselect_nested',
        nestedOptions: [
          { label: 'Caipirinha', suboptions: ['Limão', 'Morango', 'Maracujá', 'Kiwi', 'Abacaxi', 'Uva', 'Manga', 'Mista'] },
          { label: 'Caipiroska', suboptions: ['Limão', 'Morango', 'Maracujá', 'Frutas vermelhas', 'Manga'] },
          { label: 'Mojito' },
          { label: 'Aperol Spritz' },
          { label: 'Gin Tônica', suboptions: ['Clássico', 'Com pepino', 'Com morango', 'Com lavanda'] },
          { label: 'Vodka', suboptions: ['Puro', 'Com energético', 'Com suco', 'Com tônica'] },
          { label: 'Rum', suboptions: ['Puro', 'Com cola', 'Com suco de limão'] },
          { label: 'Tequila', suboptions: ['Shot', 'Margarita'] },
          { label: 'Drinks sem álcool', suboptions: ['Limonada', 'Limonada suíça', 'Suco de frutas', 'Água com gás', 'Refrigerante', 'Mocktail de frutas'] },
          { label: 'Outros', suboptions: [] },
        ],
        summaryFn: (value, ctx) => {
          const bebedores = Number(ctx.bebedores) || 0
          if (!bebedores || !value) return null
          const sel = value as Record<string, string[]>
          const linhas: string[] = []
          if (sel['Caipirinha']?.length) linhas.push(`🍋 Caipirinha (${sel['Caipirinha'].join(', ')}): ~${bebedores * 2} frutas, ${(bebedores * 0.05).toFixed(1)}L de cachaça, ${Math.ceil(bebedores * 0.02)}kg de açúcar`)
          if (sel['Caipiroska']?.length) linhas.push(`🍋 Caipiroska (${sel['Caipiroska'].join(', ')}): ~${bebedores * 2} frutas, ${(bebedores * 0.05).toFixed(1)}L de vodka`)
          if (sel['Mojito'] !== undefined) linhas.push(`🌿 Mojito: ~${(bebedores * 0.05).toFixed(1)}L de rum, ${Math.ceil(bebedores * 0.5)} limões, hortelã, açúcar`)
          if (sel['Aperol Spritz'] !== undefined) linhas.push(`🍊 Aperol Spritz: ~${Math.ceil(bebedores / 8)} garrafas de Aperol, ${Math.ceil(bebedores / 4)} garrafas de espumante`)
          if (sel['Gin Tônica']?.length) linhas.push(`🍸 Gin Tônica: ~${Math.ceil(bebedores / 10)} garrafas de gin, ${Math.ceil(bebedores / 3)} latas de tônica`)
          if (sel['Vodka']?.length) linhas.push(`🍸 Vodka: ~${Math.ceil(bebedores / 10)} garrafas`)
          if (sel['Rum']?.length) linhas.push(`🍹 Rum: ~${Math.ceil(bebedores / 10)} garrafas`)
          if (sel['Tequila']?.length) linhas.push(`🥃 Tequila: ~${Math.ceil(bebedores / 15)} garrafas`)
          if (sel['Drinks sem álcool']?.length) linhas.push(`🍹 Drinks sem álcool (${sel['Drinks sem álcool'].join(', ')}): ingredientes conforme seleção`)
          const outros = (ctx.drinks_outros as string | undefined)?.trim()
          if (outros) linhas.push(`🍹 Outros: ${outros}`)
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
    categoryNames: ['Chopp'],
    fields: [
      {
        key: 'bebedores_chopp',
        label: 'Quantas pessoas vão beber?',
        type: 'number',
        placeholder: 'Ex: 80',
        hint: 'Usado para calcular a quantidade de chopp',
      },
      {
        key: 'tipo_chopp',
        label: 'Tipo de chopp',
        type: 'multiselect',
        options: ['Pilsen', 'Weiss', 'IPA', 'Dark/Escuro', 'Red Ale', 'Sem álcool'],
        summaryFn: (value, ctx) => {
          const bebedores = Number(ctx.bebedores_chopp) || 0
          if (!bebedores || !value) return null
          const tipos = value as string[]
          if (!tipos.length) return null
          return `🍺 Chopp (${tipos.join(', ')}): ~${Math.ceil(bebedores * 0.5)}L no total`
        },
      },
      {
        key: 'obs_chopp',
        label: 'Observações',
        type: 'text',
        placeholder: 'Ex: preferência de marca, temperatura...',
      },
    ],
  },
  {
    categoryNames: ['Bebidas'],
    fields: [
      {
        key: '_aviso',
        label: 'Não fornecemos refrigeração, gelo, coolers ou qualquer estrutura de resfriamento para as bebidas. O cliente é responsável por providenciar o armazenamento adequado.',
        type: 'info',
      },
      {
        key: 'qtd_pessoas_beb',
        label: 'Quantas pessoas serão servidas?',
        type: 'number',
        placeholder: 'Ex: 100',
        hint: 'Usado para calcular a quantidade de bebidas',
      },
      {
        key: 'bebidas_sel',
        label: 'Bebidas desejadas',
        type: 'multiselect_nested',
        nestedOptions: [
          { label: 'Vinho', suboptions: ['Tinto seco', 'Tinto suave', 'Branco seco', 'Branco suave', 'Rosé', 'Espumante'] },
          { label: 'Whisky', suboptions: ['Escocês', 'Bourbon', 'Irlandês', 'Blended'] },
          { label: 'Cerveja', suboptions: ['Lager', 'Pilsen', 'IPA', 'Weiss', 'Sem álcool'] },
          { label: 'Refrigerante', suboptions: ['Cola', 'Guaraná', 'Laranja', 'Limão', 'Tônica', 'Água com gás'] },
          { label: 'Suco', suboptions: ['Laranja', 'Uva', 'Maracujá', 'Abacaxi', 'Goiaba', 'Manga', 'Misto'] },
          { label: 'Água', suboptions: ['Sem gás', 'Com gás'] },
          { label: 'Energético' },
          { label: 'Outros', suboptions: [] },
        ],
        summaryFn: (value, ctx) => {
          const pessoas = Number(ctx.qtd_pessoas_beb) || 0
          if (!pessoas || !value) return null
          const sel = value as Record<string, string[]>
          const linhas: string[] = []
          if (sel['Vinho']?.length) linhas.push(`🍷 Vinho (${sel['Vinho'].join(', ')}): ~${Math.ceil(pessoas / 5)} garrafas`)
          if (sel['Whisky']?.length) linhas.push(`🥃 Whisky (${sel['Whisky'].join(', ')}): ~${Math.ceil(pessoas / 10)} garrafas`)
          if (sel['Cerveja']?.length) linhas.push(`🍺 Cerveja (${sel['Cerveja'].join(', ')}): ~${Math.ceil(pessoas * 3)} unidades (350ml)`)
          if (sel['Refrigerante']?.length) linhas.push(`🥤 Refrigerante (${sel['Refrigerante'].join(', ')}): ~${Math.ceil(pessoas * 0.3)}L`)
          if (sel['Suco']?.length) linhas.push(`🧃 Suco (${sel['Suco'].join(', ')}): ~${Math.ceil(pessoas * 0.2)}L`)
          if (sel['Água']?.length) linhas.push(`💧 Água (${sel['Água'].join(', ')}): ~${Math.ceil(pessoas * 0.5)}L`)
          if (sel['Energético'] !== undefined) linhas.push(`⚡ Energético: ~${Math.ceil(pessoas * 0.3)} latas`)
          const outros = (ctx.bebidas_sel_outros as string | undefined)?.trim()
          if (outros) linhas.push(`🍹 Outros: ${outros}`)
          return linhas.length ? linhas.join('\n') : null
        },
      },
      {
        key: 'obs_bebidas',
        label: 'Observações',
        type: 'text',
        placeholder: 'Ex: preferência de marcas, bebidas para crianças...',
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

export function getConfigForCategory(categoryName: string, productName = ''): ServiceConfig | null {
  if (!categoryName && !productName) return null
  return SERVICE_CONFIGS.find(c =>
    c.categoryNames.some(n =>
      categoryName.toLowerCase().includes(n.toLowerCase()) ||
      n.toLowerCase().includes(categoryName.toLowerCase()) ||
      productName.toLowerCase().includes(n.toLowerCase())
    )
  ) ?? null
}

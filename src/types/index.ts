export type EventStatus =
  | 'em_criacao'
  | 'orcamento'
  | 'em_analise'
  | 'confirmado'
  | 'finalizado'
  | 'cancelado'

export type EventType =
  | 'casamento'
  | '15_anos'
  | 'formatura'
  | 'corporativo'
  | 'infantil'
  | 'aniversario'
  | 'outro'

export interface UserProfile {
  id: string
  email: string
  nome: string
  avatar_url?: string
  telefone?: string
  cidade?: string
  estado?: string
  role: 'cliente' | 'admin'
  created_at: string
}

export interface Category {
  id: string
  nome: string
  descricao?: string
  icone?: string
  ativo: boolean
  created_at: string
}

export interface ProductImage {
  id: string
  produto_id: string
  url: string
  ordem: number
}

export interface Product {
  id: string
  nome: string
  descricao: string
  preco: number
  categoria_id: string
  categoria?: Category
  imagens?: ProductImage[]
  ativo: boolean
  destaque: boolean
  duracao?: string
  videos?: string[]
  created_at: string
}

export interface EventItem {
  id: string
  evento_id: string
  produto_id: string
  produto?: Product
  quantidade: number
  valor_unitario: number
  subtotal: number
  confirmado?: boolean
}

export interface Event {
  id: string
  user_id: string
  nome_evento: string
  tipo_evento: EventType
  data: string
  horario_inicio: string
  horario_fim: string
  endereco: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  quantidade_pessoas: number
  possui_aniversariante: boolean
  nome_aniversariante?: string
  idade_aniversariante?: number
  sexo_aniversariante?: string
  observacoes?: string
  valor_total: number
  status: EventStatus
  itens?: EventItem[]
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  evento_id: string
  user_id: string
  conteudo: string
  lida: boolean
  created_at: string
  user?: UserProfile
}

export interface Notification {
  id: string
  user_id: string
  titulo: string
  mensagem: string
  lida: boolean
  tipo: 'info' | 'success' | 'warning' | 'error'
  created_at: string
}

export interface GuestRSVP {
  id: string
  evento_id: string
  nome: string
  email?: string
  telefone?: string
  confirmado: boolean
  created_at: string
}

export interface EventChecklist {
  id: string
  evento_id: string
  titulo: string
  concluido: boolean
  ordem: number
}

export interface CartItem {
  produto: Product
  quantidade: number
}

export interface EventFormData {
  tipo_evento: EventType
  nome_evento: string
  data: string
  horario_inicio: string
  horario_fim: string
  quantidade_pessoas: number
  cep: string
  endereco: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  possui_aniversariante: boolean
  nome_aniversariante?: string
  idade_aniversariante?: number
  sexo_aniversariante?: string
  observacoes?: string
}

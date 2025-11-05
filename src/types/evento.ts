// Tipo de Evento conforme documentação
export interface Evento {
  id: string
  titulo: string
  descricao: string
  local: string
  dataInicio: string // ISO 8601
  dataFim: string // ISO 8601
  bannerUrl?: string
  abertoParaVenda: boolean
  createdAt: string // ISO 8601
  updatedAt?: string // ISO 8601
}

export type EventoCreate = Omit<Evento, 'id' | 'createdAt' | 'updatedAt'>
export type EventoUpdate = Partial<Omit<Evento, 'id' | 'createdAt'>> & { id: string }

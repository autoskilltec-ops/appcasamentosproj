import type { Event, Estimate, Meeting, Proposal, ChecklistItem, Producer } from '@/generated/prisma/client'

// Re-exportar tipos do Prisma
export type { Event, Estimate, Meeting, Proposal, ChecklistItem, Producer }

// Tipos compostos para uso nos componentes
export type EventWithRelations = Event & {
  estimate: Estimate | null
  meeting: Meeting | null
  proposal: Proposal | null
  checklistItems: ChecklistItem[]
  producer: Producer
}

export type EventSummary = Pick<Event, 'id' | 'coupleName' | 'weddingDate' | 'venueName' | 'status' | 'currentStage' | 'pin'>

// Labels em português para os enums
export const EventStatusLabels: Record<string, string> = {
  ACTIVE: 'Ativo',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
}

export const ChecklistTypeLabels: Record<string, string> = {
  FURNITURE: 'Mobiliário',
  LIGHTING: 'Iluminação',
  FLOWERS: 'Flores',
  DECORATION: 'Decoração',
  AUDIOVISUAL: 'Audiovisual',
  BUFFET: 'Buffet',
  OTHER: 'Outro',
}

export const ItemStatusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  DELIVERED: 'Entregue',
  DAMAGED: 'Com avaria',
}

export const MeetingStatusLabels: Record<string, string> = {
  SCHEDULED: 'Agendada',
  COMPLETED: 'Realizada',
  CANCELLED: 'Cancelada',
}

import { cn } from "@/lib/utils"

type StatusType = "ACTIVE" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  | "PENDING" | "CONFIRMED" | "DELIVERED" | "DAMAGED"
  | "SCHEDULED" | "ONLINE" | "PRESENTIAL"

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE:       { label: "Ativo",          className: "bg-blue-100 text-blue-700" },
  IN_PROGRESS:  { label: "Em andamento",   className: "bg-amber-100 text-amber-700" },
  COMPLETED:    { label: "Concluído",      className: "bg-green-100 text-green-700" },
  CANCELLED:    { label: "Cancelado",      className: "bg-gray-100 text-gray-500" },
  PENDING:      { label: "Pendente",       className: "bg-gray-100 text-gray-600" },
  CONFIRMED:    { label: "Confirmado",     className: "bg-blue-100 text-blue-700" },
  DELIVERED:    { label: "Entregue",       className: "bg-green-100 text-green-700" },
  DAMAGED:      { label: "Com avaria",     className: "bg-red-100 text-red-700" },
  SCHEDULED:    { label: "Agendada",       className: "bg-purple-100 text-purple-700" },
  ONLINE:       { label: "Online",         className: "bg-cyan-100 text-cyan-700" },
  PRESENTIAL:   { label: "Presencial",     className: "bg-rose-100 text-rose-700" },
}

interface Props {
  status: StatusType | string
  className?: string
}

export function StatusBadge({ status, className }: Props) {
  const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-600" }

  return (
    <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", config.className, className)}>
      {config.label}
    </span>
  )
}

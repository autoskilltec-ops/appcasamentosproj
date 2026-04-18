import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { EventStatusLabels } from "@/types"
import { Calendar, MapPin, Users, Eye } from "lucide-react"

interface EventCardProps {
  event: any
}

export function EventCard({ event }: EventCardProps) {
  const statusColors: Record<string, string> = {
    ACTIVE: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-amber-100 text-amber-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-gray-100 text-gray-500",
  }

  return (
    <Link href={`/eventos/${event.id}`}>
      <div className="glass-card p-5 hover:shadow-lg transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-serif text-xl text-lilac-800 group-hover:text-lilac-600 transition-colors">
            {event.coupleName}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[event.status]}`}>
            {EventStatusLabels[event.status]}
          </span>
        </div>

        <div className="space-y-1.5 text-sm text-lilac-500">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-rose-400" />
            <span>{formatDate(event.weddingDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-rose-400" />
            <span>{event.venueName}</span>
          </div>
          {event.estimate?.guestCount && (
            <div className="flex items-center gap-2">
              <Users size={14} className="text-rose-400" />
              <span>{event.estimate.guestCount} convidados</span>
            </div>
          )}
        </div>

        {event.proposal?.viewedByClient && (
          <div className="mt-3 pt-3 border-t border-lilac-100 flex items-center gap-1.5 text-xs text-lilac-500">
            <Eye size={12} className="text-lilac-400" />
            <span>Proposta visualizada pelo cliente</span>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-lilac-100">
          <p className="text-xs text-lilac-400">
            PIN do cliente: <span className="font-mono font-semibold text-lilac-600">{event.pin}</span>
          </p>
        </div>
      </div>
    </Link>
  )
}

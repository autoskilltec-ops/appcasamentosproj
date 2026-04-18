import { notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { ArrowLeft, Users, Wallet, Clock, Sparkles, Star } from "lucide-react"

type Props = { params: Promise<{ id: string }> }

const STYLE_LABELS: Record<string, string> = {
  CLASSIC: "Clássico", RUSTIC: "Rústico", MODERN: "Moderno", BOHO: "Boho",
  DESTINATION: "Destino", MINIMALIST: "Minimalista", RELIGIOUS: "Religioso", OTHER: "Outro",
}

const PERIOD_LABELS: Record<string, string> = {
  DAYTIME: "Diurno", NIGHTTIME: "Noturno", BOTH: "Diurno e Noturno",
}

const PRIORITY_LABELS: Record<string, string> = {
  DECORATION: "Decoração", BUFFET: "Buffet", MUSIC: "Música",
  PHOTO_VIDEO: "Foto/Vídeo", VENUE: "Espaço", CEREMONY: "Cerimônia", HONEYMOON: "Lua de mel",
}

export default async function EstimativasProducerPage({ params }: Props) {
  const session = await auth()
  const { id } = await params

  const event = await prisma.event.findFirst({
    where: { id, producerId: session!.user!.id },
    include: { estimate: true },
  })

  if (!event) notFound()

  const estimate = event.estimate

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href={`/eventos/${id}`} className="inline-flex items-center gap-2 text-sm text-lilac-500 hover:text-lilac-700 mb-6">
        <ArrowLeft size={16} />
        Voltar ao evento
      </Link>

      <div className="mb-6">
        <h1 className="font-serif text-2xl text-lilac-800">Estimativas</h1>
        <p className="text-lilac-500 text-sm mt-1">{event.coupleName}</p>
      </div>

      {!estimate ? (
        <div className="glass-card p-10 text-center">
          <p className="text-lilac-400">O cliente ainda não preencheu as estimativas.</p>
          <p className="text-xs text-lilac-300 mt-2">PIN do cliente: <span className="font-mono font-semibold">{event.pin}</span></p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Números */}
          <div className="glass-card p-6 grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex justify-center mb-1"><Users size={18} className="text-lilac-400" /></div>
              <p className="text-xl font-semibold text-lilac-700">{estimate.guestCount}</p>
              <p className="text-xs text-lilac-400">Convidados</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-1"><Wallet size={18} className="text-lilac-400" /></div>
              <p className="text-sm font-semibold text-lilac-700">{formatCurrency(estimate.budgetMin)}</p>
              <p className="text-xs text-lilac-400">Orçamento Estimado</p>
            </div>
          </div>

          {/* Estilos */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-lilac-400" />
              <h3 className="font-medium text-lilac-700">Estilos escolhidos</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {estimate.weddingStyles.map(s => (
                <span key={s} className="px-3 py-1 rounded-full bg-lilac-100 text-lilac-700 text-sm font-medium">
                  {STYLE_LABELS[s] ?? s}
                </span>
              ))}
            </div>
          </div>

          {/* Período */}
          <div className="glass-card p-6 flex items-center gap-3">
            <Clock size={18} className="text-rose-400 shrink-0" />
            <div>
              <p className="text-xs text-lilac-400">Período</p>
              <p className="font-medium text-lilac-700">{PERIOD_LABELS[estimate.period] ?? estimate.period}</p>
            </div>
          </div>

          {/* Prioridades */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Star size={16} className="text-rose-400" />
              <h3 className="font-medium text-lilac-700">Prioridades</h3>
            </div>
            <ol className="space-y-1.5">
              {estimate.priorities.map((p, i) => (
                <li key={p} className="flex items-center gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 text-xs font-semibold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-lilac-700">{PRIORITY_LABELS[p] ?? p}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Observações */}
          {estimate.notes && (
            <div className="glass-card p-6">
              <h3 className="font-medium text-lilac-700 mb-2">Observações do casal</h3>
              <p className="text-sm text-lilac-600 whitespace-pre-wrap">{estimate.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

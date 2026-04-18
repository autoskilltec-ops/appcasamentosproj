import { notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EventTimeline } from "@/components/events/EventTimeline"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Calendar, MapPin, KeyRound, ArrowLeft, TrendingDown, Wallet, LayoutGrid, MapPinned } from "lucide-react"

type Props = { params: Promise<{ id: string }> }

const TYPE_LABELS: Record<string, string> = {
  FURNITURE: "Mobiliário",
  LIGHTING: "Iluminação",
  FLOWERS: "Flores",
  DECORATION: "Decoração",
  AUDIOVISUAL: "Audiovisual",
  BUFFET: "Buffet",
  OTHER: "Outros",
}

export default async function EventDetailPage({ params }: Props) {
  const session = await auth()
  const { id } = await params

  const event = await prisma.event.findFirst({
    where: { id, producerId: session!.user!.id },
    include: {
      estimate: true,
      meeting: true,
      proposal: true,
      checklistItems: {
        select: { location: true, itemType: true, totalPrice: true, status: true },
      },
      _count: { select: { checklistItems: true } },
    },
  })

  if (!event) notFound()

  // ── Métricas financeiras ──────────────────────────────
  const budget = event.estimate?.budgetMin ?? 0
  const totalCommitted = event.checklistItems.reduce((s, i) => s + i.totalPrice, 0)
  const remaining = budget - totalCommitted
  const usedPct = budget > 0 ? Math.min(100, (totalCommitted / budget) * 100) : 0

  const byLocation = event.checklistItems.reduce<Record<string, number>>((acc, item) => {
    acc[item.location] = (acc[item.location] ?? 0) + item.totalPrice
    return acc
  }, {})

  const byType = event.checklistItems.reduce<Record<string, number>>((acc, item) => {
    acc[item.itemType] = (acc[item.itemType] ?? 0) + item.totalPrice
    return acc
  }, {})

  const topLocations = Object.entries(byLocation)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const topTypes = Object.entries(byType)
    .sort(([, a], [, b]) => b - a)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Voltar */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-lilac-500 hover:text-lilac-700 mb-6">
        <ArrowLeft size={16} />
        Voltar ao dashboard
      </Link>

      {/* Cabeçalho */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-lilac-800">{event.coupleName}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-lilac-500">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-rose-400" />
              {formatDate(event.weddingDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-rose-400" />
              {event.venueName}
            </span>
            <span className="flex items-center gap-1.5">
              <KeyRound size={14} className="text-rose-400" />
              <span className="font-mono font-semibold">{event.pin}</span>
            </span>
          </div>
        </div>
        <StatusBadge status={event.status} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Timeline — coluna esquerda */}
        <div className="col-span-1">
          <div className="glass-card p-6">
            <h2 className="font-medium text-lilac-800 mb-6">Progresso</h2>
            <EventTimeline
              currentStage={event.currentStage}
              meeting={event.meeting}
              proposal={event.proposal}
            />
          </div>
        </div>

        {/* Ações — coluna direita */}
        <div className="col-span-2 space-y-4">
          {/* Estimativas */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-lilac-800">Estimativas do cliente</h3>
                <p className="text-sm text-lilac-500 mt-0.5">
                  {event.estimate
                    ? `${event.estimate.guestCount} convidados · ${formatCurrency(event.estimate.budgetMin)}`
                    : "Aguardando preenchimento pelo cliente"}
                </p>
              </div>
              <Link href={`/eventos/${id}/estimativas`} className="text-sm text-lilac-600 hover:text-lilac-800 font-medium">
                Ver detalhes →
              </Link>
            </div>
          </div>

          {/* Reunião */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-lilac-800">Reunião inicial</h3>
                <p className="text-sm text-lilac-500 mt-0.5">
                  {event.meeting
                    ? event.meeting.status === "COMPLETED" ? "Realizada" : "Agendada"
                    : "Não agendada"}
                </p>
              </div>
              <Link href={`/eventos/${id}/reuniao`} className="text-sm text-lilac-600 hover:text-lilac-800 font-medium">
                {event.meeting ? "Ver reunião →" : "Agendar →"}
              </Link>
            </div>
          </div>

          {/* Proposta */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-lilac-800">Proposta</h3>
                <p className="text-sm text-lilac-500 mt-0.5">
                  {event.proposal
                    ? event.proposal.viewedByClient
                      ? "Visualizada pelo cliente"
                      : "Enviada — aguardando visualização"
                    : "Não enviada"}
                </p>
              </div>
              <Link href={`/eventos/${id}/proposta`} className="text-sm text-lilac-600 hover:text-lilac-800 font-medium">
                {event.proposal ? "Gerenciar →" : "Adicionar →"}
              </Link>
            </div>
          </div>

          {/* Checklist */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-lilac-800">Checklist</h3>
                <p className="text-sm text-lilac-500 mt-0.5">
                  {event._count.checklistItems > 0
                    ? `${event._count.checklistItems} itens cadastrados`
                    : "Nenhum item cadastrado"}
                </p>
              </div>
              <Link href={`/eventos/${id}/checklist`} className="text-sm text-lilac-600 hover:text-lilac-800 font-medium">
                {event._count.checklistItems > 0 ? "Ver checklist →" : "Montar checklist →"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Painel Financeiro ─────────────────────────────────────────────── */}
      {event._count.checklistItems > 0 && (
        <div className="mt-8">
          <h2 className="font-serif text-xl text-lilac-800 mb-4 flex items-center gap-2">
            <TrendingDown size={20} className="text-rose-400" />
            Controle Financeiro
          </h2>

          {/* Cards de resumo */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Orçamento */}
            <div className="glass-card p-5">
              <p className="text-xs text-lilac-400 uppercase tracking-widest mb-1">Orçamento</p>
              <p className="text-2xl font-semibold text-lilac-700">{formatCurrency(budget)}</p>
              <p className="text-xs text-lilac-400 mt-1">
                {budget > 0 ? "Definido pelo casal" : "Não informado"}
              </p>
            </div>

            {/* Comprometido */}
            <div className="glass-card p-5">
              <p className="text-xs text-lilac-400 uppercase tracking-widest mb-1">Comprometido</p>
              <p className="text-2xl font-semibold text-rose-600">{formatCurrency(totalCommitted)}</p>
              <p className="text-xs text-lilac-400 mt-1">{event._count.checklistItems} itens no checklist</p>
            </div>

            {/* Saldo */}
            <div className="glass-card p-5">
              <p className="text-xs text-lilac-400 uppercase tracking-widest mb-1">Saldo</p>
              <p className={`text-2xl font-semibold ${remaining >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCurrency(remaining)}
              </p>
              <p className="text-xs text-lilac-400 mt-1">
                {remaining < 0 ? "Acima do orçamento" : "Disponível"}
              </p>
            </div>
          </div>

          {/* Barra de progresso do orçamento */}
          {budget > 0 && (
            <div className="glass-card p-5 mb-6">
              <div className="flex justify-between text-xs text-lilac-500 mb-2">
                <span>Utilização do orçamento</span>
                <span className="font-semibold">{usedPct.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-lilac-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${usedPct}%`,
                    background: usedPct > 100
                      ? "#ef4444"
                      : usedPct > 80
                      ? "#f59e0b"
                      : "linear-gradient(90deg,#8452a9,#c2607e)",
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-lilac-400 mt-1.5">
                <span>R$ 0</span>
                <span>{formatCurrency(budget)}</span>
              </div>
            </div>
          )}

          {/* Breakdown por local e tipo */}
          <div className="grid grid-cols-2 gap-6">
            {/* Por local */}
            {topLocations.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="font-medium text-lilac-700 mb-4 flex items-center gap-2 text-sm">
                  <MapPinned size={15} className="text-rose-400" />
                  Gastos por Local
                </h3>
                <div className="space-y-3">
                  {topLocations.map(([location, value]) => {
                    const pct = totalCommitted > 0 ? (value / totalCommitted) * 100 : 0
                    return (
                      <div key={location}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-lilac-700 truncate max-w-[140px]">{location}</span>
                          <span className="text-lilac-500 font-medium shrink-0 ml-2">{formatCurrency(value)}</span>
                        </div>
                        <div className="h-1.5 bg-lilac-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background: "linear-gradient(90deg,#9b6bc5,#c2607e)",
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Por tipo */}
            {topTypes.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="font-medium text-lilac-700 mb-4 flex items-center gap-2 text-sm">
                  <LayoutGrid size={15} className="text-lilac-400" />
                  Gastos por Tipo
                </h3>
                <div className="space-y-3">
                  {topTypes.map(([type, value]) => {
                    const pct = totalCommitted > 0 ? (value / totalCommitted) * 100 : 0
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-lilac-700">{TYPE_LABELS[type] ?? type}</span>
                          <span className="text-lilac-500 font-medium">{formatCurrency(value)}</span>
                        </div>
                        <div className="h-1.5 bg-lilac-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background: "linear-gradient(90deg,#e07898,#f59e0b)",
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

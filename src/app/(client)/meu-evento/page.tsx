"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Calendar, MapPin, Users, Wallet, TrendingDown,
  ClipboardList, FileText, LogOut, CheckCircle2,
  Clock, Heart, ChevronRight, Package,
} from "lucide-react"
import { useClientAuth } from "@/hooks/useClientAuth"
import { formatCurrency } from "@/lib/utils"

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Pendente",  color: "#b8a6d0" },
  CONFIRMED: { label: "Confirmado", color: "#8452a9" },
  DELIVERED: { label: "Entregue",  color: "#10b981" },
  DAMAGED:   { label: "Avariado",  color: "#ef4444" },
}

const TYPE_LABELS: Record<string, string> = {
  FURNITURE: "Mobiliário",
  LIGHTING: "Iluminação",
  FLOWERS: "Flores",
  DECORATION: "Decoração",
  AUDIOVISUAL: "Audiovisual",
  BUFFET: "Buffet",
  OTHER: "Outros",
}

const STAGE_LABELS = [
  "Início",
  "Estimativas",
  "Reunião",
  "Proposta",
  "Checklist",
]

const PERIOD_LABELS: Record<string, string> = {
  DAYTIME: "Diurno",
  NIGHTTIME: "Noturno",
  BOTH: "Diurno e Noturno",
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function MeuEventoPage() {
  const router = useRouter()
  const { clientPin, loading: authLoading } = useClientAuth()
  const [event, setEvent] = useState<any>(null)
  const [fetchLoading, setFetchLoading] = useState(true)

  useEffect(() => {
    if (authLoading || !clientPin) return

    fetch(`/api/client/evento?pin=${clientPin}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) { router.replace("/"); return }
        setEvent(data)
      })
      .finally(() => setFetchLoading(false))
  }, [authLoading, clientPin, router])

  function handleLogout() {
    sessionStorage.removeItem("clientPin")
    sessionStorage.removeItem("clientEventId")
    router.push("/")
  }

  if (authLoading || fetchLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-lilac-50 to-rose-100">
      <div className="w-6 h-6 rounded-full border-2 border-lilac-400 border-t-transparent animate-spin" />
    </div>
  )

  if (!event) return null

  const { financial, estimate, proposal, meeting, checklist } = event
  const checklistLocations = Object.entries((checklist ?? {}) as Record<string, any[]>)
  const days = daysUntil(event.weddingDate)
  const usedPct = financial.budget > 0
    ? Math.min(100, (financial.totalCommitted / financial.budget) * 100)
    : 0
  const topTypes = Object.entries(financial.byType as Record<string, number>)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-lilac-50 to-rose-100">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-rose-400 fill-rose-300" />
          <span className="font-serif text-lilac-800 text-lg">Meu Casamento</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-lilac-400 hover:text-lilac-600 transition-colors"
        >
          <LogOut size={13} />
          Sair
        </button>
      </header>

      <main className="px-4 pb-12 max-w-xl mx-auto space-y-5">

        {/* Hero — Evento */}
        <div
          className="rounded-2xl p-6 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#8452a9 0%,#c2607e 100%)" }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 80% 20%,white 0%,transparent 60%)" }} />
          <p className="text-white/70 text-xs uppercase tracking-widest mb-1">Seu grande dia</p>
          <h1 className="font-serif text-2xl mb-3">{event.coupleName}</h1>
          <div className="flex items-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {formatDate(event.weddingDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={13} />
              {event.venueName}
            </span>
          </div>
          {days > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5">
              <Clock size={13} />
              <span className="text-sm font-medium">{days} dias para o casamento</span>
            </div>
          )}
          {days <= 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5">
              <CheckCircle2 size={13} />
              <span className="text-sm font-medium">Casamento realizado!</span>
            </div>
          )}
        </div>

        {/* Progresso das etapas */}
        <div className="glass-card p-5">
          <h2 className="font-medium text-lilac-700 mb-4 text-sm uppercase tracking-wide">Etapas do evento</h2>
          <div className="flex items-center justify-between relative">
            {/* linha de fundo */}
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-lilac-100 z-0" />
            {STAGE_LABELS.map((label, idx) => {
              const done = idx < event.currentStage
              const current = idx === event.currentStage
              return (
                <div key={idx} className="flex flex-col items-center z-10 gap-1.5" style={{ flex: 1 }}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2"
                    style={{
                      background: done ? "#8452a9" : current ? "#e07898" : "#fff",
                      borderColor: done ? "#8452a9" : current ? "#e07898" : "#e5dff0",
                      color: done || current ? "#fff" : "#b8a6d0",
                    }}
                  >
                    {done ? <CheckCircle2 size={14} /> : idx + 1}
                  </div>
                  <span className={`text-[10px] text-center leading-tight ${done ? "text-lilac-600 font-medium" : current ? "text-rose-500 font-medium" : "text-lilac-300"}`}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Info da etapa atual */}
          {event.currentStage === 0 && (
            <p className="text-xs text-lilac-400 text-center mt-4">
              Preencha suas estimativas para começar o planejamento.
            </p>
          )}
          {event.currentStage >= 2 && meeting && (
            <div className="mt-4 text-xs text-lilac-500 text-center">
              Reunião {meeting.status === "COMPLETED" ? "realizada" : "agendada"} ·{" "}
              {meeting.modality === "ONLINE" ? "Online" : "Presencial"}
            </div>
          )}
          {event.currentStage >= 3 && proposal && (
            <div className="mt-2 text-xs text-center">
              {proposal.viewedByClient
                ? <span className="text-emerald-600">✓ Proposta visualizada</span>
                : <span className="text-lilac-400">Proposta disponível — acesse abaixo</span>}
            </div>
          )}
        </div>

        {/* Controle Financeiro */}
        {financial.itemCount > 0 && (
          <div className="glass-card p-5 space-y-4">
            <h2 className="font-medium text-lilac-700 text-sm uppercase tracking-wide flex items-center gap-2">
              <TrendingDown size={15} className="text-rose-400" />
              Controle Financeiro
            </h2>

            {/* 3 métricas */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl p-3 text-center" style={{ background: "rgba(132,82,169,0.08)" }}>
                <p className="text-[10px] text-lilac-400 uppercase tracking-wide mb-0.5">Orçamento</p>
                <p className="text-sm font-semibold text-lilac-700">{formatCurrency(financial.budget)}</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "rgba(194,96,126,0.08)" }}>
                <p className="text-[10px] text-lilac-400 uppercase tracking-wide mb-0.5">Comprometido</p>
                <p className="text-sm font-semibold text-rose-600">{formatCurrency(financial.totalCommitted)}</p>
              </div>
              <div
                className="rounded-xl p-3 text-center"
                style={{ background: financial.remaining >= 0 ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)" }}
              >
                <p className="text-[10px] text-lilac-400 uppercase tracking-wide mb-0.5">Saldo</p>
                <p className={`text-sm font-semibold ${financial.remaining >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {formatCurrency(financial.remaining)}
                </p>
              </div>
            </div>

            {/* Barra */}
            {financial.budget > 0 && (
              <div>
                <div className="flex justify-between text-[11px] text-lilac-400 mb-1">
                  <span>Utilização</span>
                  <span>{usedPct.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-lilac-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${usedPct}%`,
                      background: usedPct > 100 ? "#ef4444" : usedPct > 80 ? "#f59e0b" : "linear-gradient(90deg,#8452a9,#c2607e)",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Por tipo */}
            {topTypes.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-lilac-400 uppercase tracking-wide">Por categoria</p>
                {topTypes.map(([type, value]) => {
                  const pct = financial.totalCommitted > 0 ? ((value as number) / financial.totalCommitted) * 100 : 0
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-xs text-lilac-600 mb-0.5">
                        <span>{TYPE_LABELS[type] ?? type}</span>
                        <span className="font-medium">{formatCurrency(value as number)}</span>
                      </div>
                      <div className="h-1.5 bg-lilac-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: "linear-gradient(90deg,#9b6bc5,#e07898)" }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Detalhes do evento */}
        {estimate && (
          <div className="glass-card p-5">
            <h2 className="font-medium text-lilac-700 text-sm uppercase tracking-wide mb-4">Detalhes</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-lilac-600">
                <Users size={14} className="text-lilac-400" />
                <span>{estimate.guestCount} convidados</span>
              </div>
              <div className="flex items-center gap-2 text-lilac-600">
                <Wallet size={14} className="text-lilac-400" />
                <span>{formatCurrency(estimate.budgetMin)}</span>
              </div>
              {estimate.period && (
                <div className="flex items-center gap-2 text-lilac-600 col-span-2">
                  <Clock size={14} className="text-lilac-400" />
                  <span>{PERIOD_LABELS[estimate.period] ?? estimate.period}</span>
                </div>
              )}
            </div>
            {estimate.weddingStyles?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {estimate.weddingStyles.map((s: string) => (
                  <span key={s} className="px-2.5 py-1 rounded-full bg-lilac-100 text-lilac-600 text-[11px] font-medium">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Checklist de itens */}
        {checklistLocations.length > 0 && (
          <div className="glass-card p-5 space-y-4">
            <h2 className="font-medium text-lilac-700 text-sm uppercase tracking-wide flex items-center gap-2">
              <Package size={15} className="text-lilac-400" />
              Itens do Evento
            </h2>
            <div className="space-y-4">
              {checklistLocations.map(([location, items]) => (
                <div key={location}>
                  <p className="text-xs font-semibold text-lilac-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <MapPin size={11} />
                    {location}
                  </p>
                  <div className="space-y-1.5">
                    {(items as any[]).map((item: any) => {
                      const s = STATUS_LABELS[item.status] ?? { label: item.status, color: "#b8a6d0" }
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-2 px-3 rounded-xl text-sm"
                          style={{ background: "rgba(255,255,255,0.45)" }}
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-lilac-800 font-medium truncate block">{item.name}</span>
                            {item.supplier && (
                              <span className="text-lilac-400 text-xs">{item.supplier}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-3">
                            <span className="text-xs text-lilac-400">×{item.quantity}</span>
                            <span
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{ color: s.color, background: `${s.color}18` }}
                            >
                              {s.label}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="space-y-3">
          <Link href="/meu-evento/estimativas">
            <div className="glass-card p-4 flex items-center gap-4 hover:shadow-lg transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-lilac-100 flex items-center justify-center shrink-0">
                <ClipboardList size={18} className="text-lilac-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-lilac-800 text-sm">Estimativas</p>
                <p className="text-xs text-lilac-500">
                  {estimate ? "Editar suas preferências" : "Preencha suas preferências e orçamento"}
                </p>
              </div>
              <ChevronRight size={16} className="text-lilac-300 group-hover:text-lilac-500 transition-colors" />
            </div>
          </Link>

          <Link href="/meu-evento/proposta">
            <div className="glass-card p-4 flex items-center gap-4 hover:shadow-lg transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-rose-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-lilac-800 text-sm">Proposta</p>
                <p className="text-xs text-lilac-500">
                  {proposal
                    ? proposal.viewedByClient ? "Visualizar novamente e deixar feedback" : "Proposta disponível — visualizar agora"
                    : "Disponível em breve"}
                </p>
              </div>
              <ChevronRight size={16} className="text-lilac-300 group-hover:text-lilac-500 transition-colors" />
            </div>
          </Link>
        </div>

      </main>
    </div>
  )
}

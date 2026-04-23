"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft, Lock } from "lucide-react"
import { useClientAuth } from "@/hooks/useClientAuth"
import { formatCurrency } from "@/lib/utils"

const schema = z.object({
  guestCount: z.coerce.number().int().min(1),
  budget: z.coerce.number().min(0),
  weddingStyles: z.array(z.string()).min(1, "Selecione ao menos um estilo"),
  period: z.string().min(1),
  priorities: z.array(z.string()).min(1),
  notes: z.string().optional(),
})

const STYLES = [
  { value: "CLASSIC", label: "Clássico" },
  { value: "RUSTIC", label: "Rústico" },
  { value: "MODERN", label: "Moderno" },
  { value: "BOHO", label: "Boho" },
  { value: "DESTINATION", label: "Destino" },
  { value: "MINIMALIST", label: "Minimalista" },
  { value: "RELIGIOUS", label: "Religioso" },
  { value: "OTHER", label: "Outro" },
]

const PRIORITIES = [
  { value: "DECORATION", label: "Decoração" },
  { value: "BUFFET", label: "Buffet" },
  { value: "MUSIC", label: "Música" },
  { value: "PHOTO_VIDEO", label: "Foto/Vídeo" },
  { value: "VENUE", label: "Espaço" },
  { value: "CEREMONY", label: "Cerimônia" },
  { value: "HONEYMOON", label: "Lua de mel" },
]

const PERIOD_LABELS: Record<string, string> = {
  DAYTIME: "Diurno", NIGHTTIME: "Noturno", BOTH: "Ambos",
}

export default function EstimatesPage() {
  const router = useRouter()
  const { eventId, clientPin, loading: authLoading } = useClientAuth()
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [existing, setExisting] = useState<any | null>(null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      weddingStyles: [] as string[],
      priorities: [] as string[],
      period: "",
    },
  })

  useEffect(() => {
    if (authLoading || !eventId) return

    fetch(`/api/eventos/${eventId}/estimativas`)
      .then(r => r.json())
      .then(data => { if (data?.id) setExisting(data) })
      .finally(() => setPageLoading(false))
  }, [authLoading, eventId])

  const selectedStyles = watch("weddingStyles") as string[]
  const selectedPriorities = watch("priorities") as string[]

  function toggleStyle(value: string) {
    const current = selectedStyles || []
    setValue("weddingStyles",
      current.includes(value) ? current.filter(s => s !== value) : [...current, value]
    )
  }

  function togglePriority(value: string) {
    const current = selectedPriorities || []
    setValue("priorities",
      current.includes(value) ? current.filter(p => p !== value) : [...current, value]
    )
  }

  async function onSubmit(data: any) {
    if (!eventId || !clientPin) return
    setLoading(true)
    try {
      const res = await fetch(`/api/eventos/${eventId}/estimativas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, clientPin }),
      })
      if (!res.ok) { toast.error("Erro ao salvar estimativas"); return }
      toast.success("Estimativas salvas com sucesso!")
      router.push("/meu-evento")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || pageLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-lilac-50 to-rose-100">
      <div className="w-6 h-6 rounded-full border-2 border-lilac-400 border-t-transparent animate-spin" />
    </div>
  )

  // ── Vista somente-leitura (estimativas já enviadas) ──────────────
  if (existing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-lilac-50 to-rose-100 p-4">
        <div className="max-w-xl mx-auto">
          <Link href="/meu-evento" className="inline-flex items-center gap-2 text-sm text-lilac-500 hover:text-lilac-700 mb-5">
            <ArrowLeft size={16} />
            Voltar ao meu evento
          </Link>

          <div className="mb-6 text-center">
            <h1 className="font-serif text-2xl text-lilac-800">Suas Estimativas</h1>
            <p className="text-sm text-lilac-500 mt-1">Informações enviadas ao produtor</p>
          </div>

          {/* Aviso de bloqueio */}
          <div
            className="flex items-center gap-3 p-4 rounded-2xl mb-6"
            style={{ background: "rgba(132,82,169,0.08)", border: "1px solid rgba(132,82,169,0.18)" }}
          >
            <Lock size={16} className="text-lilac-500 shrink-0" />
            <p className="text-sm text-lilac-600">
              Suas estimativas já foram enviadas e não podem ser alteradas. Para editar, entre em contato com seu produtor.
            </p>
          </div>

          <div className="space-y-4">
            {/* Números */}
            <div className="glass-card p-6 space-y-3">
              <h2 className="font-medium text-lilac-700">Números do evento</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-lilac-400 mb-0.5">Convidados</p>
                  <p className="text-lg font-semibold text-lilac-800">{existing.guestCount}</p>
                </div>
                <div>
                  <p className="text-xs text-lilac-400 mb-0.5">Orçamento Estimado</p>
                  <p className="text-lg font-semibold text-lilac-800">{formatCurrency(existing.budgetMin)}</p>
                </div>
              </div>
            </div>

            {/* Estilos */}
            <div className="glass-card p-6">
              <h2 className="font-medium text-lilac-700 mb-3">Estilo do casamento</h2>
              <div className="flex flex-wrap gap-2">
                {existing.weddingStyles.map((s: string) => {
                  const label = STYLES.find(st => st.value === s)?.label ?? s
                  return (
                    <span key={s} className="px-4 py-2 rounded-full text-sm font-medium bg-lilac-600 text-white">
                      {label}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Período */}
            <div className="glass-card p-6">
              <h2 className="font-medium text-lilac-700 mb-2">Período do evento</h2>
              <p className="text-lilac-600">{PERIOD_LABELS[existing.period] ?? existing.period}</p>
            </div>

            {/* Prioridades */}
            <div className="glass-card p-6">
              <h2 className="font-medium text-lilac-700 mb-3">Prioridades</h2>
              <ol className="space-y-1.5">
                {existing.priorities.map((p: string, i: number) => {
                  const label = PRIORITIES.find(pr => pr.value === p)?.label ?? p
                  return (
                    <li key={p} className="flex items-center gap-3 text-sm">
                      <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 text-xs font-semibold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-lilac-700">{label}</span>
                    </li>
                  )
                })}
              </ol>
            </div>

            {/* Observações */}
            {existing.notes && (
              <div className="glass-card p-6">
                <h2 className="font-medium text-lilac-700 mb-2">Observações</h2>
                <p className="text-sm text-lilac-600 whitespace-pre-wrap">{existing.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Formulário (ainda não enviado) ──────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-lilac-50 to-rose-100 p-4">
      <div className="max-w-xl mx-auto">
        <Link href="/meu-evento" className="inline-flex items-center gap-2 text-sm text-lilac-500 hover:text-lilac-700 mb-5">
          <ArrowLeft size={16} />
          Voltar ao meu evento
        </Link>
        <div className="mb-6 text-center">
          <h1 className="font-serif text-2xl text-lilac-800">Conte-nos sobre o seu sonho</h1>
          <p className="text-sm text-lilac-500 mt-1">Essas informações ajudarão o produtor a preparar uma proposta personalizada</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Números do evento */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-medium text-lilac-700">Números do evento</h2>
            <div>
              <Label>Estimativa de convidados</Label>
              <Input type="number" {...register("guestCount")} className="glass-input mt-1" placeholder="150" />
              {errors.guestCount && <p className="text-rose-500 text-xs mt-1">Informe o número de convidados</p>}
            </div>
            <div>
              <Label>Orçamento Estimado (R$)</Label>
              <Input type="number" {...register("budget")} className="glass-input mt-1" placeholder="50000" />
            </div>
          </div>

          {/* Estilo do casamento */}
          <div className="glass-card p-6">
            <h2 className="font-medium text-lilac-700 mb-3">Estilo do casamento</h2>
            <div className="flex flex-wrap gap-2">
              {STYLES.map(style => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => toggleStyle(style.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    selectedStyles?.includes(style.value)
                      ? "bg-lilac-600 text-white border-lilac-600"
                      : "bg-white/50 text-lilac-600 border-lilac-200 hover:border-lilac-400"
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
            {errors.weddingStyles && <p className="text-rose-500 text-xs mt-2">Selecione ao menos um estilo</p>}
          </div>

          {/* Período */}
          <div className="glass-card p-6">
            <h2 className="font-medium text-lilac-700 mb-3">Período do evento</h2>
            <div className="flex gap-3">
              {[
                { value: "DAYTIME", label: "Diurno" },
                { value: "NIGHTTIME", label: "Noturno" },
                { value: "BOTH", label: "Ambos" },
              ].map(opt => (
                <label key={opt.value} className="flex-1">
                  <input type="radio" value={opt.value} {...register("period")} className="sr-only" />
                  <div className={`text-center py-3 rounded-xl border cursor-pointer transition-all ${
                    watch("period") === opt.value
                      ? "bg-rose-500 text-white border-rose-500"
                      : "bg-white/50 text-lilac-600 border-lilac-200"
                  }`}>
                    {opt.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Prioridades */}
          <div className="glass-card p-6">
            <h2 className="font-medium text-lilac-700 mb-3">O que é mais importante para vocês?</h2>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => togglePriority(p.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    selectedPriorities?.includes(p.value)
                      ? "bg-rose-500 text-white border-rose-500"
                      : "bg-white/50 text-rose-600 border-rose-200 hover:border-rose-400"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div className="glass-card p-6">
            <Label>Observações livres</Label>
            <textarea
              {...register("notes")}
              rows={4}
              className="glass-input w-full mt-1 p-3 resize-none"
              placeholder="Conte-nos mais sobre o seu sonho de casamento..."
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full btn-primary py-3 text-base">
            {loading ? "Salvando..." : "Salvar estimativas"}
          </Button>
        </form>
      </div>
    </div>
  )
}

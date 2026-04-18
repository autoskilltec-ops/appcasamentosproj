"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

const schema = z.object({
  scheduledAt: z.string().min(1, "Data e hora são obrigatórias"),
  modality: z.enum(["PRESENTIAL", "ONLINE"]),
  meetingLink: z.string().optional(),
  briefing: z.string().optional(),
  minutes: z.string().optional(),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]),
})

type FormData = z.infer<typeof schema>

export default function MeetingPage() {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { modality: "PRESENTIAL", status: "SCHEDULED" },
  })

  const modality = watch("modality")

  // Carregar reunião existente
  useEffect(() => {
    fetch(`/api/eventos/${id}/reuniao`)
      .then(r => r.json())
      .then(data => {
        if (data) {
          reset({
            scheduledAt: data.scheduledAt
              ? new Date(data.scheduledAt).toISOString().slice(0, 16)
              : "",
            modality: data.modality ?? "PRESENTIAL",
            meetingLink: data.meetingLink ?? "",
            briefing: data.briefing ?? "",
            minutes: data.minutes ?? "",
            status: data.status ?? "SCHEDULED",
          })
        }
      })
  }, [id, reset])

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const res = await fetch(`/api/eventos/${id}/reuniao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          scheduledAt: new Date(data.scheduledAt).toISOString(),
        }),
      })
      if (!res.ok) { toast.error("Erro ao salvar reunião"); return }
      toast.success("Reunião registrada com sucesso!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href={`/eventos/${id}`} className="inline-flex items-center gap-2 text-sm text-lilac-500 hover:text-lilac-700 mb-6">
        <ArrowLeft size={16} />
        Voltar ao evento
      </Link>

      <h1 className="font-serif text-2xl text-lilac-800 mb-6">Reunião Inicial</h1>

      <div className="glass-card p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Data, hora e status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data e hora</Label>
              <Input type="datetime-local" {...register("scheduledAt")} className="glass-input mt-1" />
              {errors.scheduledAt && <p className="text-rose-500 text-xs mt-1">{String(errors.scheduledAt.message)}</p>}
            </div>
            <div>
              <Label>Status</Label>
              <select {...register("status")} className="glass-input w-full mt-1 p-2 rounded-lg">
                <option value="SCHEDULED">Agendada</option>
                <option value="COMPLETED">Realizada</option>
                <option value="CANCELLED">Cancelada</option>
              </select>
            </div>
          </div>

          {/* Modalidade */}
          <div>
            <Label>Modalidade</Label>
            <div className="flex gap-3 mt-1">
              {["PRESENTIAL", "ONLINE"].map(m => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value={m} {...register("modality")} className="accent-lilac-600" />
                  <span className="text-sm text-lilac-700">{m === "PRESENTIAL" ? "Presencial" : "Online"}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Link da videochamada */}
          {modality === "ONLINE" && (
            <div>
              <Label>Link da videochamada</Label>
              <Input type="url" {...register("meetingLink")} className="glass-input mt-1" placeholder="https://meet.google.com/..." />
            </div>
          )}

          {/* Briefing */}
          <div>
            <Label>Briefing da reunião</Label>
            <textarea
              {...register("briefing")}
              rows={5}
              className="glass-input w-full mt-1 p-3 resize-none"
              placeholder="Descreva os pontos levantados durante o briefing inicial..."
            />
          </div>

          {/* Ata */}
          <div>
            <Label>Ata da reunião</Label>
            <textarea
              {...register("minutes")}
              rows={5}
              className="glass-input w-full mt-1 p-3 resize-none"
              placeholder="Registre as decisões e encaminhamentos da reunião..."
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full btn-primary">
            {loading ? "Salvando..." : "Salvar reunião"}
          </Button>
        </form>
      </div>
    </div>
  )
}

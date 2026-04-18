"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { generatePin } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const schema = z.object({
  groomName: z.string().min(2, "Nome do noivo é obrigatório"),
  brideName: z.string().min(2, "Nome da noiva é obrigatório"),
  weddingDate: z.string().min(1, "Data é obrigatória"),
  venueName: z.string().min(2, "Local é obrigatório"),
  pin: z.string().length(6, "PIN deve ter 6 dígitos").regex(/^\d+$/, "PIN deve ser numérico"),
})

type FormData = z.infer<typeof schema>

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { pin: generatePin() },
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const res = await fetch("/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          weddingDate: new Date(data.weddingDate).toISOString(),
        }),
      })

      if (!res.ok) {
        toast.error("Erro ao criar evento")
        return
      }

      const event = await res.json()
      toast.success("Evento criado com sucesso!")
      router.push(`/eventos/${event.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-lilac-500 hover:text-lilac-700 mb-6">
        <ArrowLeft size={16} />
        Voltar ao dashboard
      </Link>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-lilac-800">Novo Evento</h1>
        <p className="text-lilac-500 mt-1">Preencha as informações do casamento</p>
      </div>

      <div className="glass-card p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nome da noiva</Label>
              <Input {...register("brideName")} className="glass-input mt-1" placeholder="Ana Silva" />
              {errors.brideName && <p className="text-rose-500 text-xs mt-1">{errors.brideName.message}</p>}
            </div>
            <div>
              <Label>Nome do noivo</Label>
              <Input {...register("groomName")} className="glass-input mt-1" placeholder="Pedro Costa" />
              {errors.groomName && <p className="text-rose-500 text-xs mt-1">{errors.groomName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data do casamento</Label>
              <Input type="date" {...register("weddingDate")} className="glass-input mt-1" />
              {errors.weddingDate && <p className="text-rose-500 text-xs mt-1">{errors.weddingDate.message}</p>}
            </div>
            <div>
              <Label>PIN do cliente</Label>
              <div className="flex gap-2 mt-1">
                <Input {...register("pin")} maxLength={6} className="glass-input font-mono tracking-widest" />
                <Button type="button" variant="outline" onClick={() => setValue("pin", generatePin())}>
                  Gerar
                </Button>
              </div>
              {errors.pin && <p className="text-rose-500 text-xs mt-1">{errors.pin.message}</p>}
            </div>
          </div>

          <div>
            <Label>Local do casamento</Label>
            <Input {...register("venueName")} className="glass-input mt-1" placeholder="Espaço Villa Jardim" />
            {errors.venueName && <p className="text-rose-500 text-xs mt-1">{errors.venueName.message}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? "Criando..." : "Criar evento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

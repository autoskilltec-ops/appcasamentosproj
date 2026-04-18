"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

const schema = z.object({
  location: z.string().min(1, "Local é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  itemType: z.string().min(1),
  supplier: z.string().optional(),
  quantity: z.coerce.number().int().min(1),
  unitPrice: z.coerce.number().min(0),
  damageValue: z.coerce.number().min(0),
  status: z.string(),
  notes: z.string().optional(),
})

interface Props {
  item?: any
  onSave: (data: any) => void
  onClose: () => void
}

export function ChecklistItemForm({ item, onSave, onClose }: Props) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: item || {
      quantity: 1, unitPrice: 0, damageValue: 0, status: "PENDING", itemType: "FURNITURE",
    },
  })

  const status = watch("status")
  const qty = watch("quantity") || 1
  const price = watch("unitPrice") || 0

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-lilac-400 hover:text-lilac-600">
          <X size={20} />
        </button>

        <h2 className="font-serif text-xl text-lilac-800 mb-6">
          {item ? "Editar item" : "Novo item"}
        </h2>

        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Local *</Label>
              <Input {...register("location")} className="glass-input mt-1" placeholder="Salão principal" />
              {errors.location && <p className="text-rose-500 text-xs mt-1">{String(errors.location.message)}</p>}
            </div>
            <div>
              <Label>Tipo *</Label>
              <select {...register("itemType")} className="glass-input w-full mt-1 p-2 rounded-lg">
                <option value="FURNITURE">Mobiliário</option>
                <option value="LIGHTING">Iluminação</option>
                <option value="FLOWERS">Flores</option>
                <option value="DECORATION">Decoração</option>
                <option value="AUDIOVISUAL">Audiovisual</option>
                <option value="BUFFET">Buffet</option>
                <option value="OTHER">Outro</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Nome do item *</Label>
            <Input {...register("name")} className="glass-input mt-1" placeholder="Mesa com 5 cadeiras" />
            {errors.name && <p className="text-rose-500 text-xs mt-1">{String(errors.name.message)}</p>}
          </div>

          <div>
            <Label>Fornecedor/Empresa</Label>
            <Input {...register("supplier")} className="glass-input mt-1" placeholder="Nome da empresa" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Quantidade</Label>
              <Input type="number" min={1} {...register("quantity")} className="glass-input mt-1" />
            </div>
            <div>
              <Label>Valor unitário (R$)</Label>
              <Input type="number" step="0.01" min={0} {...register("unitPrice")} className="glass-input mt-1" />
            </div>
            <div>
              <Label className="text-green-600">Total calculado</Label>
              <div className="glass-input mt-1 p-2 rounded-lg text-right text-lilac-700 font-medium bg-white/30">
                R$ {(Number(qty) * Number(price)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className={status === "DAMAGED" ? "text-rose-600 font-medium" : ""}>
                Valor de avaria (R$){status === "DAMAGED" && " *"}
              </Label>
              <Input
                type="number" step="0.01" min={0}
                {...register("damageValue")}
                className={`glass-input mt-1 ${status === "DAMAGED" ? "border-rose-300" : ""}`}
              />
            </div>
            <div>
              <Label>Status</Label>
              <select {...register("status")} className="glass-input w-full mt-1 p-2 rounded-lg">
                <option value="PENDING">Pendente</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="DELIVERED">Entregue</option>
                <option value="DAMAGED">Com avaria</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <textarea {...register("notes")} rows={2} className="glass-input w-full mt-1 p-2 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1 btn-primary">Salvar item</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

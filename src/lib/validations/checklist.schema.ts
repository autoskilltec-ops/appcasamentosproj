import { z } from "zod"

export const checklistItemSchema = z.object({
  location: z.string().min(1, "Informe o local"),
  name: z.string().min(1, "Informe o nome do item"),
  itemType: z.enum(["FURNITURE", "LIGHTING", "FLOWERS", "DECORATION", "AUDIOVISUAL", "BUFFET", "OTHER"]),
  supplier: z.string().optional(),
  quantity: z.number().int().min(1, "Quantidade mínima: 1"),
  unitPrice: z.number().min(0, "Valor inválido"),
  damageValue: z.number().min(0, "Valor inválido").default(0),
  status: z.enum(["PENDING", "CONFIRMED", "DELIVERED", "DAMAGED"]).default("PENDING"),
  notes: z.string().max(500).optional(),
}).refine(data => {
  if (data.status === "DAMAGED" && data.damageValue === 0) {
    return false
  }
  return true
}, {
  message: "Informe o valor da avaria para itens com status 'Com avaria'",
  path: ["damageValue"],
})

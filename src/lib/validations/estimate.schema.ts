import { z } from "zod"

export const estimateSchema = z.object({
  guestCount: z.number().int().min(1, "Informe o número de convidados"),
  budget: z.number().min(0),
  weddingStyles: z.array(
    z.enum(["CLASSIC", "RUSTIC", "MODERN", "BOHO", "DESTINATION", "MINIMALIST", "RELIGIOUS", "OTHER"])
  ).min(1, "Selecione ao menos um estilo"),
  period: z.enum(["DAYTIME", "NIGHTTIME", "BOTH"]),
  priorities: z.array(z.string()).min(1, "Selecione ao menos uma prioridade"),
  notes: z.string().optional(),
  clientPin: z.string().length(6),
})

export type EstimateInput = z.infer<typeof estimateSchema>

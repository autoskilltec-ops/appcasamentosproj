import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const estimateSchema = z.object({
  guestCount: z.number().int().min(1, "Informe o número de convidados"),
  budget: z.number().min(0),
  weddingStyles: z.array(z.enum(["CLASSIC", "RUSTIC", "MODERN", "BOHO", "DESTINATION", "MINIMALIST", "RELIGIOUS", "OTHER"])).min(1),
  period: z.enum(["DAYTIME", "NIGHTTIME", "BOTH"]),
  priorities: z.array(z.string()).min(1),
  notes: z.string().optional(),
  clientPin: z.string().length(6),
})

type Context = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Context) {
  const { id } = await params
  const estimate = await prisma.estimate.findUnique({
    where: { eventId: id },
  })
  return NextResponse.json(estimate)
}

export async function POST(req: NextRequest, { params }: Context) {
  const { id } = await params
  try {
    const body = await req.json()
    const { clientPin, budget, ...rest } = estimateSchema.parse(body)
    const data = { ...rest, budgetMin: budget, budgetMax: budget }

    const event = await prisma.event.findFirst({
      where: { id, pin: clientPin },
    })
    if (!event) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

    const estimate = await prisma.estimate.upsert({
      where: { eventId: id },
      update: data,
      create: { ...data, eventId: id },
    })

    if (event.currentStage < 1) {
      await prisma.event.update({
        where: { id },
        data: { currentStage: 1, status: "IN_PROGRESS" },
      })
    }

    return NextResponse.json(estimate)
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
}

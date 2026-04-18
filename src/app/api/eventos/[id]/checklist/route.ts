import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const itemSchema = z.object({
  location: z.string().min(1, "Local é obrigatório"),
  name: z.string().min(1, "Nome do item é obrigatório"),
  itemType: z.enum(["FURNITURE", "LIGHTING", "FLOWERS", "DECORATION", "AUDIOVISUAL", "BUFFET", "OTHER"]),
  supplier: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.number().min(0).default(0),
  damageValue: z.number().min(0).default(0),
  status: z.enum(["PENDING", "CONFIRMED", "DELIVERED", "DAMAGED"]).default("PENDING"),
  notes: z.string().optional(),
})

type Context = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Context) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const items = await prisma.checklistItem.findMany({
    where: { eventId: id },
    orderBy: [{ location: "asc" }, { createdAt: "asc" }],
  })

  return NextResponse.json(items)
}

export async function POST(req: NextRequest, { params }: Context) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  try {
    const body = await req.json()
    const data = itemSchema.parse(body)

    const event = await prisma.event.findFirst({
      where: { id, producerId: session.user.id },
    })
    if (!event) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 })

    const totalPrice = data.quantity * data.unitPrice

    const item = await prisma.checklistItem.create({
      data: { ...data, totalPrice, eventId: id },
    })

    if (event.currentStage < 4) {
      await prisma.event.update({
        where: { id },
        data: { currentStage: 4 },
      })
    }

    return NextResponse.json(item, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  location: z.string().optional(),
  name: z.string().optional(),
  itemType: z.enum(["FURNITURE", "LIGHTING", "FLOWERS", "DECORATION", "AUDIOVISUAL", "BUFFET", "OTHER"]).optional(),
  supplier: z.string().optional(),
  quantity: z.number().int().min(1).optional(),
  unitPrice: z.number().min(0).optional(),
  damageValue: z.number().min(0).optional(),
  status: z.enum(["PENDING", "CONFIRMED", "DELIVERED", "DAMAGED"]).optional(),
  notes: z.string().optional(),
})

type Context = { params: Promise<{ id: string; itemId: string }> }

export async function PUT(req: NextRequest, { params }: Context) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id: eventId, itemId } = await params
  try {
    const body = await req.json()
    const data = updateSchema.parse(body)

    const existing = await prisma.checklistItem.findUnique({
      where: { id: itemId },
      include: { event: { select: { producerId: true } } },
    })
    if (!existing) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 })
    if (existing.event.producerId !== session.user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const newQty = data.quantity ?? existing.quantity
    const newPrice = data.unitPrice ?? existing.unitPrice
    const totalPrice = newQty * newPrice

    if (data.status === "DAMAGED" && (data.damageValue ?? existing.damageValue) === 0) {
      return NextResponse.json({ error: "Informe o valor da avaria" }, { status: 400 })
    }

    const item = await prisma.checklistItem.update({
      where: { id: itemId },
      data: { ...data, totalPrice },
    })

    return NextResponse.json(item)
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { itemId } = await params

  const item = await prisma.checklistItem.findUnique({
    where: { id: itemId },
    include: { event: { select: { producerId: true } } },
  })
  if (!item) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 })
  if (item.event.producerId !== session.user.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  await prisma.checklistItem.delete({ where: { id: itemId } })
  return NextResponse.json({ success: true })
}

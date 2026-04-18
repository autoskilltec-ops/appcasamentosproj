import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const pin = req.nextUrl.searchParams.get("pin")
  if (!pin || pin.length !== 6) {
    return NextResponse.json({ error: "PIN inválido" }, { status: 400 })
  }

  const event = await prisma.event.findUnique({
    where: { pin },
    select: {
      id: true,
      coupleName: true,
      groomName: true,
      brideName: true,
      weddingDate: true,
      venueName: true,
      currentStage: true,
      status: true,
      meeting: { select: { scheduledAt: true, modality: true, status: true } },
      estimate: {
        select: {
          guestCount: true,
          budgetMin: true,
          weddingStyles: true,
          period: true,
          priorities: true,
          notes: true,
        },
      },
      proposal: {
        select: {
          link: true,
          viewedByClient: true,
          clientNotes: true,
        },
      },
      checklistItems: {
        select: {
          id: true,
          name: true,
          location: true,
          itemType: true,
          supplier: true,
          quantity: true,
          totalPrice: true,
          status: true,
        },
        orderBy: [{ location: "asc" }, { name: "asc" }],
      },
    },
  })

  if (!event || event.status === "CANCELLED") {
    return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 })
  }

  const totalCommitted = event.checklistItems.reduce((s, i) => s + i.totalPrice, 0)
  const budget = event.estimate?.budgetMin ?? 0

  const byType = event.checklistItems.reduce<Record<string, number>>((acc, i) => {
    acc[i.itemType] = (acc[i.itemType] ?? 0) + i.totalPrice
    return acc
  }, {})

  const byLocation = event.checklistItems.reduce<Record<string, typeof event.checklistItems>>((acc, i) => {
    if (!acc[i.location]) acc[i.location] = []
    acc[i.location].push(i)
    return acc
  }, {})

  const { checklistItems, ...rest } = event

  return NextResponse.json({
    ...rest,
    checklist: byLocation,
    financial: {
      budget,
      totalCommitted,
      remaining: budget - totalCommitted,
      itemCount: checklistItems.length,
      byType,
    },
  })
}

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { generatePin } from "@/lib/utils"

const createEventSchema = z.object({
  groomName: z.string().min(2),
  brideName: z.string().min(2),
  weddingDate: z.string().datetime(),
  venueName: z.string().min(2),
  pin: z.string().length(6).optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const search = searchParams.get("search")

  const events = await prisma.event.findMany({
    where: {
      producerId: session.user.id,
      ...(status ? { status: status as any } : {}),
      ...(search ? {
        OR: [
          { groomName: { contains: search, mode: "insensitive" } },
          { brideName: { contains: search, mode: "insensitive" } },
          { venueName: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
    },
    include: {
      estimate: { select: { guestCount: true, budgetMin: true, budgetMax: true } },
      proposal: { select: { viewedByClient: true } },
      _count: { select: { checklistItems: true } },
    },
    orderBy: { weddingDate: "asc" },
  })

  return NextResponse.json(events)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const body = await req.json()
    const data = createEventSchema.parse(body)

    let pin = data.pin || generatePin()
    let attempts = 0
    while (attempts < 10) {
      const existing = await prisma.event.findUnique({ where: { pin } })
      if (!existing) break
      pin = generatePin()
      attempts++
    }

    const event = await prisma.event.create({
      data: {
        groomName: data.groomName,
        brideName: data.brideName,
        coupleName: `${data.brideName} & ${data.groomName}`,
        weddingDate: new Date(data.weddingDate),
        venueName: data.venueName,
        pin,
        producerId: session.user.id,
        status: "ACTIVE",
        currentStage: 0,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const meetingSchema = z.object({
  scheduledAt: z.string().datetime(),
  modality: z.enum(["PRESENTIAL", "ONLINE"]),
  meetingLink: z.string().url().optional().or(z.literal("")),
  briefing: z.string().optional(),
  minutes: z.string().optional(),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]).default("SCHEDULED"),
})

type Context = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Context) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const meeting = await prisma.meeting.findUnique({ where: { eventId: id } })
  return NextResponse.json(meeting)
}

export async function POST(req: NextRequest, { params }: Context) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  try {
    const body = await req.json()
    const data = meetingSchema.parse(body)

    const event = await prisma.event.findFirst({
      where: { id, producerId: session.user.id },
    })
    if (!event) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 })

    const meeting = await prisma.meeting.upsert({
      where: { eventId: id },
      update: {
        ...data,
        scheduledAt: new Date(data.scheduledAt),
        meetingLink: data.meetingLink || null,
      },
      create: {
        ...data,
        scheduledAt: new Date(data.scheduledAt),
        meetingLink: data.meetingLink || null,
        eventId: id,
      },
    })

    if (data.status === "COMPLETED" && event.currentStage < 2) {
      await prisma.event.update({
        where: { id },
        data: { currentStage: 2 },
      })
    }

    return NextResponse.json(meeting)
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const proposalSchema = z.object({
  link: z.string().url("Informe uma URL válida"),
})

type Context = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Context) {
  const { id } = await params
  const proposal = await prisma.proposal.findUnique({ where: { eventId: id } })
  return NextResponse.json(proposal)
}

export async function POST(req: NextRequest, { params }: Context) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  try {
    const body = await req.json()
    const { link } = proposalSchema.parse(body)

    const event = await prisma.event.findFirst({
      where: { id, producerId: session.user.id },
    })
    if (!event) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 })

    const proposal = await prisma.proposal.upsert({
      where: { eventId: id },
      update: { link },
      create: { link, eventId: id },
    })

    if (event.currentStage < 3) {
      await prisma.event.update({
        where: { id },
        data: { currentStage: 3 },
      })
    }

    return NextResponse.json(proposal)
  } catch {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest, { params }: Context) {
  const { id } = await params
  try {
    const body = await req.json()
    const { clientPin, clientNotes } = body

    const event = await prisma.event.findFirst({
      where: { id, pin: clientPin },
    })
    if (!event) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

    const proposal = await prisma.proposal.update({
      where: { eventId: id },
      data: { clientNotes },
    })

    return NextResponse.json(proposal)
  } catch {
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 400 })
  }
}

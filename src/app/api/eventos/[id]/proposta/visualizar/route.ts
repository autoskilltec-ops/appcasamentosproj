import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Context = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Context) {
  const { id } = await params
  try {
    const body = await req.json()
    const { clientPin } = body

    const event = await prisma.event.findFirst({
      where: { id, pin: clientPin },
      include: { proposal: true },
    })

    if (!event) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    if (!event.proposal) return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 })

    if (!event.proposal.viewedByClient) {
      await prisma.proposal.update({
        where: { eventId: id },
        data: {
          viewedByClient: true,
          viewedAt: new Date(),
        },
      })
    }

    return NextResponse.json({ success: true, link: event.proposal.link })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

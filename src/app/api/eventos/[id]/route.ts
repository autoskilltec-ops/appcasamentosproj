import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Next.js 16: params é Promise<{...}>
type Context = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Context) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params

  const event = await prisma.event.findFirst({
    where: { id, producerId: session.user.id },
    include: {
      estimate: true,
      meeting: true,
      proposal: true,
      checklistItems: { orderBy: [{ location: "asc" }, { createdAt: "asc" }] },
      producer: { select: { name: true, email: true } },
    },
  })

  if (!event) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 })

  return NextResponse.json(event)
}

export async function PUT(req: NextRequest, { params }: Context) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params

  try {
    const body = await req.json()
    const event = await prisma.event.update({
      where: { id, producerId: session.user.id },
      data: {
        ...body,
        weddingDate: body.weddingDate ? new Date(body.weddingDate) : undefined,
        coupleName: body.brideName && body.groomName
          ? `${body.brideName} & ${body.groomName}`
          : undefined,
      },
    })
    return NextResponse.json(event)
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params

  await prisma.event.delete({
    where: { id, producerId: session.user.id },
  })

  return NextResponse.json({ success: true })
}

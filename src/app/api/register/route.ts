import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }

  const { name, email, password } = parsed.data

  try {
    const existing = await prisma.producer.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)
    await prisma.producer.create({ data: { name, email, password: hashed } })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error("[register] Erro ao criar produtor:", err)
    return NextResponse.json({ error: "Erro interno ao criar conta" }, { status: 500 })
  }
}

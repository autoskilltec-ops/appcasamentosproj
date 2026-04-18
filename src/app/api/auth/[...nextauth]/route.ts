import { handlers } from "@/lib/auth"
import type { NextRequest } from "next/server"

// Wrappers necessários para compatibilidade entre NextAuth v5 e Next.js 16
// (Next.js 16 exige que params seja Promise; NextAuth ainda não atualizou os tipos)
export function GET(req: NextRequest, context: { params: Promise<Record<string, string | string[]>> }) {
  return (handlers.GET as Function)(req, context)
}

export function POST(req: NextRequest, context: { params: Promise<Record<string, string | string[]>> }) {
  return (handlers.POST as Function)(req, context)
}

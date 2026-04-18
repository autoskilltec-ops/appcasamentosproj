import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"

type Handler = (req: NextRequest, context: any) => Promise<NextResponse>

export function withErrorHandler(handler: Handler): Handler {
  return async (req, context) => {
    try {
      return await handler(req, context)
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: "Dados inválidos", details: error.issues },
          { status: 400 }
        )
      }

      console.error("[API Error]", error)
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      )
    }
  }
}

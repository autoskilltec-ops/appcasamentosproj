"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

export default function ProducerError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="glass-card p-10 max-w-md w-full text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(194,96,126,0.10)" }}
        >
          <AlertTriangle size={24} className="text-rose-500" />
        </div>
        <h2 className="font-serif text-xl text-lilac-800 mb-2">Algo deu errado</h2>
        <p className="text-sm text-lilac-500 mb-6 leading-relaxed">
          Ocorreu um erro ao carregar esta página. Verifique sua conexão e tente novamente.
        </p>
        <button
          onClick={unstable_retry}
          className="btn-primary px-6 py-2.5 text-sm"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}

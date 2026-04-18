"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink, Eye, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function ClientProposalPage() {
  const router = useRouter()
  const [proposal, setProposal] = useState<any>(null)
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [eventId, setEventId] = useState<string | null>(null)
  const [clientPin, setClientPin] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = sessionStorage.getItem("clientEventId")
    const pin = sessionStorage.getItem("clientPin")
    if (!id || !pin) { router.replace("/"); return }
    setEventId(id)
    setClientPin(pin)

    fetch(`/api/eventos/${id}/proposta`)
      .then(r => r.json())
      .then(data => {
        if (data) {
          setProposal(data)
          setNotes(data.clientNotes || "")
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  async function handleViewProposal() {
    if (!eventId || !clientPin || !proposal?.link) return

    await fetch(`/api/eventos/${eventId}/proposta/visualizar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientPin }),
    })

    window.open(proposal.link, "_blank")
    setProposal((prev: any) => ({ ...prev, viewedByClient: true }))
  }

  async function saveNotes() {
    if (!eventId || !clientPin) return
    setSaving(true)
    try {
      const res = await fetch(`/api/eventos/${eventId}/proposta`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientPin, clientNotes: notes }),
      })
      if (!res.ok) { toast.error("Erro ao salvar"); return }
      toast.success("Observações salvas!")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-lilac-50 to-rose-100 p-4">
        <div className="glass-card p-8 text-center max-w-sm">
          <p className="text-lilac-500">A proposta ainda não está disponível.</p>
          <p className="text-xs text-lilac-400 mt-2">Seu produtor irá disponibilizá-la em breve.</p>
          <Link href="/meu-evento" className="inline-block mt-4 text-sm text-lilac-600 underline">
            Voltar
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-lilac-50 to-rose-100 p-4">
      <div className="max-w-xl mx-auto space-y-6">
        <Link href="/meu-evento" className="inline-flex items-center gap-2 text-sm text-lilac-500 hover:text-lilac-700">
          <ArrowLeft size={16} />
          Voltar ao meu evento
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/meu-evento" className="text-lilac-400 hover:text-lilac-600">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-serif text-2xl text-lilac-800">Sua Proposta</h1>
            <p className="text-sm text-lilac-500">Preparada especialmente para vocês</p>
          </div>
        </div>

        {/* Botão de visualizar */}
        <div className="glass-card p-8 text-center">
          <Button
            onClick={handleViewProposal}
            className="btn-primary px-8 py-4 text-base gap-2"
          >
            <ExternalLink size={20} />
            Visualizar proposta
          </Button>

          {proposal.viewedByClient && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-lilac-500">
              <Eye size={16} className="text-lilac-400" />
              <span>Você já visualizou esta proposta</span>
            </div>
          )}
        </div>

        {/* Observações do cliente */}
        <div className="glass-card p-6">
          <h2 className="font-medium text-lilac-700 mb-3">Suas observações</h2>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={5}
            className="glass-input w-full p-3 resize-none"
            placeholder="Tem alguma dúvida, sugestão ou comentário sobre a proposta? Escreva aqui..."
          />
          <Button onClick={saveNotes} disabled={saving} className="w-full btn-primary mt-3">
            {saving ? "Salvando..." : "Salvar observações"}
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Link as LinkIcon, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { formatDateTime } from "@/lib/utils"

export default function ProposalPage() {
  const { id } = useParams<{ id: string }>()
  const [link, setLink] = useState("")
  const [proposal, setProposal] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/eventos/${id}/proposta`)
      .then(r => r.json())
      .then(data => {
        if (data) {
          setProposal(data)
          setLink(data.link || "")
        }
      })
  }, [id])

  async function saveLink() {
    if (!link) { toast.error("Informe o link da proposta"); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/eventos/${id}/proposta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link }),
      })
      if (!res.ok) { toast.error("URL inválida"); return }
      const data = await res.json()
      setProposal(data)
      toast.success("Proposta salva!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href={`/eventos/${id}`} className="inline-flex items-center gap-2 text-sm text-lilac-500 hover:text-lilac-700 mb-6">
        <ArrowLeft size={16} />
        Voltar ao evento
      </Link>

      <h1 className="font-serif text-2xl text-lilac-800 mb-6">Proposta Personalizada</h1>

      <div className="glass-card p-8 space-y-6">

        {/* Status de visualização */}
        {proposal && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            proposal.viewedByClient
              ? "bg-green-50 border-green-200"
              : "bg-amber-50 border-amber-200"
          }`}>
            {proposal.viewedByClient ? (
              <>
                <Eye size={20} className="text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-700">Proposta visualizada pelo cliente</p>
                  <p className="text-xs text-green-500">{formatDateTime(proposal.viewedAt)}</p>
                </div>
              </>
            ) : (
              <>
                <EyeOff size={20} className="text-amber-500" />
                <p className="text-sm text-amber-700">O cliente ainda não visualizou a proposta</p>
              </>
            )}
          </div>
        )}

        {/* Campo de link */}
        <div>
          <Label>Link da proposta</Label>
          <p className="text-xs text-lilac-400 mb-2">Cole o link do Google Slides, Canva, PDF ou qualquer outro formato</p>
          <div className="flex gap-2">
            <Input
              type="url"
              value={link}
              onChange={e => setLink(e.target.value)}
              className="glass-input flex-1"
              placeholder="https://..."
            />
            <Button onClick={saveLink} disabled={loading} className="btn-primary">
              <LinkIcon size={16} className="mr-2" />
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        {/* Observações do cliente */}
        {proposal?.clientNotes && (
          <div className="pt-4 border-t border-lilac-100">
            <p className="text-sm font-medium text-lilac-700 mb-2">Observações do cliente sobre a proposta:</p>
            <div className="bg-white/50 rounded-xl p-4 border border-lilac-100">
              <p className="text-sm text-lilac-600">{proposal.clientNotes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

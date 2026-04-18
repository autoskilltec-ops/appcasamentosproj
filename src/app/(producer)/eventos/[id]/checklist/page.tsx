"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ChecklistGroupByLocal } from "@/components/checklist/ChecklistGroupByLocal"
import { ChecklistItemForm } from "@/components/checklist/ChecklistItemForm"
import { ChecklistTotals } from "@/components/checklist/ChecklistTotals"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function ChecklistPage() {
  const { id } = useParams<{ id: string }>()
  const [items, setItems] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState("ALL")
  const [filterSupplier, setFilterSupplier] = useState("ALL")

  const fetchItems = useCallback(async () => {
    const res = await fetch(`/api/eventos/${id}/checklist`)
    const data = await res.json()
    setItems(data)
    setLoading(false)
  }, [id])

  useEffect(() => { fetchItems() }, [fetchItems])

  async function handleSave(data: any) {
    const method = editingItem ? "PUT" : "POST"
    const url = editingItem
      ? `/api/eventos/${id}/checklist/${editingItem.id}`
      : `/api/eventos/${id}/checklist`

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      toast.error(err.error || "Erro ao salvar")
      return
    }

    toast.success(editingItem ? "Item atualizado!" : "Item adicionado!")
    setShowForm(false)
    setEditingItem(null)
    fetchItems()
  }

  async function handleDelete(itemId: string) {
    if (!confirm("Remover este item?")) return
    await fetch(`/api/eventos/${id}/checklist/${itemId}`, { method: "DELETE" })
    toast.success("Item removido")
    fetchItems()
  }

  async function handleStatusChange(itemId: string, status: string) {
    await fetch(`/api/eventos/${id}/checklist/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    fetchItems()
  }

  // Filtrar itens
  const filteredItems = items.filter(item => {
    if (filterType !== "ALL" && item.itemType !== filterType) return false
    if (filterSupplier !== "ALL" && item.supplier !== filterSupplier) return false
    return true
  })

  // Agrupar por local
  const grouped = filteredItems.reduce((acc, item) => {
    if (!acc[item.location]) acc[item.location] = []
    acc[item.location].push(item)
    return acc
  }, {} as Record<string, any[]>)

  // Fornecedores únicos para o filtro
  const suppliers = [...new Set(items.map(i => i.supplier).filter(Boolean))] as string[]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link href={`/eventos/${id}`} className="inline-flex items-center gap-2 text-sm text-lilac-500 hover:text-lilac-700 mb-6">
        <ArrowLeft size={16} />
        Voltar ao evento
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-lilac-800">Checklist de Itens</h1>
          <p className="text-sm text-lilac-500 mt-1">{items.length} {items.length === 1 ? "item cadastrado" : "itens cadastrados"}</p>
        </div>
        <Button
          onClick={() => { setEditingItem(null); setShowForm(true) }}
          className="btn-primary gap-2"
        >
          <Plus size={16} />
          Adicionar item
        </Button>
      </div>

      {/* Totalizadores */}
      <ChecklistTotals items={items} />

      {/* Filtros */}
      <div className="glass-card p-4 flex gap-3 flex-wrap mb-6 mt-4">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="glass-input px-3 py-1.5 text-sm rounded-lg"
        >
          <option value="ALL">Todos os tipos</option>
          <option value="FURNITURE">Mobiliário</option>
          <option value="LIGHTING">Iluminação</option>
          <option value="FLOWERS">Flores</option>
          <option value="DECORATION">Decoração</option>
          <option value="AUDIOVISUAL">Audiovisual</option>
          <option value="BUFFET">Buffet</option>
          <option value="OTHER">Outro</option>
        </select>

        {suppliers.length > 0 && (
          <select
            value={filterSupplier}
            onChange={e => setFilterSupplier(e.target.value)}
            className="glass-input px-3 py-1.5 text-sm rounded-lg"
          >
            <option value="ALL">Todos os fornecedores</option>
            {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>

      {/* Lista agrupada por local */}
      {loading ? (
        <div className="text-center py-12 text-lilac-400">Carregando...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-lilac-400">
            {items.length === 0 ? "Nenhum item cadastrado ainda." : "Nenhum item encontrado com os filtros selecionados."}
          </p>
          {items.length === 0 && (
            <Button onClick={() => setShowForm(true)} className="btn-primary mt-4 gap-2">
              <Plus size={16} />
              Adicionar primeiro item
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {(Object.entries(grouped) as [string, any[]][]).map(([location, locationItems]) => (
            <ChecklistGroupByLocal
              key={location}
              location={location}
              items={locationItems}
              onEdit={(item) => { setEditingItem(item); setShowForm(true) }}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Modal de formulário */}
      {showForm && (
        <ChecklistItemForm
          item={editingItem}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingItem(null) }}
        />
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Edit, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { ChecklistTypeLabels, ItemStatusLabels } from "@/types"

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  CONFIRMED: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-green-100 text-green-700",
  DAMAGED: "bg-red-100 text-red-700",
}

interface Props {
  location: string
  items: any[]
  onEdit: (item: any) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: string) => void
}

export function ChecklistGroupByLocal({ location, items, onEdit, onDelete, onStatusChange }: Props) {
  const [open, setOpen] = useState(true)
  const locationTotal = items.reduce((sum, i) => sum + i.totalPrice, 0)

  return (
    <div className="glass-card overflow-hidden">
      {/* Cabeçalho do local */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          {open
            ? <ChevronDown size={16} className="text-lilac-500" />
            : <ChevronRight size={16} className="text-lilac-500" />
          }
          <span className="font-medium text-lilac-800">{location}</span>
          <span className="text-xs bg-lilac-100 text-lilac-600 px-2 py-0.5 rounded-full">
            {items.length} {items.length === 1 ? "item" : "itens"}
          </span>
        </div>
        <span className="text-sm font-medium text-lilac-700">{formatCurrency(locationTotal)}</span>
      </button>

      {/* Tabela de itens */}
      {open && (
        <div className="border-t border-white/30 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/20 text-xs text-lilac-500 uppercase tracking-wide">
                <th className="text-left p-3">Item</th>
                <th className="text-left p-3">Tipo</th>
                <th className="text-left p-3">Fornecedor</th>
                <th className="text-center p-3">Qtd</th>
                <th className="text-right p-3">Valor Unit.</th>
                <th className="text-right p-3">Total</th>
                <th className="text-right p-3">Avaria</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-t border-white/20 hover:bg-white/10">
                  <td className="p-3 font-medium text-lilac-800">{item.name}</td>
                  <td className="p-3 text-lilac-500">{ChecklistTypeLabels[item.itemType]}</td>
                  <td className="p-3 text-lilac-500">{item.supplier || "—"}</td>
                  <td className="p-3 text-center text-lilac-700">{item.quantity}</td>
                  <td className="p-3 text-right text-lilac-700">{formatCurrency(item.unitPrice)}</td>
                  <td className="p-3 text-right font-medium text-lilac-800">{formatCurrency(item.totalPrice)}</td>
                  <td className="p-3 text-right text-rose-500">
                    {item.damageValue > 0 ? formatCurrency(item.damageValue) : "—"}
                  </td>
                  <td className="p-3 text-center">
                    <select
                      value={item.status}
                      onChange={e => onStatusChange(item.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${statusColors[item.status]}`}
                    >
                      <option value="PENDING">Pendente</option>
                      <option value="CONFIRMED">Confirmado</option>
                      <option value="DELIVERED">Entregue</option>
                      <option value="DAMAGED">Com avaria</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="text-lilac-400 hover:text-lilac-600 transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-rose-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

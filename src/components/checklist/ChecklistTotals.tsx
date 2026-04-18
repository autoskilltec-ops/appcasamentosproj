import { formatCurrency } from "@/lib/utils"

interface Props { items: any[] }

export function ChecklistTotals({ items }: Props) {
  const totalItems = items.reduce((sum, i) => sum + i.totalPrice, 0)
  const totalDamage = items.reduce((sum, i) => sum + i.damageValue, 0)
  const totalDamaged = items.filter(i => i.status === "DAMAGED").length
  const totalConfirmed = items.filter(i => i.status === "CONFIRMED" || i.status === "DELIVERED").length

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Total dos itens", value: formatCurrency(totalItems), color: "text-lilac-700" },
        { label: "Total de avarias", value: formatCurrency(totalDamage), color: "text-rose-600" },
        { label: "Itens confirmados", value: `${totalConfirmed}/${items.length}`, color: "text-green-600" },
        { label: "Com avaria", value: totalDamaged.toString(), color: "text-rose-500" },
      ].map(stat => (
        <div key={stat.label} className="glass-card p-4 text-center">
          <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
          <p className="text-xs text-lilac-400 mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}

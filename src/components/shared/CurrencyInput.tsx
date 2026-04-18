"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface CurrencyInputProps {
  value: number
  onChange: (value: number) => void
  className?: string
  placeholder?: string
}

export function CurrencyInput({ value, onChange, className, placeholder = "R$ 0,00" }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(
    value > 0 ? value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ""
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "")
    const numeric = parseInt(raw || "0") / 100

    setDisplayValue(numeric > 0 ? numeric.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : "")
    onChange(numeric)
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-lilac-400">R$</span>
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn("glass-input pl-9 text-right", className)}
      />
    </div>
  )
}

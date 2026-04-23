"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const schema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      })

      if (res.status === 409) {
        toast.error("E-mail já cadastrado")
        return
      }

      if (!res.ok) {
        toast.error("Erro ao criar conta. Tente novamente.")
        return
      }

      toast.success("Conta criada! Faça o login.")
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-lilac-50 to-rose-100">
      <div className="glass-card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-lilac-800 mb-2">Wedding Manager</h1>
          <p className="text-sm text-lilac-500">Criar conta de produtor</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" type="text" {...register("name")} className="glass-input mt-1" />
            {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...register("email")} className="glass-input mt-1" />
            {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" {...register("password")} className="glass-input mt-1" />
            {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input id="confirmPassword" type="password" {...register("confirmPassword")} className="glass-input mt-1" />
            {errors.confirmPassword && <p className="text-rose-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <Button type="submit" disabled={loading} className="w-full btn-primary mt-6">
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-lilac-200 text-center">
          <p className="text-xs text-lilac-400">
            Já tem conta?{" "}
            <a href="/login" className="text-lilac-600 underline">Fazer login</a>
          </p>
        </div>
      </div>
    </div>
  )
}

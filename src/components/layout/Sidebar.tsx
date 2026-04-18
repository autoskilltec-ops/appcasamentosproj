"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  producerName: string
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/eventos/novo", icon: Calendar, label: "Novo evento" },
]

export function Sidebar({ producerName }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 glass-card-dark p-6 flex flex-col rounded-none rounded-r-2xl border-l-0">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="font-serif text-xl text-white">Wedding Manager</h1>
        <p className="text-xs text-lilac-300 mt-1">{producerName}</p>
      </div>

      {/* Navegação */}
      <nav className="flex-1 space-y-1">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
              pathname === item.href || pathname.startsWith(item.href)
                ? "bg-white/20 text-white"
                : "text-lilac-300 hover:bg-white/10 hover:text-white"
            )}
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-lilac-400 hover:text-white hover:bg-white/10 transition-all mt-4"
      >
        <LogOut size={16} />
        Sair
      </button>
    </aside>
  )
}

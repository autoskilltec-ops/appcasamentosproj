"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, LogOut, Menu, X } from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  producerName: string
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/eventos/novo", icon: Calendar, label: "Novo evento" },
]

function SidebarContent({ producerName, pathname, onClose }: { producerName: string; pathname: string; onClose?: () => void }) {
  return (
    <>
      <div className="mb-8">
        <h1 className="font-serif text-xl text-white">Wedding Manager</h1>
        <p className="text-xs text-lilac-300 mt-1">{producerName}</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(item => {
          const isActive =
            pathname === item.href ||
            (item.href === "/dashboard" &&
              pathname.startsWith("/eventos/") &&
              !pathname.startsWith("/eventos/novo"))

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-white/20 text-white"
                  : "text-lilac-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-lilac-400 hover:text-white hover:bg-white/10 transition-all mt-4"
      >
        <LogOut size={16} />
        Sair
      </button>
    </>
  )
}

export function Sidebar({ producerName }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 glass-card-dark p-6 flex-col rounded-none rounded-r-2xl border-l-0 z-40">
        <SidebarContent producerName={producerName} pathname={pathname} />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 glass-card-dark rounded-none">
        <span className="font-serif text-base text-white">Wedding Manager</span>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-lilac-300 hover:text-white transition-colors"
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 h-full glass-card-dark p-6 flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-lilac-300 hover:text-white"
              aria-label="Fechar menu"
            >
              <X size={20} />
            </button>
            <SidebarContent
              producerName={producerName}
              pathname={pathname}
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  )
}

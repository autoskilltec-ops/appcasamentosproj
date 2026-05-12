"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, CalendarPlus, LogOut, Menu, X, Sparkles } from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  producerName: string
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/eventos/novo", icon: CalendarPlus, label: "Novo evento" },
]

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map(n => n[0])
    .join("")
    .toUpperCase()
}

function SidebarContent({
  producerName,
  pathname,
  onClose,
}: {
  producerName: string
  pathname: string
  onClose?: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="mb-8 px-2">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl"
            style={{ background: "linear-gradient(135deg, #c2607e, #8452a9)" }}>
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-serif text-xl text-white tracking-wide">Véu & Plano</span>
        </div>
        <p className="text-xs text-white/40 pl-[42px]">Gestão de eventos</p>
      </div>

      {/* Divider */}
      <div className="h-px mb-6" style={{ background: "rgba(255,255,255,0.08)" }} />

      {/* Navigation */}
      <div className="mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 px-4 mb-2">Menu</p>
        <nav className="space-y-0.5">
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
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-white/55 hover:bg-white/8 hover:text-white/90"
                )}
              >
                <item.icon
                  size={16}
                  className={cn(
                    "shrink-0 transition-colors",
                    isActive ? "text-rose-300" : "text-white/40"
                  )}
                />
                {item.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-400" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Divider */}
      <div className="h-px mb-4" style={{ background: "rgba(255,255,255,0.08)" }} />

      {/* User section */}
      <div className="flex items-center gap-3 px-2 mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ background: "linear-gradient(135deg, #8452a9, #c2607e)" }}
        >
          {getInitials(producerName)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate leading-tight">{producerName}</p>
          <p className="text-[10px] text-white/40">Produtor</p>
        </div>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/45 hover:text-white hover:bg-white/8 transition-all duration-150 w-full"
      >
        <LogOut size={15} className="shrink-0" />
        Sair da conta
      </button>
    </div>
  )
}

export function Sidebar({ producerName }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarBg = {
    background: "linear-gradient(170deg, #2c1a4d 0%, #1a0d35 100%)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-full w-64 p-5 flex-col z-40 rounded-none"
        style={sidebarBg}
      >
        <SidebarContent producerName={producerName} pathname={pathname} />
      </aside>

      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14"
        style={sidebarBg}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg"
            style={{ background: "linear-gradient(135deg, #c2607e, #8452a9)" }}>
            <Sparkles size={11} className="text-white" />
          </div>
          <span className="font-serif text-base text-white">Véu & Plano</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-white/60 hover:text-white transition-colors p-1"
          aria-label="Abrir menu"
        >
          <Menu size={21} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="relative w-64 h-full p-5 flex flex-col"
            style={sidebarBg}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              aria-label="Fechar menu"
            >
              <X size={19} />
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

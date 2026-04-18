"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowRight, Sparkles, LogIn, Heart } from "lucide-react"

// ── Dados das flores: [x, y, escala, rotação, tipo(5|4)]
// Tipo 5 = flor de 5 pétalas | Tipo 4 = flor de 4 pétalas menor
// Distribuição orgânica em viewBox 1440×900
const FLOWERS: [number, number, number, number, 5 | 4][] = [
  // Área superior
  [55,   90,  2.2,  15,  5],
  [185,  38,  1.4, -22,  4],
  [330, 175,  2.8,  40,  5],
  [130, 215,  1.1,  60,  4],
  [530,  45,  1.7, -10,  5],
  [700, 145,  1.2,  28,  4],
  [875,  40,  2.4, -38,  5],
  [975, 195,  1.5,  52,  5],
  [1110, 70,  2.0, -18,  5],
  [1285,145,  1.6,  32,  5],
  [1405, 55,  1.2, -48,  4],
  // Área central
  [35,  425,  2.3,  10,  5],
  [215, 370,  1.5, -38,  5],
  [365, 510,  1.8,  25,  5],
  [615, 460,  1.0,  42,  4],
  [885, 385,  1.1, -30,  4],
  [1065,445,  1.9,  16,  5],
  [1215,375,  1.4, -55,  5],
  [1385,495,  2.2,  35,  5],
  // Área inferior
  [85,  680,  1.7, -14,  5],
  [265, 815,  2.5,  20,  5],
  [390, 715,  1.2, -60,  4],
  [610, 835,  2.0,   9,  5],
  [855, 755,  1.5, -24,  5],
  [1105,725,  1.8,  45,  5],
  [1310,835,  2.2, -10,  5],
  [1415,685,  1.3,  55,  4],
]

// Sombras duplas para o efeito de relevo (luz vindo do canto superior-esquerdo)
const EMBOSS = [
  "drop-shadow(-1.5px -1.5px 1.5px rgba(255,255,255,0.65))",
  "drop-shadow(2px 2px 2.5px rgba(160,110,130,0.15))",
].join(" ")

const FILL   = "rgba(150,95,125,0.052)"
const P5     = "M0,0 Q5,-8 0,-17 Q-5,-8 0,0"   // pétala 5-pétalas
const P4     = "M0,0 Q4,-7 0,-14 Q-4,-7 0,0"   // pétala 4-pétalas

function FlowerPetals({ type }: { type: 5 | 4 }) {
  if (type === 5) {
    return (
      <>
        {[0, 72, 144, 216, 288].map(deg => (
          <path key={deg} d={P5} transform={`rotate(${deg})`} />
        ))}
        <circle r="3.2" />
      </>
    )
  }
  return (
    <>
      {[0, 90, 180, 270].map(deg => (
        <path key={deg} d={P4} transform={`rotate(${deg})`} />
      ))}
      <circle r="2.4" />
    </>
  )
}

function FlowerBackground() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none select-none absolute inset-0 w-full h-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {FLOWERS.map(([x, y, s, r, t], i) => (
        <g
          key={i}
          transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}
          fill={FILL}
          style={{ filter: EMBOSS }}
        >
          <FlowerPetals type={t} />
        </g>
      ))}
    </svg>
  )
}

export default function LandingPage() {
  const router   = useRouter()
  const [showPin, setShowPin] = useState(false)
  const [pin,     setPin]     = useState("")
  const [loading, setLoading] = useState(false)
  const pinRef   = useRef<HTMLInputElement>(null)

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pin.length !== 6) { toast.error("O PIN deve ter 6 dígitos"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      })
      if (!res.ok) { toast.error("PIN inválido. Verifique com seu produtor."); return }
      const { eventId } = await res.json()
      sessionStorage.setItem("clientPin",    pin)
      sessionStorage.setItem("clientEventId", eventId)
      router.push("/meu-evento")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ background: "linear-gradient(145deg,#fdf0f5 0%,#f5eeff 42%,#fce8f3 70%,#ede3f8 100%)" }}
    >
      {/* ── Fundo: flores em relevo ── */}
      <FlowerBackground />

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: "linear-gradient(135deg,#e07898,#8452a9)" }}
          >
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-serif text-lg text-lilac-800 tracking-wide">Wedding Manager</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm text-lilac-600 hover:text-lilac-800 hover:bg-white/40 transition-all"
          >
            <LogIn size={13} />
            Produtor
          </button>
          <button
            onClick={() => setShowPin(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm text-rose-500 hover:text-rose-700 hover:bg-rose-50/60 transition-all"
          >
            <Heart size={13} />
            Sou noivo(a)
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-4 pb-16">

        {/* Pílula */}
        <div
          className="mb-7 inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-sm"
          style={{
            background: "rgba(255,255,255,0.58)",
            border: "1px solid rgba(194,96,126,0.20)",
            boxShadow: "0 2px 8px rgba(140,82,169,0.08)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          <span className="text-xs font-medium text-rose-600 tracking-widest uppercase">
            Plataforma de Casamentos
          </span>
        </div>

        {/* Título */}
        <h1
          className="font-serif text-center leading-[1.15] mb-5 max-w-2xl"
          style={{ fontSize: "clamp(2rem,5vw,3.5rem)", color: "#5c3778" }}
        >
          Cada detalhe do seu{" "}
          <span className="relative inline-block whitespace-nowrap">
            <span className="relative z-10">grande dia</span>
            <span
              aria-hidden
              style={{
                position: "absolute", left: "-4px", right: "-4px", bottom: "6px",
                height: "36%",
                background: "linear-gradient(90deg,rgba(224,120,152,0.28),rgba(180,140,220,0.28))",
                borderRadius: "4px",
                transform: "rotate(-0.8deg)",
              }}
            />
          </span>
          , organizado
        </h1>

        <p className="text-center max-w-lg mb-12 leading-relaxed text-lilac-500" style={{ fontSize: "1.05rem" }}>
          Do briefing ao checklist final — uma plataforma completa para produtores e casais
          acompanharem cada etapa juntos.
        </p>

        {/* ── Cards de acesso ── */}
        <div className="w-full max-w-2xl grid md:grid-cols-2 gap-6">

          {/* Card Produtor */}
          <div className="glass-card-landing p-8 flex flex-col">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
              style={{
                background: "linear-gradient(135deg,#9b6bc5,#5c3778)",
                boxShadow: "0 8px 24px rgba(92,55,120,0.28)",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <h2 className="font-serif text-2xl text-lilac-800 mb-2">Sou Produtor</h2>
            <p className="text-sm text-lilac-500 leading-relaxed mb-7 flex-1">
              Gerencie eventos, envie propostas, registre reuniões e controle o checklist completo de cada casamento.
            </p>

            <div className="glass-divider mb-6" />

            <button
              onClick={() => router.push("/login")}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-medium"
            >
              Entrar no painel
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Card Cliente */}
          <div className={`${showPin ? "glass-card-landing-active" : "glass-card-landing"} p-8 flex flex-col`}>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
              style={{
                background: "linear-gradient(135deg,#e07898,#a04d67)",
                boxShadow: "0 8px 24px rgba(194,96,126,0.28)",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>

            <h2 className="font-serif text-2xl text-lilac-800 mb-2">Sou Cliente</h2>
            <p className="text-sm text-lilac-500 leading-relaxed mb-7 flex-1">
              Acompanhe seu casamento, preencha estimativas e visualize a proposta preparada especialmente para vocês.
            </p>

            <div className="glass-divider mb-6" />

            {!showPin ? (
              <button
                onClick={() => setShowPin(true)}
                className="btn-rose w-full flex items-center justify-center gap-2 py-3 text-sm font-medium"
              >
                Acessar meu evento
                <ArrowRight size={15} />
              </button>
            ) : (
              <form onSubmit={handlePinSubmit} className="space-y-3">
                <label className="text-xs font-semibold text-lilac-500 uppercase tracking-widest block mb-1">
                  PIN do evento
                </label>

                {/* Dígitos visuais — clicáveis para focar o input */}
                <div
                  className="flex gap-2 justify-center cursor-text"
                  onClick={() => pinRef.current?.focus()}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-10 h-12 flex items-center justify-center text-xl font-mono rounded-xl transition-all"
                      style={{
                        background: pin[i] ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.38)",
                        border: pin[i]
                          ? "1.5px solid rgba(194,96,126,0.52)"
                          : "1.5px solid rgba(180,140,220,0.28)",
                        color: "#3a2540",
                        boxShadow: pin[i] ? "0 2px 8px rgba(194,96,126,0.14)" : "none",
                      }}
                    >
                      {pin[i] ? "•" : ""}
                    </div>
                  ))}
                </div>

                {/* Input real — visível mas transparente, posicionado abaixo dos dígitos */}
                <input
                  ref={pinRef}
                  autoFocus
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="Digite o PIN"
                  className="w-full text-center rounded-xl px-3 py-2 text-sm tracking-widest outline-none"
                  style={{
                    background: "rgba(255,255,255,0.38)",
                    border: "1.5px solid rgba(180,140,220,0.28)",
                    color: "#3a2540",
                  }}
                  aria-label="PIN do evento"
                />

                <p className="text-xs text-center text-lilac-400">
                  Fornecido pelo seu produtor de eventos
                </p>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setShowPin(false); setPin("") }}
                    className="flex-1 py-2.5 text-sm text-lilac-400 hover:text-lilac-600 rounded-2xl transition-colors"
                    style={{ background: "rgba(255,255,255,0.30)" }}
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || pin.length !== 6}
                    className="flex-1 btn-rose py-2.5 text-sm"
                  >
                    {loading ? "Verificando..." : "Acessar"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Feature cards */}
        <div className="w-full max-w-2xl mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              ),
              title: "Gestão de Eventos",
              desc: "Crie e organize múltiplos casamentos com timeline de progresso em tempo real",
              color: "#8452a9",
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                </svg>
              ),
              title: "Proposta Digital",
              desc: "Envie sua proposta com link rastreável e saiba exatamente quando o cliente visualizou",
              color: "#c2607e",
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              ),
              title: "Checklist Completo",
              desc: "Itens por local, fornecedor e status — controle total de cada detalhe do evento",
              color: "#6e4190",
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              ),
              title: "Portal do Casal",
              desc: "Acesso exclusivo por PIN — os noivos acompanham estimativas e proposta em tempo real",
              color: "#e07898",
            },
          ].map(f => (
            <div
              key={f.title}
              className="glass-card-landing p-4 flex flex-col gap-2.5"
              style={{ borderRadius: "16px" }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${f.color}18`, color: f.color }}
              >
                {f.icon}
              </div>
              <p className="text-xs font-semibold text-lilac-700 leading-tight">{f.title}</p>
              <p className="text-[11px] text-lilac-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 text-center pb-5">
        <p className="text-xs text-lilac-300 tracking-wide">
          © {new Date().getFullYear()} Wedding Manager · Feito com cuidado
        </p>
      </footer>
    </div>
  )
}

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EventCard } from "@/components/events/EventCard"

export default async function DashboardPage() {
  const session = await auth()

  const events = await prisma.event.findMany({
    where: { producerId: session!.user!.id },
    include: {
      estimate: { select: { guestCount: true } },
      proposal: { select: { viewedByClient: true, viewedAt: true } },
      _count: { select: { checklistItems: true } },
    },
    orderBy: { weddingDate: "asc" },
  })

  const stats = {
    total: events.length,
    active: events.filter(e => e.status === "ACTIVE" || e.status === "IN_PROGRESS").length,
    proposalViewed: events.filter(e => e.proposal?.viewedByClient).length,
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-lilac-800">Olá, {session?.user?.name} 👋</h1>
        <p className="text-lilac-500 mt-1">Gerencie todos os seus eventos de casamento</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-semibold text-lilac-700">{stats.total}</p>
          <p className="text-sm text-lilac-400">Total de eventos</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-semibold text-rose-600">{stats.active}</p>
          <p className="text-sm text-lilac-400">Em andamento</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-semibold text-green-600">{stats.proposalViewed}</p>
          <p className="text-sm text-lilac-400">Propostas visualizadas</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-lilac-800">Eventos</h2>
        <a href="/eventos/novo" className="btn-primary text-sm px-4 py-2 rounded-full">
          + Novo evento
        </a>
      </div>

      {events.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-lilac-400">Nenhum evento cadastrado ainda.</p>
          <a href="/eventos/novo" className="btn-primary inline-block mt-4 px-6 py-2 rounded-full">
            Criar primeiro evento
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}

interface TimelineStep {
  id: number
  label: string
  description: string
  status: "completed" | "current" | "pending"
}

interface EventTimelineProps {
  currentStage: number
  meeting?: any
  proposal?: any
}

export function EventTimeline({ currentStage, meeting, proposal }: EventTimelineProps) {
  const steps: TimelineStep[] = [
    {
      id: 0,
      label: "Evento criado",
      description: "Informações básicas registradas",
      status: currentStage >= 0 ? "completed" : "pending",
    },
    {
      id: 1,
      label: "Estimativas",
      description: "Cliente preencheu estimativas",
      status: currentStage > 1 ? "completed" : currentStage === 1 ? "current" : "pending",
    },
    {
      id: 2,
      label: "Reunião inicial",
      description: meeting?.status === "COMPLETED" ? "Reunião realizada" : "Aguardando reunião",
      status: currentStage > 2 ? "completed" : currentStage === 2 ? "current" : "pending",
    },
    {
      id: 3,
      label: "Proposta",
      description: proposal?.viewedByClient ? "Visualizada pelo cliente" : "Enviada ao cliente",
      status: currentStage > 3 ? "completed" : currentStage === 3 ? "current" : "pending",
    },
    {
      id: 4,
      label: "Checklist",
      description: "Itens e fornecedores",
      status: currentStage >= 4 ? "current" : "pending",
    },
  ]

  return (
    <div className="relative">
      <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-lilac-200" />

      <div className="space-y-6">
        {steps.map((step) => (
          <div key={step.id} className="relative flex items-start gap-4 pl-12">
            <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
              step.status === "completed"
                ? "bg-lilac-600 border-lilac-600 text-white"
                : step.status === "current"
                ? "bg-white border-rose-400 text-rose-500 shadow-sm"
                : "bg-white border-lilac-200 text-lilac-300"
            }`}>
              {step.status === "completed" ? "✓" : step.id + 1}
            </div>

            <div className={`pb-2 ${step.status === "pending" ? "opacity-50" : ""}`}>
              <p className={`font-medium ${step.status === "current" ? "text-rose-600" : "text-lilac-800"}`}>
                {step.label}
              </p>
              <p className="text-sm text-lilac-500">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

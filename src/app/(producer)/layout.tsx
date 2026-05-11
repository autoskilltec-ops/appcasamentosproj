import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"

export default async function ProducerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="flex min-h-screen page-bg">
      <Sidebar producerName={session.user.name || "Produtor"} />
      <main className="flex-1 md:ml-64 overflow-y-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}

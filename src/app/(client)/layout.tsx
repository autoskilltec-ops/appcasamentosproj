export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen page-bg">
      {children}
    </div>
  )
}

export default function DashboardLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto animate-pulse">
      <div className="mb-8">
        <div className="h-9 w-72 bg-lilac-100 rounded-xl mb-2" />
        <div className="h-4 w-52 bg-lilac-50 rounded" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[0, 1, 2].map(i => (
          <div key={i} className="glass-card p-4 text-center">
            <div className="h-8 w-12 bg-lilac-100 rounded mx-auto mb-1" />
            <div className="h-3 w-28 bg-lilac-50 rounded mx-auto" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-20 bg-lilac-100 rounded" />
        <div className="h-9 w-36 bg-lilac-100 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="h-6 w-40 bg-lilac-100 rounded" />
              <div className="h-5 w-20 bg-lilac-50 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-lilac-50 rounded" />
              <div className="h-4 w-28 bg-lilac-50 rounded" />
              <div className="h-4 w-24 bg-lilac-50 rounded" />
            </div>
            <div className="mt-3 pt-3 border-t border-lilac-100">
              <div className="h-3 w-36 bg-lilac-50 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

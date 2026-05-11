export default function EventDetailLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto animate-pulse">
      <div className="h-4 w-36 bg-lilac-100 rounded mb-6" />

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="h-9 w-64 bg-lilac-100 rounded-xl mb-2" />
          <div className="flex items-center gap-4">
            <div className="h-4 w-28 bg-lilac-50 rounded" />
            <div className="h-4 w-32 bg-lilac-50 rounded" />
            <div className="h-4 w-20 bg-lilac-50 rounded" />
          </div>
        </div>
        <div className="h-6 w-24 bg-lilac-100 rounded-full" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 glass-card p-6">
          <div className="h-5 w-24 bg-lilac-100 rounded mb-6" />
          <div className="space-y-5">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-lilac-100 shrink-0" />
                <div className="h-4 w-20 bg-lilac-50 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 space-y-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="glass-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-5 w-44 bg-lilac-100 rounded mb-1.5" />
                  <div className="h-3 w-56 bg-lilac-50 rounded" />
                </div>
                <div className="h-4 w-24 bg-lilac-50 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

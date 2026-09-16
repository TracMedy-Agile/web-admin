function SkeletonBlock({ className }: { className: string }) {
  return <div className={["animate-pulse rounded-[8px] bg-admin-disabled/70", className].join(" ")} />;
}

function SkeletonMetricCards({ count = 4 }: { count?: number }) {
  return (
    <section className="mt-7 grid gap-4 lg:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <article key={index} className="admin-panel-shadow rounded-[8px] border border-admin-border bg-white px-6 py-6">
          <SkeletonBlock className="h-12 w-12 rounded-[10px]" />
          <div className="mt-4 flex items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="h-3 w-28" />
              <SkeletonBlock className="mt-3 h-7 w-20" />
            </div>
            <SkeletonBlock className="h-7 w-16 rounded-full" />
          </div>
        </article>
      ))}
    </section>
  );
}

function SkeletonTable({ columns = 6, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <section className="overflow-hidden rounded-[10px] bg-white">
      <div className="flex flex-col gap-4 px-4 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid gap-4 md:grid-cols-[326px_120px_120px_150px]">
          <SkeletonBlock className="h-9 w-full" />
          <SkeletonBlock className="h-9 w-full" />
          <SkeletonBlock className="h-9 w-full" />
          <SkeletonBlock className="h-9 w-full" />
        </div>
        <SkeletonBlock className="h-9 w-24" />
      </div>

      <div className="overflow-x-auto px-4">
        <div className="min-w-[980px]">
          <div className="grid min-h-[72px] items-center gap-5 bg-admin-table-head px-6" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }, (_, index) => <SkeletonBlock key={index} className="h-3 w-24" />)}
          </div>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <div key={rowIndex} className="grid min-h-[78px] items-center gap-5 border-b border-admin-border/70 px-6 last:border-b-0" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {Array.from({ length: columns }, (_, columnIndex) => <SkeletonBlock key={columnIndex} className={columnIndex === 1 ? "h-5 w-36" : "h-4 w-24"} />)}
            </div>
          ))}
        </div>
      </div>

      <footer className="flex min-h-[64px] items-center justify-between border-t border-admin-border px-4">
        <SkeletonBlock className="h-4 w-36" />
        <div className="flex items-center gap-3">
          {Array.from({ length: 5 }, (_, index) => <SkeletonBlock key={index} className="h-8 w-8" />)}
        </div>
      </footer>
    </section>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <main className="px-6 py-7 lg:px-8" aria-label="Loading dashboard">
      <section className="admin-panel-shadow rounded-[10px] border border-admin-border bg-white px-6 py-8">
        <SkeletonBlock className="h-4 w-36" />
        <SkeletonBlock className="mt-4 h-9 w-48" />
        <SkeletonBlock className="mt-5 h-4 w-full max-w-2xl" />
        <SkeletonBlock className="mt-3 h-4 w-full max-w-xl" />
      </section>
    </main>
  );
}

export function AdminUsersSkeleton() {
  return (
    <main className="px-6 py-7 lg:px-8" aria-label="Loading users">
      <div className="flex items-start justify-between gap-6">
        <div>
          <SkeletonBlock className="h-8 w-28" />
          <SkeletonBlock className="mt-3 h-5 w-52" />
        </div>
        <SkeletonBlock className="h-12 w-28 rounded-[10px]" />
      </div>
      <SkeletonMetricCards />
      <section className="admin-panel-shadow mt-8 rounded-[10px] border border-admin-border bg-white px-6 py-8">
        <SkeletonBlock className="h-4 w-44" />
        <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-center">
          <SkeletonBlock className="h-[118px] w-[118px] rounded-full" />
          <div className="grid flex-1 gap-8 md:grid-cols-2">
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-12 w-full" />
          </div>
        </div>
      </section>
      <div className="mt-8">
        <SkeletonTable columns={7} />
      </div>
    </main>
  );
}

export function AdminFacilitiesSkeleton() {
  return (
    <main className="px-6 py-7 lg:px-8" aria-label="Loading facilities">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <SkeletonBlock className="h-8 w-36" />
          <SkeletonBlock className="mt-3 h-5 w-64" />
        </div>
        <SkeletonBlock className="h-12 w-40 rounded-[10px]" />
      </div>
      <section className="mt-7 grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <article key={index} className="admin-panel-shadow grid min-h-[104px] place-items-center rounded-[8px] border border-admin-border bg-white px-5 py-5 text-center">
            <div>
              <SkeletonBlock className="mx-auto h-8 w-20" />
              <SkeletonBlock className="mx-auto mt-3 h-3 w-28" />
            </div>
          </article>
        ))}
      </section>
      <div className="mt-8">
        <SkeletonTable columns={6} />
      </div>
    </main>
  );
}

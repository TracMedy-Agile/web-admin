export default function DashboardPage() {
  return (
    <main className="px-6 py-7 lg:px-8">
      <section className="admin-panel-shadow rounded-[10px] border border-admin-border bg-white px-6 py-8">
        <p className="text-[15px] font-semibold uppercase tracking-normal text-admin-muted">Tracmedy Admin</p>
        <h2 className="mt-3 text-[32px] font-bold tracking-normal text-admin-ink">Dashboard</h2>
        <p className="mt-4 max-w-2xl text-[16px] leading-7 text-admin-muted">
          Authentication is active. The dashboard modules are waiting on the next admin design phase.
        </p>
      </section>
    </main>
  );
}

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="max-w-xl text-center">
        <div
          aria-hidden
          className="mx-auto mb-8 h-14 w-14 rounded-2xl"
          style={{
            background: 'var(--cozy-grad-btn)',
            boxShadow: 'var(--cozy-shadow-md)',
          }}
        />
        <h1 className="font-display text-4xl font-bold tracking-[-0.02em] text-balance">
          Home Share <span style={{ color: 'var(--terracotta-600)' }}>v2</span>
        </h1>
        <p className="mt-3 text-[15px] leading-[1.55]" style={{ color: 'var(--cozy-fg-secondary)' }}>
          Setup OK. Próximas fases: auth, app shell, dashboard.
        </p>
        <div
          className="mt-8 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-display text-[11px] font-bold uppercase tracking-[0.08em]"
          style={{
            borderColor: 'var(--cozy-border-hair)',
            color: 'var(--cozy-fg-label)',
            background: 'var(--cozy-surface-raised)',
          }}
        >
          Cozy Cottage DS v2
        </div>
      </section>
    </main>
  )
}

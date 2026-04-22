import Link from 'next/link'
import { Sparkles } from 'lucide-react'

/** Shown while GroupProvider fetches the user's groups on mount. */
export function DashboardLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
      <div className="space-y-6 lg:col-span-8">
        <div
          className="hidden h-44 animate-pulse rounded-2xl md:h-48 lg:block"
          style={{ background: 'oklch(0.90 0.04 78 / 0.40)' }}
        />
        <div
          className="h-[520px] animate-pulse rounded-2xl"
          style={{ background: 'oklch(0.95 0.03 78 / 0.65)' }}
        />
      </div>
      <aside className="hidden space-y-6 lg:col-span-4 lg:block">
        <SkeletonCard heightClass="h-[200px]" />
        <SkeletonCard heightClass="h-[260px]" />
        <SkeletonCard heightClass="h-[72px]" />
      </aside>
    </div>
  )
}

function SkeletonCard({ heightClass }: { heightClass: string }) {
  return (
    <div
      className={`${heightClass} animate-pulse rounded-2xl`}
      style={{ background: 'oklch(0.95 0.03 78 / 0.65)' }}
    />
  )
}

/**
 * Shown when the group context loaded but the user has no groups AND
 * the onboarding redirect has not kicked in yet (e.g. unexpected 404
 * on onboarding). Keeps the user moving rather than stranded.
 */
export function DashboardEmptyState() {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-[420px] flex-col items-center justify-center text-center">
      <div
        className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: 'var(--cozy-grad-btn)',
          boxShadow: 'var(--cozy-shadow-btn)',
        }}
      >
        <Sparkles className="h-6 w-6 text-white" aria-hidden />
      </div>
      <h1
        className="font-display text-[26px] font-bold leading-tight text-balance"
        style={{ color: 'var(--cozy-fg-primary)' }}
      >
        Você ainda não está em nenhum grupo.
      </h1>
      <p
        className="mt-2 text-[14px] leading-[1.5]"
        style={{ color: 'var(--cozy-fg-secondary)' }}
      >
        Crie seu primeiro grupo pra começar a dividir despesas.
      </p>
      <Link
        href="/onboarding"
        className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-display text-[13.5px] font-bold text-white transition-transform active:scale-[0.98]"
        style={{
          background: 'var(--cozy-grad-btn)',
          boxShadow: 'var(--cozy-shadow-btn)',
        }}
      >
        Criar meu grupo
      </Link>
    </section>
  )
}

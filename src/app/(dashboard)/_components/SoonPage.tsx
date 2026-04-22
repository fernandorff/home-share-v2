import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'

interface SoonPageProps {
  title: string
  description: string
}

/** Shared "coming soon" placeholder for nav destinations not yet implemented. */
export function SoonPage({ title, description }: SoonPageProps) {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-[480px] flex-col items-center justify-center text-center">
      <div
        className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: 'oklch(0.90 0.055 78 / 0.35)',
          border: '1px solid var(--cozy-border-hair)',
        }}
      >
        <Clock className="h-6 w-6" style={{ color: 'var(--amber-700)' }} aria-hidden />
      </div>
      <h1
        className="font-display text-[26px] font-bold leading-tight text-balance"
        style={{ color: 'var(--cozy-fg-primary)' }}
      >
        {title}
      </h1>
      <p
        className="mt-2 max-w-[46ch] text-[14px] leading-[1.5]"
        style={{ color: 'var(--cozy-fg-secondary)' }}
      >
        {description}
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-display text-[13.5px] font-bold transition-colors"
        style={{
          background: 'transparent',
          color: 'var(--terracotta-700)',
          border: '1.5px solid var(--terracotta-600)',
        }}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden strokeWidth={2.2} />
        Voltar para o painel
      </Link>
    </section>
  )
}

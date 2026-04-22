import { Scale, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import type { BalanceSummary } from './dashboardMocks'

interface BalanceCardProps {
  summary: BalanceSummary
}

/** "Resumo do Mês" card showing who owes whom and a settle-up CTA. */
export function BalanceCard({ summary }: BalanceCardProps) {
  return (
    <article
      className="relative overflow-hidden rounded-2xl border-2 p-6"
      style={{
        background: 'var(--cozy-grad-card)',
        borderColor: 'var(--cozy-border-hair)',
        boxShadow: 'var(--cozy-shadow-card, var(--cozy-shadow-xs))',
      }}
    >
      <Wallet
        aria-hidden
        className="absolute -top-4 -right-3 h-28 w-28 rotate-12 opacity-[0.06]"
        style={{ color: 'var(--brown-900)' }}
      />

      <header className="relative z-10 flex items-center gap-2">
        <Scale className="h-4 w-4" style={{ color: 'var(--cozy-fg-label)' }} aria-hidden />
        <h3
          className="font-display text-[12px] font-bold uppercase tracking-[0.08em]"
          style={{ color: 'var(--cozy-fg-label)' }}
        >
          Resumo de {summary.period}
        </h3>
      </header>

      <div
        className="relative z-10 mt-4 rounded-xl border p-4"
        style={{
          background: 'rgba(255, 255, 255, 0.6)',
          borderColor: 'var(--cozy-border-subtle)',
        }}
      >
        <p className="text-[13px]" style={{ color: 'var(--cozy-fg-secondary)' }}>
          {summary.debtorName} deve
        </p>
        <p
          className="font-mono text-[26px] font-bold leading-tight"
          style={{ color: 'var(--terracotta-700)' }}
        >
          R$ {formatCurrency(summary.amountCents / 100)}
        </p>
        <p className="mt-0.5 text-[13px] font-semibold" style={{ color: 'var(--cozy-fg-primary)' }}>
          para {summary.creditorName}
        </p>
      </div>

      <button
        type="button"
        className="relative z-10 mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-display font-bold text-white transition-transform active:scale-[0.98]"
        style={{
          background: 'linear-gradient(180deg, var(--amber-600) 0%, var(--amber-700) 100%)',
          boxShadow: 'var(--cozy-shadow-btn)',
        }}
      >
        <Wallet className="h-4 w-4" aria-hidden />
        Acertar contas
      </button>
    </article>
  )
}

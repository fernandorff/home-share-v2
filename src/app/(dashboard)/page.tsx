import { Plus, MoreVertical } from 'lucide-react'
import {
  DASHBOARD_BALANCE,
  DASHBOARD_EXPENSES,
  DASHBOARD_HEADER,
  DASHBOARD_QUOTE,
  DASHBOARD_RESIDENTS,
} from './_components/dashboardMocks'
import { HeroBanner } from './_components/HeroBanner'
import { ExpensesCard } from './_components/ExpensesCard'
import { BalanceCard } from './_components/BalanceCard'
import { MembersCard } from './_components/MembersCard'
import { QuoteCard } from './_components/QuoteCard'
import { AppFooter } from './_components/AppFooter'

export default function DashboardPage() {
  return (
    <>
      <MobileActionRow />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="space-y-6 lg:col-span-8">
          <div className="hidden lg:block">
            <HeroBanner
              greeting={DASHBOARD_HEADER.greeting}
              subGreeting={DASHBOARD_HEADER.subGreeting}
            />
          </div>
          <ExpensesCard expenses={DASHBOARD_EXPENSES} residents={DASHBOARD_RESIDENTS} />
        </div>

        <aside className="hidden space-y-6 lg:col-span-4 lg:block">
          <BalanceCard summary={DASHBOARD_BALANCE} />
          <MembersCard residents={DASHBOARD_RESIDENTS} />
          <QuoteCard text={DASHBOARD_QUOTE} />
        </aside>
      </div>

      <AppFooter />
    </>
  )
}

function MobileActionRow() {
  return (
    <div className="mb-5 flex gap-3 md:hidden">
      <button
        type="button"
        className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-6 py-3 font-display font-bold transition-transform active:scale-95"
        style={{
          borderColor: 'var(--terracotta-600)',
          color: 'var(--terracotta-700)',
          background: 'rgba(255, 255, 255, 0.5)',
        }}
      >
        <Plus className="h-5 w-5" aria-hidden strokeWidth={2.4} />
        Nova despesa
      </button>
      <button
        type="button"
        aria-label="Mais opções"
        className="flex h-12 w-12 items-center justify-center rounded-xl border transition-transform active:scale-95"
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          borderColor: 'var(--cozy-border-hair)',
          boxShadow: 'var(--cozy-shadow-xs)',
          color: 'var(--terracotta-700)',
        }}
      >
        <MoreVertical className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}

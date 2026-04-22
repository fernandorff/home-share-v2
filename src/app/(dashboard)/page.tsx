"use client"

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, Plus } from 'lucide-react'
import { useGroupContext } from '@/contexts/group-context'
import { useExpenses } from '@/features/grupos/hooks/useExpenses'
import { useBalances } from '@/features/grupos/hooks/useBalances'
import { HeroBanner } from './_components/HeroBanner'
import { ExpensesCard } from './_components/ExpensesCard'
import { BalanceCard } from './_components/BalanceCard'
import { MembersCard } from './_components/MembersCard'
import { QuoteCard } from './_components/QuoteCard'
import { AppFooter } from './_components/AppFooter'
import { DASHBOARD_HEADER, DASHBOARD_QUOTE } from './_components/dashboardMocks'
import { toBalanceSummary, toResidents, toUiExpenses } from './_components/dashboardAdapters'
import { DashboardLoadingSkeleton, DashboardEmptyState } from './_components/DashboardStates'

export default function DashboardPage() {
  const router = useRouter()
  const { activeGroup, activeGroupPublicId, needsOnboarding, isLoadingGroups } = useGroupContext()
  const { expenses: apiExpenses, fetchExpenses } = useExpenses(activeGroupPublicId)
  const { settlements, fetchBalances } = useBalances(activeGroupPublicId)

  useEffect(() => {
    if (needsOnboarding) router.replace('/onboarding')
  }, [needsOnboarding, router])

  useEffect(() => {
    if (!activeGroupPublicId) return
    fetchExpenses({ page: 1, pageSize: 50 })
    fetchBalances()
  }, [activeGroupPublicId, fetchExpenses, fetchBalances])

  const residents = useMemo(
    () => (activeGroup ? toResidents(activeGroup.members) : []),
    [activeGroup],
  )
  const uiExpenses = useMemo(
    () => toUiExpenses(apiExpenses, residents),
    [apiExpenses, residents],
  )
  const balanceSummary = useMemo(() => toBalanceSummary(settlements), [settlements])

  if (isLoadingGroups) return <DashboardLoadingSkeleton />
  if (needsOnboarding) return null
  if (!activeGroup) return <DashboardEmptyState />

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
          <ExpensesCard expenses={uiExpenses} residents={residents} />
        </div>

        <aside className="hidden space-y-6 lg:col-span-4 lg:block">
          {balanceSummary
            ? <BalanceCard summary={balanceSummary} />
            : <BalanceSettled />}
          <MembersCard residents={residents} />
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

function BalanceSettled() {
  return (
    <article
      className="rounded-2xl border-2 p-6 text-center"
      style={{
        background: 'var(--cozy-grad-card)',
        borderColor: 'var(--cozy-border-hair)',
      }}
    >
      <p
        className="font-display text-[12px] font-bold uppercase tracking-[0.08em]"
        style={{ color: 'var(--cozy-fg-label)' }}
      >
        Resumo do mês
      </p>
      <p
        className="mt-3 font-display text-[20px] font-bold leading-tight"
        style={{ color: 'var(--sage-600)' }}
      >
        Tudo quitado.
      </p>
      <p className="mt-1 text-[13px]" style={{ color: 'var(--cozy-fg-secondary)' }}>
        Nenhuma dívida pendente entre os moradores.
      </p>
    </article>
  )
}

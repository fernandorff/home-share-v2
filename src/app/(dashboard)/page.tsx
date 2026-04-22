"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Download, Plus } from 'lucide-react'
import { useGroupContext } from '@/contexts/group-context'
import { useExpenses } from '@/features/grupos/hooks/useExpenses'
import { useBalances } from '@/features/grupos/hooks/useBalances'
import type { MenuOption } from '@/components/ui/OptionsMenu'
import { OptionsMenu } from '@/components/ui/OptionsMenu'
import { HeroBanner } from './_components/HeroBanner'
import { ExpensesCard } from './_components/ExpensesCard'
import { BalanceCard } from './_components/BalanceCard'
import { MembersCard } from './_components/MembersCard'
import { QuoteCard } from './_components/QuoteCard'
import { AppFooter } from './_components/AppFooter'
import { ExpenseFormModal, type ExpenseInput } from './_components/ExpenseFormModal'
import { SettleUpModal } from './_components/SettleUpModal'
import { DASHBOARD_HEADER, DASHBOARD_QUOTE } from './_components/dashboardMocks'
import { toBalanceSummary, toResidents, toUiExpenses } from './_components/dashboardAdapters'
import { DashboardLoadingSkeleton, DashboardEmptyState } from './_components/DashboardStates'

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoadingSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { activeGroup, activeGroupPublicId, needsOnboarding, isLoadingGroups } = useGroupContext()
  const {
    expenses: apiExpenses,
    fetchExpenses,
    createExpense,
    loading: expensesLoading,
    error: expensesError,
    clearError,
  } = useExpenses(activeGroupPublicId)
  const { settlements, fetchBalances } = useBalances(activeGroupPublicId)

  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [settleUpModalOpen, setSettleUpModalOpen] = useState(false)

  useEffect(() => {
    if (needsOnboarding) router.replace('/onboarding')
  }, [needsOnboarding, router])

  useEffect(() => {
    if (!activeGroupPublicId) return
    fetchExpenses({ page: 1, pageSize: 50 })
    fetchBalances()
  }, [activeGroupPublicId, fetchExpenses, fetchBalances])

  useEffect(() => {
    if (searchParams.get('nova') !== '1') return
    setExpenseModalOpen(true)
    router.replace('/', { scroll: false })
  }, [searchParams, router])

  const residents = useMemo(
    () => (activeGroup ? toResidents(activeGroup.members) : []),
    [activeGroup],
  )
  const uiExpenses = useMemo(
    () => toUiExpenses(apiExpenses, residents),
    [apiExpenses, residents],
  )
  const balanceSummary = useMemo(() => toBalanceSummary(settlements), [settlements])

  const activeMembers = useMemo(
    () => (activeGroup?.members ?? []).map((m) => ({ id: m.user.id, name: m.user.name })),
    [activeGroup],
  )

  const handleOpenExpenseModal = useCallback(() => {
    clearError()
    setExpenseModalOpen(true)
  }, [clearError])

  const handleCloseExpenseModal = useCallback(() => {
    setExpenseModalOpen(false)
  }, [])

  const handleSubmitExpense = useCallback(
    async (input: ExpenseInput): Promise<boolean> => {
      const created = await createExpense(input)
      if (!created) return false
      fetchBalances()
      return true
    },
    [createExpense, fetchBalances],
  )

  const handleExportCSV = useCallback(async () => {
    if (!activeGroupPublicId) return
    const response = await fetch(`/api/groups/${activeGroupPublicId}/expenses/export`)
    if (!response.ok) {
      console.error('Falha ao exportar despesas')
      return
    }
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const disposition = response.headers.get('content-disposition')
    const match = disposition?.match(/filename="([^"]+)"/)
    const filename = match?.[1] ?? 'despesas.csv'
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }, [activeGroupPublicId])

  const menuOptions = useMemo<ReadonlyArray<MenuOption>>(
    () => [{ label: 'Exportar CSV', icon: Download, onClick: handleExportCSV }],
    [handleExportCSV],
  )

  if (isLoadingGroups) return <DashboardLoadingSkeleton />
  if (needsOnboarding) return null
  if (!activeGroup) return <DashboardEmptyState />

  return (
    <>
      <MobileActionRow
        onCreateExpense={handleOpenExpenseModal}
        menuOptions={menuOptions}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="space-y-6 lg:col-span-8">
          <div className="hidden lg:block">
            <HeroBanner
              greeting={DASHBOARD_HEADER.greeting}
              subGreeting={DASHBOARD_HEADER.subGreeting}
            />
          </div>
          <ExpensesCard
            expenses={uiExpenses}
            residents={residents}
            onCreateExpense={handleOpenExpenseModal}
            menuOptions={menuOptions}
          />
        </div>

        <aside className="hidden space-y-6 lg:col-span-4 lg:block">
          {balanceSummary
            ? <BalanceCard summary={balanceSummary} onSettleUp={() => setSettleUpModalOpen(true)} />
            : <BalanceSettled />}
          <MembersCard residents={residents} />
          <QuoteCard text={DASHBOARD_QUOTE} />
        </aside>
      </div>

      <AppFooter />

      <ExpenseFormModal
        open={expenseModalOpen}
        onClose={handleCloseExpenseModal}
        members={activeMembers}
        onSubmit={handleSubmitExpense}
        loading={expensesLoading}
        error={expensesError}
      />

      <SettleUpModal
        open={settleUpModalOpen}
        onClose={() => setSettleUpModalOpen(false)}
        settlements={settlements}
      />
    </>
  )
}

interface MobileActionRowProps {
  onCreateExpense: () => void
  menuOptions: ReadonlyArray<MenuOption>
}

function MobileActionRow({ onCreateExpense, menuOptions }: MobileActionRowProps) {
  return (
    <div className="mb-5 flex gap-3 md:hidden">
      <button
        type="button"
        onClick={onCreateExpense}
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
      <OptionsMenu
        options={menuOptions}
        triggerClassName="flex h-12 w-12 items-center justify-center rounded-xl border transition-transform active:scale-95"
      />
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

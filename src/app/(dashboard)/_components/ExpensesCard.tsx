"use client"

import { useState } from 'react'
import { Cat, LayoutList, MoreVertical, Plus, Users } from 'lucide-react'
import { ExpensesTable } from './ExpensesTable'
import { ExpensesList } from './ExpensesList'
import { ExpensesByPersonView } from './ExpensesByPersonView'
import type { Expense, Resident } from './dashboardMocks'

export type ExpensesViewMode = 'table' | 'by-person'

interface ExpensesCardProps {
  expenses: ReadonlyArray<Expense>
  residents: ReadonlyArray<Resident>
  onCreateExpense?: () => void
}

/**
 * Expense panel — glass card with header, toolbar and a table on desktop or
 * a card list on mobile. Owns the view-mode client state (Tabela vs Por
 * pessoa); "Nova despesa" click is delegated to the parent via
 * onCreateExpense so the modal lives in the page.
 */
export function ExpensesCard({ expenses, residents, onCreateExpense }: ExpensesCardProps) {
  const [viewMode, setViewMode] = useState<ExpensesViewMode>('table')

  return (
    <section
      className="overflow-hidden rounded-2xl border backdrop-blur-sm"
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        borderColor: 'var(--cozy-border-hair)',
        boxShadow: 'var(--cozy-shadow-card, var(--cozy-shadow-xs))',
      }}
    >
      <Header onCreateExpense={onCreateExpense} />
      <Toolbar count={expenses.length} viewMode={viewMode} onViewModeChange={setViewMode} />

      {viewMode === 'table' ? (
        <>
          <div className="hidden md:block">
            <ExpensesTable expenses={expenses} residents={residents} />
          </div>
          <div className="md:hidden pt-3">
            <ExpensesList expenses={expenses} residents={residents} />
          </div>
        </>
      ) : (
        <ExpensesByPersonView expenses={expenses} residents={residents} />
      )}
    </section>
  )
}

interface HeaderProps {
  onCreateExpense?: () => void
}

function Header({ onCreateExpense }: HeaderProps) {
  return (
    <div
      className="flex flex-col gap-3 border-b px-6 py-5 md:flex-row md:items-center md:justify-between"
      style={{ borderColor: 'var(--cozy-border-hair)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ background: 'oklch(0.90 0.055 78 / 0.35)' }}
        >
          <Cat className="h-[18px] w-[18px]" style={{ color: 'var(--amber-700)' }} aria-hidden />
        </div>
        <h2
          className="font-display text-lg font-bold tracking-[-0.01em]"
          style={{ color: 'var(--cozy-fg-primary)' }}
        >
          Despesas Compartilhadas
        </h2>
      </div>

      {onCreateExpense && (
        <button
          type="button"
          onClick={onCreateExpense}
          className="hidden items-center gap-2 rounded-xl px-4 py-2 font-display text-[13px] font-bold text-white transition-transform active:scale-95 md:flex"
          style={{
            background: 'var(--cozy-grad-btn)',
            boxShadow: 'var(--cozy-shadow-btn)',
          }}
        >
          <Plus className="h-4 w-4" aria-hidden strokeWidth={2.4} />
          Nova despesa
        </button>
      )}
    </div>
  )
}

interface ToolbarProps {
  count: number
  viewMode: ExpensesViewMode
  onViewModeChange: (next: ExpensesViewMode) => void
}

function Toolbar({ count, viewMode, onViewModeChange }: ToolbarProps) {
  return (
    <div
      className="flex items-center justify-between border-b px-6 py-2.5"
      style={{
        background: 'oklch(0.90 0.055 78 / 0.18)',
        borderColor: 'var(--cozy-border-hair)',
      }}
    >
      <div className="flex items-center gap-4">
        <span
          className="font-display text-[13px] font-bold"
          style={{ color: 'var(--cozy-fg-label)' }}
        >
          Despesas ({count})
        </span>
        <ViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
      </div>
      <button
        type="button"
        aria-label="Mais opções"
        className="hidden rounded-md p-1 transition-colors hover:bg-[oklch(0.72_0.12_75/0.12)] md:inline-flex"
        style={{ color: 'var(--cozy-fg-muted)' }}
      >
        <MoreVertical className="h-[18px] w-[18px]" aria-hidden />
      </button>
    </div>
  )
}

interface ViewToggleProps {
  viewMode: ExpensesViewMode
  onViewModeChange: (next: ExpensesViewMode) => void
}

function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div
      className="flex rounded-lg border p-1"
      style={{
        background: 'rgba(255, 255, 255, 0.6)',
        borderColor: 'var(--cozy-border-subtle)',
      }}
    >
      <ToggleButton active={viewMode === 'table'} onClick={() => onViewModeChange('table')}>
        <LayoutList className="h-3.5 w-3.5" aria-hidden />
        Tabela
      </ToggleButton>
      <ToggleButton active={viewMode === 'by-person'} onClick={() => onViewModeChange('by-person')}>
        <Users className="h-3.5 w-3.5" aria-hidden />
        Por pessoa
      </ToggleButton>
    </div>
  )
}

interface ToggleButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function ToggleButton({ active, onClick, children }: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex items-center gap-1.5 rounded-md px-3 py-1 font-sans text-[11.5px] font-bold transition-colors"
      style={
        active
          ? { background: 'var(--terracotta-600)', color: '#fff', boxShadow: 'var(--cozy-shadow-xs)' }
          : { background: 'transparent', color: 'var(--cozy-fg-muted)' }
      }
    >
      {children}
    </button>
  )
}

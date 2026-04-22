import { formatCurrency } from '@/lib/currency'
import type { Expense, Resident } from './dashboardMocks'

interface ExpensesTableProps {
  expenses: ReadonlyArray<Expense>
  residents: ReadonlyArray<Resident>
}

const SHORT_MONTH = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

/** Desktop-only expense table — 5 columns, short date formatting, payer color dot. */
export function ExpensesTable({ expenses, residents }: ExpensesTableProps) {
  const residentsById = Object.fromEntries(residents.map((r) => [r.id, r]))
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr
            className="border-b text-[11px] uppercase tracking-[0.08em]"
            style={{
              color: 'var(--cozy-fg-muted)',
              borderColor: 'var(--cozy-border-hair)',
            }}
          >
            <th className="px-6 py-4 font-bold">Data</th>
            <th className="px-6 py-4 font-bold">Descrição</th>
            <th className="px-6 py-4 font-bold">Pago por</th>
            <th className="px-6 py-4 font-bold">Plataforma</th>
            <th className="px-6 py-4 text-right font-bold">Valor</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {expenses.map((expense) => {
            const payer = residentsById[expense.payerId]
            return (
              <tr
                key={expense.id}
                className="border-b transition-colors hover:bg-[oklch(0.85_0.08_75/0.08)]"
                style={{ borderColor: 'oklch(0.80 0.04 72 / 0.18)' }}
              >
                <td
                  className="px-6 py-4 font-mono text-[13px]"
                  style={{ color: 'var(--cozy-fg-primary)' }}
                >
                  {formatShortDate(expense.date)}
                </td>
                <td
                  className="px-6 py-4 font-sans text-[14px] font-semibold"
                  style={{ color: 'var(--cozy-fg-primary)' }}
                >
                  {expense.description}
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="h-2 w-2 rounded-full"
                      style={{ background: payer?.accent }}
                    />
                    <span
                      className="text-[13.5px]"
                      style={{ color: 'var(--cozy-fg-primary)' }}
                    >
                      {payer?.name ?? 'Desconhecido'}
                    </span>
                  </span>
                </td>
                <td
                  className="px-6 py-4 text-[13px] italic"
                  style={{ color: 'var(--cozy-fg-muted)' }}
                >
                  {expense.platform}
                </td>
                <td
                  className="px-6 py-4 text-right font-mono text-[14px] font-bold"
                  style={{ color: 'var(--terracotta-700)' }}
                >
                  R$ {formatCurrency(expense.amountCents / 100)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function formatShortDate(iso: string): string {
  const [, month, day] = iso.split('-').map(Number)
  return `${String(day).padStart(2, '0')} ${SHORT_MONTH[(month ?? 1) - 1]}`
}

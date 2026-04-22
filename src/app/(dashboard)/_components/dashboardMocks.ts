/**
 * Static mock data powering the redesigned dashboard. Real data wiring
 * (Clerk user, active group, expenses API) lands in a later phase — this
 * module keeps all literals in one place so the swap is a single edit.
 */

export type ResidentRole = 'ADMIN' | 'MEMBER' | 'GUEST'

export interface Resident {
  readonly id: string
  readonly name: string
  readonly role: ResidentRole
  /** OKLCH-friendly accent used for the avatar ring and the expense-dot chip. */
  readonly accent: string
  readonly initials: string
}

export interface Expense {
  readonly id: string
  /** ISO date (YYYY-MM-DD). */
  readonly date: string
  readonly description: string
  readonly payerId: Resident['id']
  readonly platform: string
  /** Amount in BRL cents to avoid floating-point rounding. */
  readonly amountCents: number
  readonly category: 'Casa' | 'Digital' | 'Pets' | 'Contas' | 'Lazer'
}

export interface BalanceSummary {
  readonly debtorName: string
  readonly creditorName: string
  readonly amountCents: number
  readonly period: string
}

export const DASHBOARD_RESIDENTS: ReadonlyArray<Resident> = [
  { id: 'tatiana',  name: 'Tatiana',  role: 'ADMIN',  accent: 'oklch(0.72 0.14 240)', initials: 'TA' },
  { id: 'fernando', name: 'Fernando', role: 'MEMBER', accent: 'oklch(0.72 0.14 45)',  initials: 'FE' },
  { id: 'mariana',  name: 'Mariana',  role: 'GUEST',  accent: 'oklch(0.72 0.14 155)', initials: 'MA' },
]

export const DASHBOARD_EXPENSES: ReadonlyArray<Expense> = [
  { id: 'e1', date: '2026-04-12', description: 'Compras de Supermercado',     payerId: 'tatiana',  platform: 'Pão de Açúcar',    amountCents:  45020, category: 'Casa'    },
  { id: 'e2', date: '2026-04-10', description: 'Mensalidade Internet',        payerId: 'fernando', platform: 'Vivo Fiber',        amountCents:  12000, category: 'Contas'  },
  { id: 'e3', date: '2026-04-08', description: 'Aluguel do Mês',              payerId: 'tatiana',  platform: 'QuintoAndar',       amountCents: 320000, category: 'Casa'    },
  { id: 'e4', date: '2026-04-05', description: 'Jantar Comemorativo',         payerId: 'mariana',  platform: 'Bistro do Canto',   amountCents:  28050, category: 'Lazer'   },
  { id: 'e5', date: '2026-04-02', description: 'Produtos de Limpeza',         payerId: 'fernando', platform: 'Amazon',            amountCents:   8990, category: 'Casa'    },
  { id: 'e6', date: '2026-03-30', description: 'Conta de Luz',                payerId: 'mariana',  platform: 'Enel',              amountCents:  21530, category: 'Contas'  },
  { id: 'e7', date: '2026-03-28', description: 'Streaming TV',                payerId: 'tatiana',  platform: 'Netflix',           amountCents:   5590, category: 'Digital' },
  { id: 'e8', date: '2026-03-25', description: 'Padaria',                     payerId: 'fernando', platform: 'Bella Paulista',    amountCents:   4200, category: 'Casa'    },
]

export const DASHBOARD_BALANCE: BalanceSummary = {
  debtorName:   'Fernando',
  creditorName: 'Tatiana',
  amountCents:  24500,
  period:       'Abril',
}

export const DASHBOARD_QUOTE =
  'Dividir as despesas é o primeiro passo para um lar em harmonia. Não esqueça de anexar os recibos!'

export const DASHBOARD_HEADER = {
  greeting: 'Bem-vindo ao lar.',
  subGreeting: 'Aqui está o resumo do seu grupo esse mês.',
} as const

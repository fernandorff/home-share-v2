import Link from 'next/link'
import { LayoutDashboard, Receipt, Users, Settings, Plus, type LucideIcon } from 'lucide-react'

interface BottomNavTab {
  readonly label: string
  readonly icon: LucideIcon
  readonly href: string
  readonly active?: boolean
}

const LEFT_TABS: ReadonlyArray<BottomNavTab> = [
  { label: 'Início',   icon: LayoutDashboard, href: '/',           active: true },
  { label: 'Despesas', icon: Receipt,         href: '/despesas'                 },
]

const RIGHT_TABS: ReadonlyArray<BottomNavTab> = [
  { label: 'Grupo',   icon: Users,    href: '/membros' },
  { label: 'Ajustes', icon: Settings, href: '/ajustes' },
]

/** Mobile-only tab bar — 5 slots with a centered floating primary action. */
export function BottomNav() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t px-2 pb-3 pt-2 backdrop-blur-md md:hidden"
      style={{
        background: 'var(--cozy-surface-raised)',
        borderColor: 'var(--cozy-border-hair)',
      }}
    >
      {LEFT_TABS.map((tab) => (
        <BottomNavTabLink key={tab.label} tab={tab} />
      ))}

      <div className="-mt-7">
        <Link
          href="/despesas/nova"
          aria-label="Nova despesa"
          className="flex h-12 w-12 items-center justify-center rounded-full text-white transition-transform active:scale-95"
          style={{
            background: 'var(--cozy-grad-btn)',
            border: '4px solid var(--cozy-surface-raised)',
            boxShadow: 'var(--cozy-shadow-btn)',
          }}
        >
          <Plus className="h-5 w-5" strokeWidth={2.4} aria-hidden />
        </Link>
      </div>

      {RIGHT_TABS.map((tab) => (
        <BottomNavTabLink key={tab.label} tab={tab} />
      ))}
    </nav>
  )
}

function BottomNavTabLink({ tab }: { tab: BottomNavTab }) {
  const Icon = tab.icon
  return (
    <Link
      href={tab.href}
      className="flex flex-col items-center gap-0.5 px-2 py-1"
      style={{ color: tab.active ? 'var(--terracotta-700)' : 'var(--cozy-fg-muted)' }}
      aria-current={tab.active ? 'page' : undefined}
    >
      <Icon className="h-5 w-5" strokeWidth={tab.active ? 2.4 : 2} aria-hidden />
      <span className="text-[10px] font-bold uppercase tracking-tight">{tab.label}</span>
    </Link>
  )
}

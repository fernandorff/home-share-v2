import { Home, Menu } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Como Funciona', href: '#' },
  { label: 'Preços', href: '#' },
] as const

/** Fixed top bar — parchment surface with backdrop blur, centered brand. */
export function TopNavBar() {
  return (
    <nav
      className="fixed top-0 z-50 flex w-full items-center justify-between border-b px-4 py-3 backdrop-blur-md md:px-6 md:py-4"
      style={{
        background: 'var(--cozy-surface-raised)',
        borderColor: 'var(--cozy-border-hair)',
        boxShadow: 'var(--cozy-shadow-xs)',
      }}
    >
      <div className="hidden items-center gap-6 md:flex">
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="font-sans text-sm transition-colors hover:opacity-80"
            style={{ color: 'var(--cozy-fg-secondary)' }}
          >
            {link.label}
          </a>
        ))}
      </div>

      <div
        className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 font-display text-xl font-bold tracking-[-0.01em] md:text-2xl"
        style={{ color: 'var(--terracotta-700)' }}
      >
        <Home className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2.2} aria-hidden />
        <span>Home Share</span>
      </div>

      <button
        type="button"
        aria-label="Abrir menu"
        className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[oklch(0.72_0.12_75/0.1)]"
        style={{ color: 'var(--terracotta-700)' }}
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>
    </nav>
  )
}

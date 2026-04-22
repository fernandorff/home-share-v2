import { Home } from 'lucide-react'

const FOOTER_LINKS = [
  { label: 'Política de Privacidade', href: '#' },
  { label: 'Termos de Serviço',       href: '#' },
  { label: 'Contato',                 href: '#' },
] as const

/** Cozy footer — brand left, copyright middle, legal links right. Desktop only. */
export function AppFooter() {
  return (
    <footer
      className="mt-12 hidden w-full flex-col items-center justify-between gap-4 border-t px-6 py-8 md:flex md:flex-row"
      style={{
        background: 'oklch(0.955 0.020 85)',
        borderColor: 'var(--cozy-border-hair)',
      }}
    >
      <div
        className="flex items-center gap-2 font-display text-lg font-bold"
        style={{ color: 'var(--brown-900)' }}
      >
        <Home className="h-5 w-5" style={{ color: 'var(--terracotta-700)' }} aria-hidden />
        Home Share
      </div>
      <p className="font-sans text-sm" style={{ color: 'var(--cozy-fg-muted)' }}>
        © 2026 Home Share. Feito para lares aconchegantes.
      </p>
      <div className="flex gap-6">
        {FOOTER_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="font-sans text-sm underline transition-opacity hover:opacity-70"
            style={{ color: 'var(--cozy-fg-muted)' }}
          >
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  )
}

import { Home } from 'lucide-react'
import { AuthHero } from '@/app/auth/_components/AuthHero'
import {
  AUTH_BRAND,
  AUTH_HERO_COPY_BY_VARIANT,
  type AuthVariant,
} from '@/app/auth/_components/authCopy'

interface AuthPageLayoutProps {
  variant: AuthVariant
  children: React.ReactNode
}

/**
 * Split-screen shell for sign-in and sign-up. Desktop renders AuthHero on the
 * left and the Clerk form on the right; mobile collapses the hero into a
 * branded banner above the form.
 */
export function AuthPageLayout({ variant, children }: AuthPageLayoutProps) {
  return (
    <div
      className="flex min-h-screen items-center justify-center overflow-x-hidden font-sans md:p-7"
      style={{ background: 'var(--cozy-grad-parchment)' }}
    >
      <div
        className="grid w-full max-w-[1100px] grid-cols-1 overflow-hidden md:min-h-[640px] md:grid-cols-[1.15fr_1fr] md:rounded-3xl md:border"
        style={{
          borderColor: 'var(--cozy-border-hair)',
          boxShadow: 'var(--cozy-shadow-2xl)',
        }}
      >
        <div className="hidden md:block">
          <AuthHero variant={variant} />
        </div>
        <MobileBrandBanner variant={variant} />
        <AuthFormSurface>{children}</AuthFormSurface>
      </div>
    </div>
  )
}

/* ---------- internals ---------- */

function MobileBrandBanner({ variant }: { variant: AuthVariant }) {
  const tagline = AUTH_HERO_COPY_BY_VARIANT[variant].heroTitle
  return (
    <div
      className="relative flex flex-col items-center gap-2 px-6 py-10 text-center text-white md:hidden"
      style={{ background: 'var(--cozy-grad-auth-hero)' }}
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 backdrop-blur-md"
        style={{ background: 'rgba(255, 255, 255, 0.18)' }}
      >
        <Home className="h-6 w-6" strokeWidth={2} aria-hidden />
      </div>
      <div className="mt-1 font-display text-[22px] font-bold tracking-[-0.01em]">
        {AUTH_BRAND.name}
      </div>
      <div className="text-balance text-[13px] text-white/85">{tagline}</div>
    </div>
  )
}

function AuthFormSurface({ children }: { children: React.ReactNode }) {
  return (
    <section
      className="relative flex flex-col justify-center overflow-hidden px-6 py-10 md:px-11 md:py-12"
      style={{ background: 'var(--cozy-surface-raised)' }}
    >
      <DotTextureOverlay />
      <div className="relative z-10 mx-auto w-full max-w-[420px]">{children}</div>
    </section>
  )
}

function DotTextureOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-50"
      style={{
        backgroundImage: 'radial-gradient(oklch(0.7 0.1 75 / 0.22) .6px, transparent .6px)',
        backgroundSize: '18px 18px',
      }}
    />
  )
}

import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'

/**
 * Post sign-up landing page. Clerk redirects new users here via
 * NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL. The full wizard (create group,
 * invite members, pick platforms) lives in a later phase — this
 * placeholder keeps the flow unblocked and points back to the dashboard.
 */
export default function OnboardingPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-[560px] flex-col items-center justify-center text-center">
      <div
        className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          background: 'var(--cozy-grad-btn)',
          boxShadow: 'var(--cozy-shadow-btn)',
        }}
      >
        <Sparkles className="h-7 w-7 text-white" strokeWidth={2} aria-hidden />
      </div>

      <h1
        className="font-display text-[32px] font-bold leading-[1.1] tracking-[-0.02em] text-balance"
        style={{ color: 'var(--cozy-fg-primary)' }}
      >
        Sua casa está pronta para começar.
      </h1>
      <p
        className="mt-3 max-w-[46ch] text-[15px] leading-[1.55]"
        style={{ color: 'var(--cozy-fg-secondary)' }}
      >
        O assistente de onboarding (criar grupo, convidar moradores e escolher
        plataformas) chega em uma próxima fase. Por enquanto você pode seguir
        direto pro seu painel.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl px-5 py-3 font-display text-[14px] font-bold text-white transition-transform active:scale-[0.98]"
        style={{
          background: 'var(--cozy-grad-btn)',
          boxShadow: 'var(--cozy-shadow-btn)',
        }}
      >
        Ir para o painel
        <ArrowRight className="h-4 w-4" aria-hidden strokeWidth={2.2} />
      </Link>
    </section>
  )
}

import { Sparkles } from 'lucide-react'
import { CreateGroupForm } from './_components/CreateGroupForm'

/**
 * Post sign-up landing page. Clerk redirects new users here via
 * NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL. Renders a minimal group-creation
 * form; once the group is created, the client pushes the user back to
 * the dashboard. Deeper onboarding steps (invite members, pick
 * platforms) land in a later phase.
 */
export default function OnboardingPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-[520px] flex-col items-center justify-center">
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
        className="text-center font-display text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-balance"
        style={{ color: 'var(--cozy-fg-primary)' }}
      >
        Vamos criar seu primeiro lar.
      </h1>
      <p
        className="mt-3 text-center text-[14.5px] leading-[1.55]"
        style={{ color: 'var(--cozy-fg-secondary)' }}
      >
        Dê um nome pro grupo — você convida os moradores depois.
      </p>

      <div className="mt-8 w-full">
        <CreateGroupForm />
      </div>
    </section>
  )
}

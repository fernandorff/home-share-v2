import { Sparkles } from 'lucide-react'

interface HeroBannerProps {
  greeting: string
  subGreeting: string
}

/**
 * Welcome banner shown above the expense card. Uses the cozy auth-hero
 * gradient plus decorative orbs for a warm-but-calm surface — avoids
 * external hero imagery so the banner stays self-contained.
 */
export function HeroBanner({ greeting, subGreeting }: HeroBannerProps) {
  return (
    <section
      className="relative h-44 overflow-hidden rounded-2xl border md:h-48"
      style={{
        background: 'var(--cozy-grad-auth-hero)',
        borderColor: 'var(--cozy-border-hair)',
        boxShadow: 'var(--cozy-shadow-card, var(--cozy-shadow-xs))',
      }}
    >
      <DecorativeOrb position="top-right" />
      <DecorativeOrb position="bottom-left" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(#fff .5px, transparent .5px)',
          backgroundSize: '22px 22px',
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-end p-5 md:p-6">
        <div className="flex items-center gap-2 text-white/85">
          <Sparkles className="h-4 w-4" aria-hidden />
          <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.08em]">
            Seu lar
          </span>
        </div>
        <h1 className="mt-1 font-display text-[28px] font-bold leading-[1.1] tracking-[-0.01em] text-white md:text-[32px]">
          {greeting}
        </h1>
        <p className="mt-1 max-w-[42ch] text-[13.5px] leading-[1.45] text-white/80">
          {subGreeting}
        </p>
      </div>
    </section>
  )
}

const ORB_POSITION_STYLES = {
  'top-right': {
    top: -70,
    right: -50,
    background: 'radial-gradient(circle, oklch(0.85 0.12 75 / 0.3), transparent 60%)',
  },
  'bottom-left': {
    bottom: -60,
    left: -50,
    background: 'radial-gradient(circle, oklch(0.75 0.14 38 / 0.35), transparent 60%)',
  },
} as const

function DecorativeOrb({ position }: { position: keyof typeof ORB_POSITION_STYLES }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute h-[220px] w-[220px] rounded-full blur-2xl"
      style={ORB_POSITION_STYLES[position]}
    />
  )
}

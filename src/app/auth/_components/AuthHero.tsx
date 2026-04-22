import { Home } from 'lucide-react'
import {
  AUTH_BRAND,
  AUTH_FEATURE_HIGHLIGHTS,
  AUTH_HERO_COPY_BY_VARIANT,
  type AuthFeatureHighlight,
  type AuthVariant,
} from './authCopy'

interface AuthHeroProps {
  variant: AuthVariant
}

/** Split-screen hero used on the left half of the auth layout (desktop). */
export function AuthHero({ variant }: AuthHeroProps) {
  const copy = AUTH_HERO_COPY_BY_VARIANT[variant]
  return (
    <section
      className="relative flex flex-col justify-between overflow-hidden px-11 py-12 text-white md:min-h-[600px]"
      style={{ background: 'var(--cozy-grad-auth-hero)' }}
    >
      <DotTextureOverlay />
      <DecorativeOrb position="top-right" delay={0} />
      <DecorativeOrb position="bottom-left" delay={-2} />

      <BrandMark />

      <div className="relative z-10">
        <h1 className="mb-3.5 max-w-[22ch] font-display text-[42px] font-bold leading-[1.05] tracking-[-0.02em] text-balance">
          {copy.heroTitle}
        </h1>
        <p className="mb-7 max-w-[42ch] text-[15.5px] leading-[1.55] text-white/85">
          {copy.heroDescription}
        </p>
        <FeatureGrid highlights={AUTH_FEATURE_HIGHLIGHTS} />
      </div>

      <Testimonial text={copy.testimonial} />
    </section>
  )
}

/* ---------- internals ---------- */

function DotTextureOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage: 'radial-gradient(#fff .5px, transparent .5px)',
        backgroundSize: '22px 22px',
      }}
    />
  )
}

const ORB_POSITION_STYLES = {
  'top-right': {
    top: -80,
    right: -60,
    background: 'radial-gradient(circle, oklch(0.85 0.12 75 / 0.35), transparent 60%)',
  },
  'bottom-left': {
    bottom: -60,
    left: -60,
    background: 'radial-gradient(circle, oklch(0.75 0.14 38 / 0.4), transparent 60%)',
  },
} as const

function DecorativeOrb({
  position,
  delay,
}: {
  position: keyof typeof ORB_POSITION_STYLES
  delay: number
}) {
  const { background, ...anchor } = ORB_POSITION_STYLES[position]
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute h-[260px] w-[260px] rounded-full blur-2xl"
      style={{
        ...anchor,
        background,
        animation: `cozy-drift 10s ease-in-out ${delay}s infinite alternate`,
      }}
    />
  )
}

function BrandMark() {
  return (
    <div className="relative z-10 flex items-center gap-3">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 backdrop-blur-md"
        style={{ background: 'rgba(255, 255, 255, 0.18)' }}
      >
        <Home className="h-6 w-6 text-white" strokeWidth={2} />
      </div>
      <div>
        <div className="font-display text-xl font-bold tracking-[-0.01em]">{AUTH_BRAND.name}</div>
        <div className="mt-px text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70">
          {AUTH_BRAND.tagline}
        </div>
      </div>
    </div>
  )
}

function FeatureGrid({ highlights }: { highlights: ReadonlyArray<AuthFeatureHighlight> }) {
  return (
    <div className="grid max-w-[420px] grid-cols-2 gap-2.5">
      {highlights.map((highlight) => (
        <FeatureCard key={highlight.title} highlight={highlight} />
      ))}
    </div>
  )
}

function FeatureCard({ highlight }: { highlight: AuthFeatureHighlight }) {
  const Icon = highlight.icon
  return (
    <div
      className="flex gap-2.5 rounded-xl border border-white/15 px-3 py-2.5 backdrop-blur-md"
      style={{ background: 'rgba(255, 255, 255, 0.09)' }}
    >
      <div
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ background: 'rgba(255, 255, 255, 0.14)' }}
      >
        <Icon className="h-[15px] w-[15px] text-white" strokeWidth={2} />
      </div>
      <span className="self-center font-display text-[12.5px] font-semibold leading-[1.2]">
        {highlight.title}
      </span>
    </div>
  )
}

function Testimonial({ text }: { text: string }) {
  return (
    <div className="relative z-10 flex items-center gap-2 font-sans text-[12.5px] italic text-white/70">
      <div className="h-px w-4 bg-white/35" />
      {text}
    </div>
  )
}

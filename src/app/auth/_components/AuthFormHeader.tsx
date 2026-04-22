interface AuthFormHeaderProps {
  title: string
  subtitle: string
}

/** Title + subtitle block rendered above the Clerk widget. */
export function AuthFormHeader({ title, subtitle }: AuthFormHeaderProps) {
  return (
    <header className="mb-8 text-center">
      <h1
        className="mb-2 font-display text-[28px] font-bold leading-[1.15] tracking-[-0.015em]"
        style={{ color: 'var(--cozy-fg-primary)' }}
      >
        {title}
      </h1>
      <p
        className="text-[14.5px] leading-[1.5]"
        style={{ color: 'var(--cozy-fg-secondary)' }}
      >
        {subtitle}
      </p>
    </header>
  )
}

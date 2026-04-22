import Link from 'next/link'

interface AuthSwitchCtaProps {
  prompt: string
  label: string
  href: string
}

/** "Já tem conta? Entrar" style footer rendered below the Clerk widget. */
export function AuthSwitchCta({ prompt, label, href }: AuthSwitchCtaProps) {
  return (
    <p
      className="mt-8 text-center text-[13.5px]"
      style={{ color: 'var(--cozy-fg-secondary)' }}
    >
      {prompt}{' '}
      <Link
        href={href}
        className="font-bold transition-colors"
        style={{ color: 'var(--cozy-fg-link)' }}
      >
        {label}
      </Link>
    </p>
  )
}

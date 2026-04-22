import { SignUp } from '@clerk/nextjs'
import { AuthPageLayout } from '@/components/layout/AuthPageLayout'
import { AuthFormHeader } from '@/app/auth/_components/AuthFormHeader'
import { AuthSwitchCta } from '@/app/auth/_components/AuthSwitchCta'
import { AUTH_FORM_COPY_BY_VARIANT } from '@/app/auth/_components/authCopy'
import { clerkCozyAppearance } from '@/lib/clerk-appearance'

const copy = AUTH_FORM_COPY_BY_VARIANT.signup

export default function SignUpPage() {
  return (
    <AuthPageLayout variant="signup">
      <AuthFormHeader title={copy.formTitle} subtitle={copy.formSubtitle} />
      <SignUp appearance={clerkCozyAppearance} />
      <AuthSwitchCta
        prompt={copy.switchPromptPrefix}
        label={copy.switchCtaLabel}
        href={copy.switchCtaHref}
      />
    </AuthPageLayout>
  )
}

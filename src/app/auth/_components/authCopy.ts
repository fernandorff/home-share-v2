import { Receipt, ShoppingCart, Users, Wallet, type LucideIcon } from 'lucide-react'

/**
 * Single source of truth for every string and icon that appears on the
 * Sign In / Sign Up screens. Consumers pick slices via variant key.
 */

export type AuthVariant = 'signin' | 'signup'

export interface AuthFeatureHighlight {
  readonly icon: LucideIcon
  readonly title: string
}

export interface AuthHeroCopy {
  readonly heroTitle: string
  readonly heroDescription: string
  readonly testimonial: string
}

export interface AuthFormCopy {
  readonly formTitle: string
  readonly formSubtitle: string
  readonly switchPromptPrefix: string
  readonly switchCtaLabel: string
  readonly switchCtaHref: string
}

export const AUTH_BRAND = {
  name: 'Home Share',
  tagline: 'Lar aconchegante',
} as const

export const AUTH_FEATURE_HIGHLIGHTS: ReadonlyArray<AuthFeatureHighlight> = [
  { icon: Receipt, title: 'Despesas compartilhadas' },
  { icon: Users, title: 'Grupos flexíveis' },
  { icon: ShoppingCart, title: 'Lista de compras' },
  { icon: Wallet, title: 'Saldos automáticos' },
]

export const AUTH_HERO_COPY_BY_VARIANT: Readonly<Record<AuthVariant, AuthHeroCopy>> = {
  signin: {
    heroTitle: 'Dividir contas nunca foi tão aconchegante.',
    heroDescription:
      'Registre despesas, divida de forma justa, e acerte as contas sem dor de cabeça. Add the expense, we handle the math.',
    testimonial: '"Onde tem ordem, tem sossego."',
  },
  signup: {
    heroTitle: 'Comece seu grupo em 30 segundos.',
    heroDescription:
      'Registre despesas, divida entre moradores e veja quem deve a quem. Sem planilha, sem DR.',
    testimonial: '"Onde tem ordem, tem sossego."',
  },
}

export const AUTH_FORM_COPY_BY_VARIANT: Readonly<Record<AuthVariant, AuthFormCopy>> = {
  signin: {
    formTitle: 'Bem-vindo ao lar.',
    formSubtitle: 'Entre para continuar cuidando do seu lar.',
    switchPromptPrefix: 'Novo por aqui?',
    switchCtaLabel: 'Crie sua conta gratuitamente',
    switchCtaHref: '/auth/sign-up',
  },
  signup: {
    formTitle: 'Bem-vindo ao Home Share!',
    formSubtitle: 'Crie sua conta em segundos — você configura o grupo depois.',
    switchPromptPrefix: 'Já tem conta?',
    switchCtaLabel: 'Entrar',
    switchCtaHref: '/auth/sign-in',
  },
}

export const AUTH_SIGNUP_PROGRESS = {
  currentStep: 1,
  totalSteps: 3,
  stepsSummary: 'criar conta · grupo · convidar',
} as const

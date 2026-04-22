import { ptBR } from '@clerk/localizations'

/**
 * The upstream `@clerk/localizations/pt-BR` bundle ships translations for the
 * sign-in password placeholder but not the sign-up one, so the widget falls
 * back to the English default ("Create a password") mid-form. This module
 * re-exports ptBR with the missing keys filled in.
 */
export const clerkPtBr = {
  ...ptBR,
  signUp: {
    ...ptBR.signUp,
    start: {
      ...ptBR.signUp?.start,
    },
  },
  formFieldInputPlaceholder__password: 'Digite sua senha',
  formFieldInputPlaceholder__signUpPassword: 'Crie uma senha segura',
  formFieldInputPlaceholder__confirmPassword: 'Repita a senha',
}

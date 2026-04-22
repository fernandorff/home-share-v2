/**
 * Clerk widget styling — Cozy Cottage v2.
 *
 * All values reference CSS custom properties defined in src/app/globals.css,
 * so a single token edit propagates everywhere the Clerk widget is mounted.
 * `variables` maps Clerk's semantic slots to our tokens; `elements` applies
 * slot-level overrides (buttons, inputs, dividers, card chrome).
 */

const cssVar = (name: string): string => `var(${name})`

const COZY_CSS_VARS = {
  terracotta600: '--terracotta-600',
  terracotta700: '--terracotta-700',
  terracotta800: '--terracotta-800',
  sage600:       '--sage-600',
  danger600:     '--danger-600',
  cream50:       '--cream-50',
  surfaceRaised: '--cozy-surface-raised',
  fgPrimary:     '--cozy-fg-primary',
  fgSecondary:   '--cozy-fg-secondary',
  fgMuted:       '--cozy-fg-muted',
  fgLabel:       '--cozy-fg-label',
  fgPlaceholder: '--cozy-fg-placeholder',
  borderHair:    '--cozy-border-hair',
  borderSubtle:  '--cozy-border-subtle',
  borderStrong:  '--cozy-border-strong',
  gradBtn:       '--cozy-grad-btn',
  shadowXs:      '--cozy-shadow-xs',
  shadowBtn:     '--cozy-shadow-btn',
  shadowFocus:   '--cozy-shadow-focus',
  radiusLg:      '--cozy-radius-lg',
} as const

const token = (key: keyof typeof COZY_CSS_VARS): string => cssVar(COZY_CSS_VARS[key])

const FONT_BODY = 'var(--font-nunito), system-ui, sans-serif'
const FONT_DISPLAY = 'var(--font-fredoka), system-ui, sans-serif'
const TRANSITION_FAST = 'all var(--cozy-dur-fast) var(--cozy-ease-out)'

export const clerkCozyAppearance = {
  variables: {
    colorPrimary:                 token('terracotta600'),
    colorDanger:                  token('danger600'),
    colorSuccess:                 token('sage600'),
    colorBackground:              token('surfaceRaised'),
    colorInputBackground:         '#ffffff',
    colorInputText:               token('fgPrimary'),
    colorText:                    token('fgPrimary'),
    colorTextSecondary:           token('fgSecondary'),
    colorTextOnPrimaryBackground: token('cream50'),
    colorNeutral:                 token('fgPrimary'),
    borderRadius:                 token('radiusLg'),
    fontFamily:                   FONT_BODY,
    fontFamilyButtons:            FONT_DISPLAY,
    fontSize:                     '14.5px',
  },
  elements: {
    rootBox: {
      width: '100%',
      maxWidth: '100%',
    },
    cardBox: {
      width: '100%',
      maxWidth: '100%',
      background: 'transparent',
      boxShadow: 'none',
      border: 'none',
    },
    card: {
      background: 'transparent',
      boxShadow: 'none',
      border: 'none',
      padding: 0,
      width: '100%',
      maxWidth: '100%',
    },
    main: {
      gap: '16px',
    },
    headerTitle: {
      fontFamily: FONT_DISPLAY,
      fontWeight: 700,
      fontSize: '32px',
      letterSpacing: '-0.015em',
      color: token('fgPrimary'),
    },
    headerSubtitle: {
      color: token('fgSecondary'),
      fontSize: '14.5px',
      lineHeight: 1.5,
    },
    socialButtonsBlockButton: {
      border: `1.5px solid ${token('borderHair')}`,
      background: '#ffffff',
      color: token('fgPrimary'),
      fontFamily: FONT_DISPLAY,
      fontWeight: 600,
      fontSize: '14.5px',
      padding: '13px 16px',
      borderRadius: token('radiusLg'),
      boxShadow: token('shadowXs'),
      transition: TRANSITION_FAST,
      '&:hover': {
        background: token('surfaceRaised'),
        borderColor: token('borderStrong'),
      },
      '&:focus-visible': {
        outline: 'none',
        boxShadow: token('shadowFocus'),
      },
    },
    socialButtonsBlockButtonText: {
      fontFamily: FONT_DISPLAY,
      fontWeight: 600,
    },
    dividerRow: {
      margin: '22px 0',
    },
    dividerLine: {
      background: 'oklch(0.75 0.12 78 / 0.28)',
      height: '1px',
    },
    dividerText: {
      color: token('fgMuted'),
      fontFamily: FONT_DISPLAY,
      fontWeight: 600,
      fontSize: '11px',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
    formFieldLabel: {
      fontFamily: FONT_DISPLAY,
      fontWeight: 700,
      fontSize: '12px',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: token('fgLabel'),
    },
    formFieldInput: {
      border: `1.5px solid ${token('borderSubtle')}`,
      background: '#ffffff',
      borderRadius: token('radiusLg'),
      padding: '11px 14px',
      fontSize: '14.5px',
      color: token('fgPrimary'),
      transition: TRANSITION_FAST,
      '&::placeholder': {
        color: token('fgPlaceholder'),
      },
      '&:focus': {
        outline: 'none',
        borderColor: token('terracotta600'),
        boxShadow: token('shadowFocus'),
      },
    },
    formButtonPrimary: {
      background: token('gradBtn'),
      border: '1px solid oklch(0.48 0.125 38 / 0.6)',
      borderRadius: token('radiusLg'),
      padding: '13px 16px',
      fontFamily: FONT_DISPLAY,
      fontWeight: 700,
      fontSize: '14.5px',
      letterSpacing: '-0.005em',
      boxShadow: token('shadowBtn'),
      transition: TRANSITION_FAST,
      '&:hover': {
        filter: 'brightness(1.05)',
      },
      '&:active': {
        transform: 'translateY(1px)',
      },
      '&:focus-visible': {
        outline: 'none',
        boxShadow: token('shadowFocus'),
      },
    },
    formFieldAction: {
      color: token('terracotta700'),
      fontWeight: 600,
      fontSize: '12.5px',
      '&:hover': {
        color: token('terracotta800'),
      },
    },
    footer: {
      display: 'none',
    },
    footerActionText: {
      color: token('fgSecondary'),
      fontSize: '13.5px',
    },
    footerActionLink: {
      color: token('terracotta700'),
      fontWeight: 700,
      textDecoration: 'none',
      '&:hover': {
        color: token('terracotta800'),
      },
    },
    identityPreviewText: {
      color: token('fgPrimary'),
    },
    identityPreviewEditButton: {
      color: token('terracotta700'),
    },
  },
}

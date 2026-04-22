import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from '@clerk/localizations'
import { Fredoka, Geist_Mono, Nunito } from 'next/font/google'
import './globals.css'

const fredoka = Fredoka({
  variable: '--font-fredoka',
  subsets: ['latin'],
  display: 'swap',
})

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Home Share',
  description: 'Gerenciamento de despesas compartilhadas para quem vive junto',
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#C2684A',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${fredoka.variable} ${nunito.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <ClerkProvider localization={ptBR}>{children}</ClerkProvider>
      </body>
    </html>
  )
}

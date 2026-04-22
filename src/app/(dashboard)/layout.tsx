import { TopNavBar } from './_components/TopNavBar'
import { BottomNav } from './_components/BottomNav'

/** Shared shell for every authenticated dashboard route. */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative min-h-screen font-sans"
      style={{ background: 'var(--cozy-grad-parchment)' }}
    >
      <TopNavBar />
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-20 md:px-8 md:pb-12 md:pt-24">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

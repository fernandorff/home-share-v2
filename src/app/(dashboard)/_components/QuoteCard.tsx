import { Lightbulb } from 'lucide-react'

interface QuoteCardProps {
  text: string
}

/** Small bento card at the bottom of the sidebar with a gentle lifestyle quote. */
export function QuoteCard({ text }: QuoteCardProps) {
  return (
    <aside
      className="flex items-center gap-4 rounded-2xl border p-4"
      style={{
        background: 'oklch(0.55 0.05 68 / 0.10)',
        borderColor: 'oklch(0.55 0.05 68 / 0.20)',
      }}
    >
      <Lightbulb
        className="h-7 w-7 flex-shrink-0"
        style={{ color: 'var(--cream-800)' }}
        strokeWidth={2}
        aria-hidden
      />
      <p
        className="font-sans text-[12px] italic leading-[1.5]"
        style={{ color: 'var(--cozy-fg-primary)' }}
      >
        {text}
      </p>
    </aside>
  )
}

"use client"

import { useEffect, useRef, useState } from 'react'
import { MoreVertical, type LucideIcon } from 'lucide-react'

export interface MenuOption {
  readonly label: string
  readonly icon: LucideIcon
  readonly onClick: () => void | Promise<void>
  readonly disabled?: boolean
}

interface OptionsMenuProps {
  options: ReadonlyArray<MenuOption>
  /** Tailwind size classes for the trigger button. */
  triggerClassName?: string
  triggerLabel?: string
}

/** Accessible kebab menu — button + popover with keyboard-friendly close on ESC/outside click. */
export function OptionsMenu({ options, triggerClassName, triggerLabel = 'Mais opções' }: OptionsMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) return
      if (!rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  async function runOption(option: MenuOption) {
    setOpen(false)
    await option.onClick()
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={
          triggerClassName ??
          'rounded-md p-1 transition-colors hover:bg-[oklch(0.72_0.12_75/0.12)]'
        }
        style={{ color: open ? 'var(--terracotta-700)' : 'var(--cozy-fg-muted)' }}
      >
        <MoreVertical className="h-[18px] w-[18px]" aria-hidden />
      </button>

      {open && (
        <ul
          role="menu"
          className="absolute right-0 top-[calc(100%+4px)] z-30 min-w-[180px] overflow-hidden rounded-xl border"
          style={{
            background: 'var(--cozy-surface-raised)',
            borderColor: 'var(--cozy-border-hair)',
            boxShadow: 'var(--cozy-shadow-2xl)',
          }}
        >
          {options.map((option) => {
            const Icon = option.icon
            return (
              <li key={option.label} role="none">
                <button
                  type="button"
                  role="menuitem"
                  disabled={option.disabled}
                  onClick={() => runOption(option)}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-sans text-[13.5px] transition-colors hover:bg-[oklch(0.90_0.055_78/0.25)] disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ color: 'var(--cozy-fg-primary)' }}
                >
                  <Icon className="h-4 w-4" style={{ color: 'var(--cozy-fg-muted)' }} aria-hidden />
                  {option.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

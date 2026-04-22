"use client"

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  /** Maximum width in pixels. Defaults to 520. */
  maxWidth?: number
}

/**
 * Generic modal built on the native <dialog> element. Handles ESC,
 * backdrop click, and focus trap by delegating to the browser. Panel is
 * rendered inside the dialog so our Cozy styling lives in a single
 * tree — no portal needed since <dialog> is top-layer by design.
 */
export function Modal({ open, onClose, title, description, children, maxWidth = 520 }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    function handleCancel(event: Event) {
      event.preventDefault()
      onClose()
    }
    function handleBackdropClick(event: MouseEvent) {
      if (event.target === dialog) onClose()
    }
    dialog.addEventListener('cancel', handleCancel)
    dialog.addEventListener('click', handleBackdropClick)
    return () => {
      dialog.removeEventListener('cancel', handleCancel)
      dialog.removeEventListener('click', handleBackdropClick)
    }
  }, [onClose])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-desc' : undefined}
      className="m-auto w-[calc(100%-32px)] rounded-2xl border p-0 backdrop:backdrop-blur-sm backdrop:bg-[oklch(0.15_0.05_60/0.55)]"
      style={{
        maxWidth,
        background: 'var(--cozy-surface-raised)',
        borderColor: 'var(--cozy-border-hair)',
        boxShadow: 'var(--cozy-shadow-2xl)',
        color: 'var(--cozy-fg-primary)',
      }}
    >
      <header
        className="flex items-start justify-between gap-4 border-b px-6 py-4"
        style={{ borderColor: 'var(--cozy-border-hair)' }}
      >
        <div className="min-w-0">
          <h2
            id="modal-title"
            className="font-display text-[20px] font-bold leading-tight tracking-[-0.01em]"
            style={{ color: 'var(--cozy-fg-primary)' }}
          >
            {title}
          </h2>
          {description && (
            <p
              id="modal-desc"
              className="mt-1 text-[13.5px]"
              style={{ color: 'var(--cozy-fg-secondary)' }}
            >
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[oklch(0.72_0.12_75/0.12)]"
          style={{ color: 'var(--cozy-fg-muted)' }}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </header>

      <div className="px-6 py-5">{children}</div>
    </dialog>
  )
}

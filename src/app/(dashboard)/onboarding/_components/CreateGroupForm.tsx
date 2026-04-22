"use client"

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useGroupContext } from '@/contexts/group-context'

/** Minimal create-group form: name (required) + optional description. */
export function CreateGroupForm() {
  const router = useRouter()
  const { refreshGroups } = useGroupContext()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Erro ao criar grupo')
      await refreshGroups()
      router.replace('/')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Erro ao criar grupo')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <FormField
        id="group-name"
        label="Nome do grupo"
        value={name}
        onChange={setName}
        placeholder="Ex: Apartamento 302"
        required
        autoFocus
      />
      <FormField
        id="group-description"
        label="Descrição"
        value={description}
        onChange={setDescription}
        placeholder="Uma frase pra identificar o lar (opcional)"
      />

      {error && (
        <p
          role="alert"
          className="rounded-lg border px-3 py-2 text-[13px]"
          style={{
            background: 'var(--danger-50)',
            borderColor: 'var(--danger-300)',
            color: 'var(--danger-700)',
          }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !name.trim()}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-display text-[14px] font-bold text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: 'var(--cozy-grad-btn)',
          boxShadow: 'var(--cozy-shadow-btn)',
        }}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Criando grupo…
          </>
        ) : (
          <>
            Criar grupo
            <ArrowRight className="h-4 w-4" aria-hidden strokeWidth={2.2} />
          </>
        )}
      </button>
    </form>
  )
}

interface FormFieldProps {
  id: string
  label: string
  value: string
  onChange: (next: string) => void
  placeholder?: string
  required?: boolean
  autoFocus?: boolean
}

function FormField({ id, label, value, onChange, placeholder, required, autoFocus }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-display text-[12px] font-bold uppercase tracking-[0.08em]"
        style={{ color: 'var(--cozy-fg-label)' }}
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        className="rounded-xl border px-4 py-3 font-sans text-[14.5px] transition-colors focus:outline-none"
        style={{
          background: '#fff',
          borderColor: 'var(--cozy-border-subtle)',
          color: 'var(--cozy-fg-primary)',
        }}
      />
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency, maskCurrency, parseCurrency } from '@/lib/currency'

interface GroupMember {
  readonly id: number
  readonly name: string
}

interface ExpenseFormModalProps {
  open: boolean
  onClose: () => void
  members: ReadonlyArray<GroupMember>
  onSubmit: (input: ExpenseInput) => Promise<boolean>
  loading?: boolean
  error?: string | null
}

export interface ExpenseInput {
  payerId: number
  platformId: number | null
  description: string
  notes?: string
  amount: number
  date: string
  splitEqually: boolean
  participants: { userId: number; amount: number }[]
}

/** Minimal "Nova despesa" form — equal split across every active member. */
export function ExpenseFormModal({ open, onClose, members, onSubmit, loading, error }: ExpenseFormModalProps) {
  const [description, setDescription] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [payerId, setPayerId] = useState<number | null>(null)
  const [date, setDate] = useState(todayISO)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setDescription('')
    setAmountStr('')
    setDate(todayISO())
    setPayerId(members[0]?.id ?? null)
    setSubmitError(null)
  }, [open, members])

  const amount = parseCurrency(amountStr)
  const perPerson = useMemo(
    () => (members.length > 0 ? amount / members.length : 0),
    [amount, members.length],
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return
    setSubmitError(null)

    if (!description.trim()) return setSubmitError('Dê uma descrição pra despesa.')
    if (amount <= 0)          return setSubmitError('Informe um valor maior que zero.')
    if (payerId === null)     return setSubmitError('Selecione quem pagou.')
    if (members.length === 0) return setSubmitError('O grupo ainda não tem moradores ativos.')

    const participants = distributeEqually(amount, members)

    const ok = await onSubmit({
      payerId,
      platformId: null,
      description: description.trim(),
      amount,
      date,
      splitEqually: true,
      participants,
    })

    if (ok) onClose()
  }

  const visibleError = submitError ?? error ?? null

  return (
    <Modal open={open} onClose={onClose} title="Nova despesa" description="Tudo divide igual entre os moradores.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Descrição" htmlFor="expense-description">
          <TextInput
            id="expense-description"
            value={description}
            onChange={setDescription}
            placeholder="Ex: Supermercado do mês"
            required
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Valor (R$)" htmlFor="expense-amount">
            <TextInput
              id="expense-amount"
              value={amountStr}
              onChange={(next) => setAmountStr(maskCurrency(next))}
              placeholder="0,00"
              inputMode="numeric"
              required
            />
          </Field>
          <Field label="Data" htmlFor="expense-date">
            <TextInput
              id="expense-date"
              type="date"
              value={date}
              onChange={setDate}
              required
            />
          </Field>
        </div>

        <Field label="Pago por" htmlFor="expense-payer">
          <Select
            id="expense-payer"
            value={payerId !== null ? String(payerId) : ''}
            onChange={(next) => setPayerId(next ? Number(next) : null)}
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </Select>
        </Field>

        {members.length > 0 && amount > 0 && (
          <p
            className="rounded-lg border px-3 py-2 text-[12.5px]"
            style={{
              background: 'oklch(0.95 0.028 82 / 0.4)',
              borderColor: 'var(--cozy-border-subtle)',
              color: 'var(--cozy-fg-secondary)',
            }}
          >
            Cada um dos {members.length} moradores paga{' '}
            <strong style={{ color: 'var(--terracotta-700)' }}>
              R$ {formatCurrency(perPerson)}
            </strong>
            .
          </p>
        )}

        {visibleError && (
          <p
            role="alert"
            className="rounded-lg border px-3 py-2 text-[13px]"
            style={{
              background: 'var(--danger-50)',
              borderColor: 'var(--danger-300)',
              color: 'var(--danger-700)',
            }}
          >
            {visibleError}
          </p>
        )}

        <div className="mt-2 flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl px-4 py-2.5 font-sans text-[13.5px] font-bold transition-colors disabled:opacity-60"
            style={{ color: 'var(--cozy-fg-secondary)' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-display text-[13.5px] font-bold text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background: 'var(--cozy-grad-btn)',
              boxShadow: 'var(--cozy-shadow-btn)',
            }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {loading ? 'Salvando…' : 'Salvar despesa'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ---------- internals ---------- */

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Splits the amount equally across members. Last member absorbs the
 * rounding remainder so the sum matches the original total exactly.
 */
function distributeEqually(total: number, members: ReadonlyArray<GroupMember>): { userId: number; amount: number }[] {
  if (members.length === 0) return []
  const cents = Math.round(total * 100)
  const base = Math.floor(cents / members.length)
  const remainder = cents - base * members.length
  return members.map((member, index) => ({
    userId: member.id,
    amount: (base + (index === members.length - 1 ? remainder : 0)) / 100,
  }))
}

interface FieldProps {
  label: string
  htmlFor: string
  children: React.ReactNode
}

function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="font-display text-[11.5px] font-bold uppercase tracking-[0.08em]"
        style={{ color: 'var(--cozy-fg-label)' }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

interface TextInputProps {
  id: string
  value: string
  onChange: (next: string) => void
  placeholder?: string
  required?: boolean
  autoFocus?: boolean
  type?: string
  inputMode?: 'numeric' | 'text'
}

function TextInput({ id, value, onChange, placeholder, required, autoFocus, type = 'text', inputMode }: TextInputProps) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      autoFocus={autoFocus}
      inputMode={inputMode}
      className="rounded-xl border px-4 py-2.5 font-sans text-[14px] transition-colors focus:outline-none focus:border-[var(--terracotta-600)]"
      style={{
        background: '#fff',
        borderColor: 'var(--cozy-border-subtle)',
        color: 'var(--cozy-fg-primary)',
      }}
    />
  )
}

interface SelectProps {
  id: string
  value: string
  onChange: (next: string) => void
  children: React.ReactNode
}

function Select({ id, value, onChange, children }: SelectProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-xl border bg-white px-4 py-2.5 font-sans text-[14px] transition-colors focus:outline-none focus:border-[var(--terracotta-600)]"
      style={{
        borderColor: 'var(--cozy-border-subtle)',
        color: 'var(--cozy-fg-primary)',
      }}
    >
      {children}
    </select>
  )
}

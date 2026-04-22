"use client"

import { ArrowRight } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency } from '@/lib/currency'
import type { SimplifiedDebt } from '@/lib/balance'

interface SettleUpModalProps {
  open: boolean
  onClose: () => void
  settlements: ReadonlyArray<SimplifiedDebt>
}

/**
 * Shows every pending settlement between residents in one place. Marking
 * a settlement as paid (posting a compensating expense) lands in a later
 * phase — for now this surfaces the full picture so the user can act on
 * it manually via a regular expense.
 */
export function SettleUpModal({ open, onClose, settlements }: SettleUpModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Acertar contas"
      description={settlements.length === 0
        ? 'Ninguém deve ninguém. Que lar em paz.'
        : `${settlements.length} ${settlements.length === 1 ? 'acerto pendente' : 'acertos pendentes'}.`}
      maxWidth={480}
    >
      {settlements.length === 0 ? (
        <p className="py-4 text-center text-[14px]" style={{ color: 'var(--cozy-fg-secondary)' }}>
          Crie uma nova despesa quando algum morador voltar a pagar algo do grupo.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {settlements.map((settlement) => (
            <SettlementRow key={`${settlement.from.id}-${settlement.to.id}`} settlement={settlement} />
          ))}
        </ul>
      )}

      <p
        className="mt-5 rounded-lg border px-3 py-2 text-[11.5px]"
        style={{
          background: 'oklch(0.95 0.028 82 / 0.4)',
          borderColor: 'var(--cozy-border-subtle)',
          color: 'var(--cozy-fg-muted)',
        }}
      >
        Marcar acertos como pagos ficará disponível em breve. Por enquanto,
        registre o pagamento como uma nova despesa no grupo.
      </p>
    </Modal>
  )
}

function SettlementRow({ settlement }: { settlement: SimplifiedDebt }) {
  return (
    <li
      className="flex items-center gap-3 rounded-xl border p-3"
      style={{
        background: 'rgba(255, 255, 255, 0.75)',
        borderColor: 'var(--cozy-border-subtle)',
      }}
    >
      <span
        className="flex-1 font-display text-[14px] font-bold"
        style={{ color: 'var(--cozy-fg-primary)' }}
      >
        {settlement.from.name}
      </span>
      <ArrowRight
        className="h-4 w-4 flex-shrink-0"
        style={{ color: 'var(--sage-600)' }}
        aria-hidden
      />
      <span
        className="flex-1 text-right font-sans text-[14px] font-semibold"
        style={{ color: 'var(--cozy-fg-primary)' }}
      >
        {settlement.to.name}
      </span>
      <span
        className="font-mono text-[13.5px] font-bold"
        style={{ color: 'var(--terracotta-700)' }}
      >
        R$ {formatCurrency(settlement.amount)}
      </span>
    </li>
  )
}

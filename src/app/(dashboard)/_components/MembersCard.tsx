import { Crown, UserRound } from 'lucide-react'
import type { Resident, ResidentRole } from './dashboardMocks'

interface MembersCardProps {
  residents: ReadonlyArray<Resident>
}

const ROLE_LABEL: Readonly<Record<ResidentRole, string>> = {
  ADMIN:  'Admin · Coroa',
  MEMBER: 'Membro',
  GUEST:  'Visitante',
}

/** "Moradores" sidebar card — one row per resident with avatar and role. */
export function MembersCard({ residents }: MembersCardProps) {
  return (
    <article
      className="overflow-hidden rounded-2xl border p-6 backdrop-blur-sm"
      style={{
        background: 'rgba(255, 255, 255, 0.7)',
        borderColor: 'var(--cozy-border-hair)',
        boxShadow: 'var(--cozy-shadow-xs)',
      }}
    >
      <h3
        className="mb-4 font-display text-[12px] font-bold uppercase tracking-[0.08em]"
        style={{ color: 'var(--cozy-fg-label)' }}
      >
        Moradores
      </h3>

      <ul className="space-y-3.5">
        {residents.map((resident) => (
          <ResidentRow key={resident.id} resident={resident} />
        ))}
      </ul>
    </article>
  )
}

function ResidentRow({ resident }: { resident: Resident }) {
  const isAdmin = resident.role === 'ADMIN'
  const isGuest = resident.role === 'GUEST'
  return (
    <li className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 font-display text-[13px] font-bold"
          style={{
            borderColor: resident.accent,
            background: 'rgba(255, 255, 255, 0.85)',
            color: 'var(--cozy-fg-primary)',
          }}
        >
          {resident.initials}
        </div>
        <div>
          <p className="font-sans text-[14px] font-bold" style={{ color: 'var(--cozy-fg-primary)' }}>
            {resident.name}
          </p>
          <p
            className="text-[10px] font-bold uppercase tracking-tight"
            style={{
              color: isAdmin
                ? 'var(--sage-600)'
                : isGuest
                  ? 'var(--cozy-fg-muted)'
                  : 'var(--cozy-fg-muted)',
            }}
          >
            {ROLE_LABEL[resident.role]}
          </p>
        </div>
      </div>
      {isAdmin && (
        <Crown
          className="h-4 w-4"
          style={{ color: 'var(--amber-600)' }}
          aria-label="Administrador"
        />
      )}
      {isGuest && (
        <UserRound
          className="h-4 w-4"
          style={{ color: 'var(--cozy-fg-muted)' }}
          aria-label="Visitante"
        />
      )}
    </li>
  )
}

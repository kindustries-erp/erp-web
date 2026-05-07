import { cn } from '@/shared/utils'
import React from 'react'

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  badge?: React.ReactNode
  warn?: boolean
}

export function KpiCard({ label, value, sub, icon, badge, warn }: KpiCardProps) {
  return (
    <div
      className={cn(
        'bg-surface border rounded-xl p-4 max-[480px]:p-3 card-shadow',
        warn ? 'border-[#f59e0b] border-[1.5px]' : 'border-border',
      )}
    >
      <div className="flex items-center justify-between mb-[10px]">
        <div className="w-7 h-7 flex items-center justify-center bg-[color:var(--muted)] rounded-[7px]">
          {icon}
        </div>
        {badge}
      </div>
      <div className="text-[10px] text-[color:var(--muted-fg)] font-medium uppercase tracking-[0.05em] mb-1">{label}</div>
      <div className="text-[22px] max-[480px]:text-[18px] font-semibold text-foreground">{value}</div>
      {sub && <div className="text-[11px] text-[color:var(--faint)] mt-[3px]">{sub}</div>}
    </div>
  )
}

interface BadgeProps {
  variant: 'up' | 'down' | 'warn'
  children: React.ReactNode
}

export function KpiBadge({ variant, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'text-[10px] px-2 py-[3px] rounded-[20px] font-medium',
        variant === 'up' && 'bg-up-bg text-up-fg',
        variant === 'down' && 'bg-down-bg text-down-fg',
        variant === 'warn' && 'bg-warn-bg text-warn-fg',
      )}
    >
      {children}
    </span>
  )
}

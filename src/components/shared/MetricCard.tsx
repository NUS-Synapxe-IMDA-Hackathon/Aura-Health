import { cn } from '../../lib/utils'
import { Card, CardContent } from '../ui/card'

type Color = 'teal' | 'rose' | 'emerald' | 'amber' | 'blue' | 'slate'

const colorMap: Record<Color, { bg: string; label: string; value: string; sub: string }> = {
  teal:    { bg: 'bg-linear-to-br from-teal-50 to-teal-100',       label: 'text-teal-700',   value: 'text-teal-700',   sub: 'text-teal-600' },
  rose:    { bg: 'bg-linear-to-br from-rose-50 to-rose-100',       label: 'text-rose-700',   value: 'text-rose-800',   sub: 'text-rose-600' },
  emerald: { bg: 'bg-linear-to-br from-emerald-50 to-emerald-100', label: 'text-emerald-700',value: 'text-emerald-800',sub: 'text-emerald-600' },
  amber:   { bg: 'bg-linear-to-br from-amber-50 to-amber-100',     label: 'text-amber-700',  value: 'text-amber-800',  sub: 'text-amber-600' },
  blue:    { bg: 'bg-linear-to-br from-blue-50 to-blue-100',       label: 'text-blue-800',   value: 'text-blue-800',   sub: 'text-blue-700' },
  slate:   { bg: 'bg-linear-to-br from-slate-50 to-slate-100',     label: 'text-slate-600',  value: 'text-slate-800',  sub: 'text-slate-500' },
}

type MetricCardProps = {
  label: string
  value: string | number
  unit?: string
  sub?: string
  color?: Color
  className?: string
}

export function MetricCard({ label, value, unit, sub, color = 'slate', className }: MetricCardProps) {
  const c = colorMap[color]
  return (
    <Card className={cn(c.bg, 'shadow-none', className)}>
      <CardContent className="p-3.5">
        <p className={cn('mb-1 text-[10px] font-bold tracking-wide uppercase', c.label)}>{label}</p>
        <p className={cn('text-[30px] leading-none font-semibold tracking-tight', c.value)}>
          {value}
          {unit && <span className="text-base font-medium"> {unit}</span>}
        </p>
        {sub && <p className={cn('mt-1 text-[11px]', c.sub)}>{sub}</p>}
      </CardContent>
    </Card>
  )
}

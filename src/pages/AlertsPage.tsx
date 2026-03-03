import { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { alerts } from '../data/monitoring'
import { PageHeader } from '../components/shared/PageHeader'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import type { AlertOutletContext } from '../components/layout/AppShell'
import type { AlertFilter } from '../types/monitoring'

export function AlertsPage() {
  const { fallStatus, filter, setFilter, count, incrementReview } = useOutletContext<AlertOutletContext>()
  const isFallen = fallStatus === 'fallen'

  const visibleAlerts = useMemo(
    () => alerts.filter((item) => filter === 'all' || item.severity === filter),
    [filter],
  )

  return (
    <div className="pb-5">
      <PageHeader eyebrow="History" title="Alerts" subtitle="Last 7 days" />
      <div className="space-y-2 px-4">
        <div
          className={[
            'rounded-2xl border px-4 py-3',
            isFallen ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50',
          ].join(' ')}
        >
          <p className={['text-xs font-semibold', isFallen ? 'text-rose-800' : 'text-emerald-800'].join(' ')}>
            {isFallen ? 'Active fall alert in monitoring stream.' : 'No active fall alert in monitoring stream.'}
          </p>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1">
          {[
            { label: 'All', value: 'all' },
            { label: '🚨 Critical', value: 'critical' },
            { label: '⚠️ Warning', value: 'warning' },
            { label: '🔵 Notice', value: 'notice' },
          ].map((pill) => (
            <Button
              key={pill.value}
              size="sm"
              variant={filter === pill.value ? 'default' : 'outline'}
              className="rounded-full"
              onClick={() => setFilter(pill.value as AlertFilter)}
            >
              {pill.label}
            </Button>
          ))}
        </div>

        {(isFallen ? visibleAlerts : visibleAlerts.filter((item) => item.severity !== 'critical')).map((item) => (
          <Card
            key={item.id}
            className={[
              'rounded-2xl py-3',
              item.severity === 'critical' && 'border-rose-200 bg-rose-50',
              item.severity === 'warning' && 'border-amber-200 bg-amber-50',
              item.severity === 'notice' && 'border-blue-200 bg-blue-50',
              item.severity === 'ok' && 'border-emerald-200 bg-emerald-50',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <CardContent className="flex items-center gap-3 px-4">
              <p className="text-lg">{item.icon}</p>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-600">{item.subtitle}</p>
              </div>
              <p className="text-[10px] font-medium text-slate-400">{item.time}</p>
            </CardContent>
          </Card>
        ))}

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
          <p className="text-xs font-semibold text-emerald-800">🌟 3 consecutive days without critical alerts</p>
          <Button size="xs" variant="ghost" className="mt-1 text-[11px] text-emerald-800" onClick={incrementReview}>
            Reviewed {count} times
          </Button>
        </div>
      </div>
    </div>
  )
}

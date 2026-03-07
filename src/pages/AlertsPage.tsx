import { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { cn } from '../lib/utils'
import { AlertRow } from '../components/shared/AlertRow'
import type { PatientContext } from '../types/monitoring'
import type { AlertFilter } from '../types/monitoring'
import { alerts } from '../data/mock'

const FILTER_PILLS: { label: string; value: AlertFilter | 'all' }[] = [
  { label: 'All',      value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'Warning',  value: 'warning' },
  { label: 'Notice',   value: 'notice' },
]

export function AlertsPage() {
  const { fallStatus, filter, setFilter, alertActions, onAlertAction, liveFallSnapshot } = useOutletContext<PatientContext>()
  const isFallen = fallStatus === 'fallen'

  const visibleAlerts = useMemo(
    () => alerts.filter(item => filter === 'all' || item.severity === filter),
    [filter],
  )

  const showLiveFall = liveFallSnapshot !== null && (filter === 'all' || filter === 'critical')

  return (
    <div className="pb-5">
      {/* Page header */}
      <div className="flex justify-between items-start px-5 pt-4 pb-6">
        <div>
          <p
            className="text-[28px] leading-none text-slate-900"
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, letterSpacing: '-0.01em' }}
          >
            Alerts
          </p>
          <p className="text-[13px] text-slate-400 mt-1">Last 7 days</p>
        </div>
        <button className="size-9 rounded-full bg-slate-200 flex items-center justify-center text-[13px] font-bold text-slate-600 mt-2">
          SC
        </button>
      </div>

      <div className="px-4 space-y-2">
        {/* Milestone card — only when no active fall */}
        {!isFallen && (
          <div className="flex items-center gap-3 bg-white rounded-[20px] border border-slate-100 shadow-sm p-3.5">
            <div className="size-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6"/>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-800">3 days without critical alerts</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Monitoring routine is working well</p>
            </div>
          </div>
        )}

        {/* Filter pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {FILTER_PILLS.map((pill) => (
            <button
              key={pill.value}
              onClick={() => setFilter(pill.value as AlertFilter)}
              className={cn(
                'px-3.5 py-1 rounded-full text-[12px] font-semibold cursor-pointer flex-shrink-0 whitespace-nowrap border-[1.5px] transition-colors',
                filter === pill.value
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-500 border-slate-200',
              )}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Alert cards */}
        <div className="space-y-2 pt-0.5">
          {showLiveFall && liveFallSnapshot && (
            <AlertRow
              alert={liveFallSnapshot}
              actionTaken={alertActions['live-fall'] ?? null}
              onAction={(label) => onAlertAction('live-fall', label)}
            />
          )}
          {visibleAlerts.map((item) => (
            <AlertRow
              key={item.id}
              alert={item}
              actionTaken={alertActions[item.id] ?? null}
              onAction={(label) => onAlertAction(item.id, label)}
            />
          ))}
          {!showLiveFall && visibleAlerts.length === 0 && (
            <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-6 text-center">
              <p className="text-sm text-slate-400">No alerts for this filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

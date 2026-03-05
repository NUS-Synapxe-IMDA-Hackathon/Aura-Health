import { cn } from '../../lib/utils'
import type { AlertItem, AlertIconType } from '../../types/monitoring'

// eslint-disable-next-line react-refresh/only-export-components
export const alertIconWrapBg: Record<AlertItem['severity'], string> = {
  critical: 'bg-rose-50',
  warning:  'bg-amber-50',
  notice:   'bg-teal-50',
  ok:       'bg-emerald-50',
}

// eslint-disable-next-line react-refresh/only-export-components
export const alertIconStroke: Record<AlertItem['severity'], string> = {
  critical: '#e11d48',
  warning:  '#d97706',
  notice:   '#0d9488',
  ok:       '#059669',
}

// eslint-disable-next-line react-refresh/only-export-components
export const alertDetailColor: Record<AlertItem['severity'], string> = {
  critical: 'text-rose-600',
  warning:  'text-amber-600',
  notice:   'text-teal-600',
  ok:       'text-emerald-600',
}

const severityBorderColor: Record<AlertItem['severity'], string> = {
  critical: '#e11d48',
  warning:  '#d97706',
  notice:   '#0d9488',
  ok:       '#059669',
}

const cardActions: Partial<Record<AlertItem['severity'], [string, string]>> = {
  critical: ['View Report', 'Mark Resolved'],
  warning:  ['Dismiss',     'Check In'],
}

export function AlertIcon({ iconType, color }: { iconType: AlertIconType; color: string }) {
  switch (iconType) {
    case 'alert-triangle':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      )
    case 'circle-info':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      )
    case 'heart':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      )
    case 'clock':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/>
        </svg>
      )
    case 'moon':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )
    case 'check-circle':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
        </svg>
      )
    case 'walking':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 4a1 1 0 1 0-2 0 1 1 0 0 0 2 0z" fill={color}/>
          <path d="M7 20l2.5-6 2.5 3 2-3.5 3 6.5M8 13l2-3 4 2.5"/>
        </svg>
      )
    default:
      return null
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export const actionDoneLabel: Partial<Record<AlertItem['severity'], [string, string]>> = {
  critical: ['Report viewed', 'Resolved'],
  warning:  ['Dismissed',    'Checked in'],
}

type AlertRowProps = {
  alert: AlertItem
  className?: string
  actionTaken?: string | null
  onAction?: (label: string) => void
}

export function AlertRow({ alert, className, actionTaken, onAction }: AlertRowProps) {
  const borderColor = severityBorderColor[alert.severity]
  const alertActions = cardActions[alert.severity]
  const doneLabels = actionDoneLabel[alert.severity]

  return (
    <div
      className={cn('bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden', className)}
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <div className="flex items-start gap-3 p-3.5">
        <div className={cn('size-9 rounded-[10px] flex items-center justify-center flex-shrink-0', alertIconWrapBg[alert.severity])}>
          <AlertIcon iconType={alert.iconType} color={alertIconStroke[alert.severity]} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <p className="text-[13px] font-semibold text-slate-800 leading-snug">{alert.title}</p>
            <span className="text-[11px] text-slate-400 flex-shrink-0">{alert.time}</span>
          </div>
          <p className={cn('text-[11px] font-semibold mt-0.5', alertDetailColor[alert.severity])}>{alert.detail}</p>
          {alert.context && <p className="text-[12px] text-slate-400 mt-0.5">{alert.context}</p>}
        </div>
      </div>
      {alertActions && doneLabels && (
        actionTaken ? (
          <div className="mx-3.5 mb-3.5 pt-2.5 border-t border-slate-100">
            <p className="text-[12px] font-semibold text-slate-400">{actionTaken}</p>
          </div>
        ) : (
          <div className="flex gap-2 mx-3.5 mb-3.5 pt-2.5 border-t border-slate-100">
            <button
              className="flex-1 py-1.5 px-2.5 rounded-[10px] text-[12px] font-semibold bg-slate-100 text-slate-700 cursor-pointer"
              onClick={() => onAction?.(doneLabels[0])}
            >
              {alertActions[0]}
            </button>
            <button
              className="flex-1 py-1.5 px-2.5 rounded-[10px] text-[12px] font-semibold bg-slate-900 text-white cursor-pointer"
              onClick={() => onAction?.(doneLabels[1])}
            >
              {alertActions[1]}
            </button>
          </div>
        )
      )}
    </div>
  )
}

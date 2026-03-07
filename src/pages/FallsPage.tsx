import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { cn } from '../lib/utils'
import { Card, CardContent } from '../components/ui/card'
import type { Incident, PatientContext } from '../types/monitoring'
import { mockIncident } from '../data/mock'



const STATUS_LABEL: Record<string, string> = {
  assessing:       'Assessing…',
  needs_attention: 'Needs Attention',
  being_handled:   'Being Handled',
  escalated:       'Escalated',
  resolved:        'Resolved',
}

const MOMENT_DOT: Record<string, string> = {
  info:     'bg-sky-400',
  warning:  'bg-amber-400',
  critical: 'bg-rose-500',
}

const TAG_STYLE: Record<string, string> = {
  critical: 'bg-rose-50 border border-rose-100 text-rose-600',
  warning:  'bg-amber-50 border border-amber-100 text-amber-600',
  info:     'bg-sky-50 border border-sky-100 text-sky-600',
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={cn('transition-transform text-slate-400', open ? 'rotate-180' : '')}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function IncidentDetail({
  incident,
  isResolved,
  resolutionLabel,
  onResolve,
  onBack,
}: {
  incident: Incident
  isResolved: boolean
  resolutionLabel?: string
  onResolve?: (type: 'resolved' | 'false_alarm') => void
  onBack?: () => void
}) {
  const [detectionOpen, setDetectionOpen] = useState(true)
  const [timelineOpen, setTimelineOpen]   = useState(true)

  const resolvedAsFalseAlarm = resolutionLabel === 'False Alarm'

  return (
    <div className="space-y-3 px-4">

      {/* Top banner */}
      <div className={cn('rounded-[24px] p-4', isResolved
        ? resolvedAsFalseAlarm ? 'bg-slate-50 border border-slate-200' : 'bg-emerald-50 border border-emerald-100'
        : 'bg-rose-50',
      )}>
        {onBack && (
          <button
            className="flex items-center gap-1 mb-3 text-slate-400 touch-manipulation"
            onClick={onBack}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span className="text-[12px] font-semibold">Back</span>
          </button>
        )}
        <div className="flex items-center gap-2 mb-2">
          {isResolved ? (
            <span className={cn('text-[10px] font-extrabold tracking-[.1em] uppercase',
              resolvedAsFalseAlarm ? 'text-slate-400' : 'text-emerald-600'
            )}>
              {resolutionLabel}
            </span>
          ) : (
            <>
              <span className="text-[10px] font-extrabold tracking-[.1em] uppercase text-rose-500">Critical</span>
              <span className="text-slate-300">·</span>
              <span className="text-[10px] font-bold text-rose-400">{STATUS_LABEL[incident.status]}</span>
            </>
          )}
        </div>
        <p className={cn('text-[22px] font-bold leading-tight',
          isResolved ? resolvedAsFalseAlarm ? 'text-slate-700' : 'text-emerald-900' : 'text-rose-900'
        )}>
          {incident.headline}
        </p>
        <p className={cn('text-[13px] mt-1',
          isResolved ? 'text-slate-400' : 'text-rose-400'
        )}>
          Since 1:23 PM · Living / Dining
        </p>
      </div>

      {/* Narrative + tags */}
      <Card className="rounded-3xl py-4">
        <CardContent className="px-4">
          <p className="text-[15px] font-bold text-slate-900 mb-2">What Happened</p>
          <p className="text-[13px] text-slate-600 leading-relaxed mb-3">{incident.narrative}</p>
          <div className="flex flex-wrap gap-1.5">
            {incident.tags.map((tag, i) => (
              <span key={i} className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full', TAG_STYLE[tag.tone])}>
                {tag.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voice — What Ashley Said */}
      {incident.voice && (
        <Card className="rounded-3xl py-4">
          <CardContent className="px-4">
            <p className="text-[15px] font-bold text-slate-900 mb-3">What Ashley Said</p>
            <div className="space-y-3">
              {incident.voice.exchanges.map((ex, i) => (
                <div key={i}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={cn('text-[10px] font-extrabold tracking-wide uppercase',
                      ex.speaker === 'aura' ? 'text-teal-500' : 'text-rose-400'
                    )}>
                      {ex.speaker === 'aura' ? 'AURA' : 'Ashley'}
                    </span>
                    {ex.emotion && (
                      <span className="text-[10px] text-amber-500 font-semibold">· {ex.emotion}</span>
                    )}
                  </div>
                  <p className={cn('text-[13px] leading-snug',
                    ex.speaker === 'aura' ? 'text-slate-400 italic' : 'text-slate-800'
                  )}>
                    "{ex.text}"
                  </p>
                </div>
              ))}
            </div>
            {incident.voice.summary && (
              <p className="mt-3 text-[12px] text-slate-400 italic border-t border-slate-100 pt-2.5">
                {incident.voice.summary}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Video — What the Camera Saw */}
      <Card className="rounded-3xl py-4">
        <CardContent className="px-4">
          <p className="text-[15px] font-bold text-slate-900 mb-3">What the Camera Saw</p>
          <div className="relative bg-slate-800 rounded-xl h-36 flex items-center justify-center mb-3">
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
            <span className="absolute bottom-2 right-3 text-white/50 text-[10px] font-mono">0:15</span>
            <span className="absolute top-2 left-3 text-[9px] font-bold uppercase tracking-wide text-white/40">
              {isResolved ? 'Recording' : 'Analyzing…'}
            </span>
          </div>
          {incident.video && (
            <>
              <div className="space-y-2 mb-3">
                {incident.video.moments.map((m, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className={cn('mt-1 w-2 h-2 rounded-full flex-shrink-0', MOMENT_DOT[m.significance])} />
                    <span className="text-[11px] font-bold text-slate-400 w-7 flex-shrink-0">{m.time}</span>
                    <span className="text-[12px] text-slate-600">{m.description}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-3 space-y-1.5">
                {[
                  ['Cause',       incident.video.cause],
                  ['Mobility',    incident.video.mobility],
                  ['Injuries',    incident.video.injuries.join(', ')],
                  ['Environment', incident.video.environment.join(', ')],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-2">
                    <span className="text-[11px] font-bold text-slate-400 w-20 flex-shrink-0">{label}</span>
                    <span className="text-[12px] text-slate-700">{value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detection Snapshot — collapsible */}
      {incident.detection && (
        <Card className="rounded-3xl py-4">
          <CardContent className="px-4">
            <button
              className="flex w-full items-center justify-between touch-manipulation"
              onClick={() => setDetectionOpen(!detectionOpen)}
            >
              <p className="text-[15px] font-bold text-slate-900">Detection Snapshot</p>
              <ChevronIcon open={detectionOpen} />
            </button>
            {detectionOpen && (
              <div className="mt-3 space-y-1.5">
                {[
                  ['Posture',    incident.detection.posture_transition],
                  ['Impact',     incident.detection.impact_intensity.charAt(0).toUpperCase() + incident.detection.impact_intensity.slice(1)],
                  ['Confidence', `${incident.detection.confidence}%`],
                  ['Method',     incident.detection.method],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-2">
                    <span className="text-[11px] font-bold text-slate-400 w-20 flex-shrink-0">{label}</span>
                    <span className="text-[12px] text-slate-700">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Assessment */}
      {incident.ai_assessment && (
        <div className="bg-slate-900 rounded-[24px] p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5eead4" strokeWidth="2.5" strokeLinecap="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span className="text-[10px] font-extrabold tracking-[.1em] uppercase text-teal-300">AI Assessment</span>
          </div>
          <p className="text-[13px] leading-relaxed text-white/80 mb-3">{incident.ai_assessment.reasoning}</p>
          <p className="text-[10px] font-bold tracking-wide uppercase text-teal-400 mb-1.5">Recommended</p>
          <div className="space-y-1">
            {incident.ai_assessment.recommended_actions.map((action, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="mt-1.5 w-1 h-1 rounded-full bg-teal-400 flex-shrink-0" />
                <p className="text-[12px] text-white/70">{action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Timeline — collapsible */}
      <Card className="rounded-3xl py-4">
        <CardContent className="px-4">
          <button
            className="flex w-full items-center justify-between touch-manipulation"
            onClick={() => setTimelineOpen(!timelineOpen)}
          >
            <p className="text-[15px] font-bold text-slate-900">Timeline</p>
            <ChevronIcon open={timelineOpen} />
          </button>
          {timelineOpen && (
            <div className="relative pl-7 mt-3">
              {incident.event_timeline.map((ev, idx) => {
                const isLast = idx === incident.event_timeline.length - 1
                return (
                  <div key={idx} className="relative pb-4 last:pb-0">
                    <div className={cn(
                      'absolute -left-7 top-0.5 size-3 rounded-full border-2 border-white',
                      idx === 0 ? 'bg-rose-500 ring-4 ring-rose-100'
                      : isLast && isResolved
                        ? resolvedAsFalseAlarm ? 'bg-slate-400' : 'bg-emerald-500'
                        : isLast ? 'bg-amber-400'
                        : 'bg-slate-300',
                    )} />
                    {!isLast && (
                      <div className="absolute -left-[22px] top-3.5 bottom-0 w-px bg-slate-100" />
                    )}
                    <p className="text-[11px] font-bold text-slate-400">{ev.timestamp}</p>
                    <p className={cn('text-[13px] font-semibold mt-0.5',
                      isLast && isResolved
                        ? resolvedAsFalseAlarm ? 'text-slate-600' : 'text-emerald-700'
                        : 'text-slate-800'
                    )}>
                      {ev.label}
                    </p>
                    {ev.detail && <p className="text-[12px] text-slate-400 mt-0.5">{ev.detail}</p>}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action buttons — only shown when incident is live */}
      {!isResolved && onResolve && (
        <>
          <div className="grid grid-cols-2 gap-2">
            {incident.available_actions.map((action) => (
              <button
                key={action.id}
                className={cn(
                  'py-3 rounded-[14px] text-[13px] font-bold touch-manipulation',
                  action.id === 'ACK' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-700',
                )}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Resolution buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              className="py-3 rounded-[14px] text-[13px] font-bold bg-emerald-500 text-white touch-manipulation"
              onClick={() => onResolve('resolved')}
            >
              Resolved
            </button>
            <button
              className="py-3 rounded-[14px] text-[13px] font-bold bg-slate-200 text-slate-600 touch-manipulation"
              onClick={() => onResolve('false_alarm')}
            >
              False Alarm
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function FallsPage() {
  const { connected, fallStatus, resolvedIncident, onIncidentResolve } = useOutletContext<PatientContext>()
  const isFallen = fallStatus === 'fallen'

  const [viewingResolved, setViewingResolved] = useState(false)

  const subtitle = connected ? 'Live · Updated just now' : 'Connecting…'

  function handleResolve(type: 'resolved' | 'false_alarm') {
    const resolvedAt = new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const label = type === 'resolved' ? 'Marked as resolved' : 'Marked as false alarm'
    const updatedIncident: Incident = {
      ...mockIncident,
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      event_timeline: [
        ...mockIncident.event_timeline,
        { timestamp: resolvedAt, label, detail: 'Caregiver action' },
      ],
    }
    onIncidentResolve(type, updatedIncident)
  }

  // Drill-in: viewing a resolved incident in full detail
  if (!isFallen && resolvedIncident && viewingResolved) {
    const label = resolvedIncident.resolution === 'false_alarm' ? 'False Alarm' : 'Resolved'
    return (
      <div className="pb-5">
        <div className="px-5 pt-4 pb-6">
          <p className="text-[28px] leading-none text-slate-900"
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, letterSpacing: '-0.01em' }}>
            Fall Alert
          </p>
          <p className="text-[13px] text-slate-400 mt-1">{subtitle}</p>
        </div>
        <IncidentDetail
          incident={resolvedIncident.incident}
          isResolved
          resolutionLabel={label}
          onBack={() => setViewingResolved(false)}
        />
      </div>
    )
  }

  return (
    <div className="pb-5">
      {/* Page header */}
      <div className="px-5 pt-4 pb-6">
        <p
          className="text-[28px] leading-none text-slate-900"
          style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, letterSpacing: '-0.01em' }}
        >
          Fall Alert
        </p>
        <p className="text-[13px] text-slate-400 mt-1">{subtitle}</p>
      </div>

      {isFallen ? (
        <IncidentDetail
          incident={mockIncident}
          isResolved={false}
          onResolve={handleResolve}
        />
      ) : (
        <div className="space-y-2.5 px-4">

          {/* Fall risk level */}
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-[15px] font-bold text-slate-900">Fall Risk Level</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Based on current sensor data</p>
              </div>
              <span className="text-[13px] font-bold text-emerald-600">Low</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Low</span><span>Medium</span><span>High</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700 bg-emerald-500" style={{ width: '15%' }} />
            </div>
          </div>

          {/* AI insight */}
          <div className="bg-slate-900 rounded-[24px] p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5eead4" strokeWidth="2.5" strokeLinecap="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span className="text-[10px] font-extrabold tracking-[.1em] uppercase text-teal-300">AI Insight</span>
            </div>
            <p className="text-[13px] leading-relaxed text-white/80">
              Latest sensor readings indicate no fall state. Motion and body movement patterns are consistent with normal indoor activity. Continue regular monitoring.
            </p>
          </div>

          {/* Previous Fall Reports */}
          <div>
            <p className="text-[11px] font-bold tracking-[.08em] text-slate-400 uppercase px-1 mb-2 pt-2">Previous Fall Reports</p>
            {resolvedIncident ? (
              <div
                className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden"
                style={{ borderLeft: `3px solid ${resolvedIncident.resolution === 'false_alarm' ? '#94a3b8' : '#10b981'}` }}
              >
                <div className="flex items-start gap-3 p-3.5">
                  <div className={cn(
                    'size-9 rounded-[10px] flex items-center justify-center flex-shrink-0',
                    resolvedIncident.resolution === 'false_alarm' ? 'bg-slate-100' : 'bg-emerald-50',
                  )}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke={resolvedIncident.resolution === 'false_alarm' ? '#94a3b8' : '#10b981'}
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-[13px] font-semibold text-slate-800 leading-snug">{resolvedIncident.incident.headline}</p>
                      <span className="text-[11px] text-slate-400 flex-shrink-0">{resolvedIncident.resolvedAt}</span>
                    </div>
                    <p className={cn('text-[11px] font-semibold mt-0.5',
                      resolvedIncident.resolution === 'false_alarm' ? 'text-slate-500' : 'text-emerald-600'
                    )}>
                      {resolvedIncident.resolution === 'false_alarm' ? 'False Alarm' : 'Resolved'}
                    </p>
                    <p className="text-[12px] text-slate-400 mt-0.5">
                      {resolvedIncident.incident.tags.map(t => t.label).join(' · ')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mx-3.5 mb-3.5 pt-2.5 border-t border-slate-100">
                  <button
                    className="flex-1 py-1.5 px-2.5 rounded-[10px] text-[12px] font-semibold bg-slate-900 text-white cursor-pointer touch-manipulation"
                    onClick={() => setViewingResolved(true)}
                  >
                    View Report
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-slate-400 px-1">No previous incidents recorded.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

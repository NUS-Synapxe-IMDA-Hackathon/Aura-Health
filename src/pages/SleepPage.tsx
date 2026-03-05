import { useOutletContext } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/card'
import type { PatientContext } from '../types/monitoring'
import { sleepSession, weeklySleep } from '../data/mock'

const STAGE_SEGMENTS = [
  ['4%',  'bg-amber-200'],
  ['8%',  'bg-amber-200'],
  ['6%',  'bg-sky-300'],
  ['6%',  'bg-sky-300'],
  ['14%', 'bg-cyan-600'],
  ['18%', 'bg-cyan-600'],
  ['8%',  'bg-amber-200'],
  ['8%',  'bg-amber-200'],
  ['6%',  'bg-slate-200'],
  ['10%', 'bg-sky-300'],
  ['12%', 'bg-cyan-600'],
] as const

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function SleepPage() {
  const { fallStatus } = useOutletContext<PatientContext>()
  const isFallen = fallStatus === 'fallen'
  const s = sleepSession

  const scorePercent = s.score
  const conicGradient = `conic-gradient(rgb(20 184 166) 0 ${scorePercent}%, rgb(226 232 240) ${scorePercent}% 100%)`

  return (
    <div className="pb-5">
      {/* Page header */}
      <div className="px-5 pt-4 pb-2">
        <p
          className="text-[28px] leading-none text-slate-900"
          style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, letterSpacing: '-0.01em' }}
        >
          Sleep
        </p>
        <p className="text-[13px] text-slate-400 mt-1">
          {`Last session · Mar 4 · ${Math.floor(s.duration_min / 60)}h ${s.duration_min % 60}m`}
        </p>
      </div>

      <div className="space-y-3 px-4">
        {/* Sleep score ring */}
        <div className="flex justify-center py-1">
          <div
            className="relative grid h-32 w-32 place-items-center rounded-full"
            style={{ background: conicGradient }}
          >
            <div className="grid h-24 w-24 place-items-center rounded-full bg-slate-50 text-center">
              <div>
                <p className="text-4xl leading-none font-semibold text-slate-900">{s.score}</p>
                <p className="mt-0.5 text-[10px] font-bold tracking-[1px] text-teal-600 uppercase">Good</p>
                <p className="text-[9px] text-slate-400">Sleep Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stage breakdown */}
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { color: 'bg-cyan-600',  value: `${s.deep_pct}%`,  label: 'Deep',      textColor: 'text-cyan-700'  },
            { color: 'bg-sky-300',   value: `${s.light_pct}%`, label: 'Light',     textColor: 'text-sky-700'   },
            { color: 'bg-amber-200', value: `${s.awake_pct}%`, label: 'Awake',     textColor: 'text-amber-800' },
          ].map(({ color, value, label, textColor }) => (
            <Card key={label} className="rounded-2xl py-3 shadow-sm">
              <CardContent className="px-2 text-center">
                <div className={`mx-auto mb-1 h-3 w-3 rounded-sm ${color}`} />
                <p className={`text-sm font-bold ${textColor}`}>{value}</p>
                <p className="text-[9px] font-bold tracking-wide text-slate-400 uppercase">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sleep architecture timeline */}
        <Card className="rounded-3xl py-4">
          <CardContent className="px-4">
            <p className="mb-2 text-xs font-bold tracking-wide text-slate-400 uppercase">Sleep Architecture · Session</p>
            <div className="flex h-12 overflow-hidden rounded-xl">
              {STAGE_SEGMENTS.map(([width, tone], idx) => (
                <div key={idx} className={tone} style={{ width }} />
              ))}
            </div>
            <div className="mt-2 flex justify-between">
              <p className="text-[10px] text-slate-400">10 PM</p>
              <p className="text-[10px] text-slate-400">2 AM</p>
              <p className="text-[10px] text-slate-400">6 AM</p>
            </div>
            <div className="mt-2 flex items-center gap-3">
              {[
                ['bg-cyan-600', 'Deep'],
                ['bg-sky-300', 'Light'],
                ['bg-amber-200', 'Awake'],
              ].map(([color, label]) => (
                <div key={label} className="flex items-center gap-1">
                  <div className={`h-2 w-3 rounded-sm ${color}`} />
                  <span className="text-[10px] text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vitals grid */}
        <Card className="rounded-3xl py-4">
          <CardContent className="px-4">
            <p className="mb-2 text-xs font-bold tracking-wide text-slate-400 uppercase">Vitals During Sleep</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['Avg Heart Rate',   `${s.avg_hr} bpm`,  ''],
                ['Avg Respiration',  `${s.respiration} /min`, ''],
                ['Apnea Events',     '0',                 'text-emerald-700'],
                ['Turns in Bed',     '7',                 ''],
              ].map(([label, value, tone]) => (
                <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">{label}</p>
                  <p className={`text-sm font-bold text-slate-800 ${tone}`}>{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly sleep timing chart */}
        <Card className="rounded-3xl py-4">
          <CardContent className="px-4">
            <p className="mb-3 text-xs font-bold tracking-wide text-slate-400 uppercase">Weekly Sleep Timing</p>

            {(() => {
              const Y_START = 20   // 8 PM
              const Y_END   = 32   // 8 AM next day
              const RANGE   = Y_END - Y_START
              const CHART_H = 200
              const TOP     = 6
              const LEFT    = 46
              const COL_W   = 39
              const BAR_W   = 24
              const TOTAL_W = LEFT + COL_W * 7 + 4
              const TOTAL_H = TOP + CHART_H + 22

              const toY = (h: number) => TOP + ((h - Y_START) / RANGE) * CHART_H

              const yLabels = [
                { t: 20, label: '8 PM'  },
                { t: 22, label: '10 PM' },
                { t: 24, label: '12 AM' },
                { t: 26, label: '2 AM'  },
                { t: 28, label: '4 AM'  },
                { t: 30, label: '6 AM'  },
                { t: 32, label: '8 AM'  },
              ]

              return (
                <svg viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`} className="w-full h-auto overflow-visible">
                  {/* Horizontal grid lines */}
                  {yLabels.map(({ t, label }) => (
                    <g key={t}>
                      <line
                        x1={LEFT} y1={toY(t)} x2={TOTAL_W - 4} y2={toY(t)}
                        stroke="#f1f5f9" strokeWidth="1"
                      />
                      <text
                        x={LEFT - 4} y={toY(t) + 4}
                        textAnchor="end" fontSize="8.5" fontWeight="600" fill="#94a3b8"
                      >
                        {label}
                      </text>
                    </g>
                  ))}

                  {/* Sleep blocks per day */}
                  {weeklySleep.map((day, idx) => {
                    const x    = LEFT + idx * COL_W + (COL_W - BAR_W) / 2
                    const top  = toY(day.bedtime)
                    const bot  = toY(day.wake)
                    const h    = bot - top
                    const dH   = h * day.deep  / 100
                    const lH   = h * day.light / 100
                    const aH   = h * day.awake / 100

                    return (
                      <g key={idx}>
                        {/* Deep sleep — cyan-600 */}
                        <rect x={x} y={top}           width={BAR_W} height={dH} fill="#0891b2" rx="3" ry="3"/>
                        {/* Light sleep — sky-300 */}
                        <rect x={x} y={top + dH}      width={BAR_W} height={lH} fill="#7dd3fc"/>
                        {/* Awake — amber-200 */}
                        <rect x={x} y={top + dH + lH} width={BAR_W} height={aH} fill="#fde68a"/>
                        {/* Round bottom corners on awake band */}
                        <rect x={x} y={top + dH + lH + aH - 3} width={BAR_W} height={3} fill="#fde68a" rx="3" ry="3"/>
                        {/* Day label */}
                        <text
                          x={x + BAR_W / 2} y={TOP + CHART_H + 14}
                          textAnchor="middle" fontSize="9" fontWeight="700" fill="#94a3b8"
                        >
                          {DAY_LABELS[idx]}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              )
            })()}

            {/* Legend */}
            <div className="mt-2 flex items-center gap-4">
              {[
                ['bg-cyan-600',  'Deep'],
                ['bg-sky-300',   'Light'],
                ['bg-amber-200', 'Awake'],
              ].map(([color, label]) => (
                <div key={label} className="flex items-center gap-1">
                  <div className={`h-2 w-3 rounded-sm ${color}`} />
                  <span className="text-[10px] text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI insight */}
        <div className="bg-slate-900 rounded-[24px] p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5eead4" strokeWidth="2.5" strokeLinecap="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span className="text-[10px] font-extrabold tracking-[.1em] uppercase text-teal-300">AI Sleep Insight</span>
          </div>
          <p className="text-[13px] leading-relaxed text-white/80">
            {isFallen
              ? 'Sleep quality remains good, but an active fall status is present. Use sleep data as secondary context until safety is confirmed.'
              : `Excellent deep sleep (${s.deep_pct}%) last night, no apnea events, and one short out-of-bed trip consistent with normal pre-sleep bathroom use.`}
          </p>
        </div>
      </div>
    </div>
  )
}

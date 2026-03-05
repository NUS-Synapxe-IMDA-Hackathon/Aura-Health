import { useOutletContext } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/card'
import { SeverityBadge } from '../components/shared/SeverityBadge'
import type { PatientContext } from '../types/monitoring'
import { sleepSession, weeklyScores } from '../data/mock'

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
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { color: 'bg-cyan-600',  value: `${s.deep_pct}%`,  label: 'Deep',      textColor: 'text-cyan-700'  },
            { color: 'bg-sky-300',   value: `${s.light_pct}%`, label: 'Light',     textColor: 'text-sky-700'   },
            { color: 'bg-amber-200', value: `${s.awake_pct}%`, label: 'Awake',     textColor: 'text-amber-800' },
            { color: 'bg-teal-500',  value: `${Math.floor(s.duration_min * s.deep_pct / 100)}m`, label: 'Deep dur.', textColor: 'text-slate-800' },
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
                ['Out of Bed',       '1 × · 6 min',       ''],
                ['Awake Duration',   '35 min',            ''],
              ].map(([label, value, tone]) => (
                <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">{label}</p>
                  <p className={`text-sm font-bold text-slate-800 ${tone}`}>{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly trend */}
        <Card className="rounded-3xl py-4">
          <CardContent className="px-4">
            <p className="mb-3 text-xs font-bold tracking-wide text-slate-400 uppercase">Weekly Sleep Quality</p>
            <div className="mb-2 flex h-16 items-end gap-1.5">
              {weeklyScores.map((score, idx) => (
                <div key={idx} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={score < 45 ? 'bg-amber-300' : 'bg-teal-400'}
                    style={{ height: `${score}%`, width: '100%', borderRadius: '4px 4px 0 0' }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              {DAY_LABELS.map((d) => (
                <p key={d} className="flex-1 text-center text-[9px] font-bold text-slate-400">{d}</p>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Avg: <span className="font-bold text-slate-700">72 / 100</span>
              </p>
              <SeverityBadge severity="ok" />
            </div>
          </CardContent>
        </Card>

        {/* Safety status */}
        <div className={[
          'rounded-2xl border px-4 py-3',
          isFallen ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50',
        ].join(' ')}>
          <p className={['text-xs font-bold uppercase tracking-wide', isFallen ? 'text-rose-700' : 'text-emerald-700'].join(' ')}>
            Safety Status
          </p>
          <p className={['mt-1 text-sm font-semibold', isFallen ? 'text-rose-800' : 'text-emerald-800'].join(' ')}>
            {isFallen
              ? 'Fall status is active. Prioritise wellness check before sleep routine coaching.'
              : 'No active fall. Sleep recommendations are shown in normal mode.'}
          </p>
        </div>

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

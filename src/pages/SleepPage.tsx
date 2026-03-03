import { PageHeader } from '../components/shared/PageHeader'
import { Badge } from '../components/ui/badge'
import { Card, CardContent } from '../components/ui/card'
import { useOutletContext } from 'react-router-dom'
import type { AlertOutletContext } from '../components/layout/AppShell'

export function SleepPage() {
  const { fallStatus } = useOutletContext<AlertOutletContext>()
  const isFallen = fallStatus === 'fallen'

  return (
    <div className="pb-5">
      <PageHeader
        eyebrow="Analysis"
        title="Sleep"
        subtitle={isFallen ? 'Last session · Feb 28 10 PM – 6 AM · Fall follow-up' : 'Last session · Feb 28 10 PM – 6 AM'}
      />

      <div className="space-y-3 px-4">
        <div className="flex justify-center py-1">
          <div
            className="relative grid h-30 w-30 place-items-center rounded-full"
            style={{ background: 'conic-gradient(rgb(20 184 166) 0 88%, rgb(226 232 240) 88% 100%)' }}
          >
            <div className="grid h-24 w-24 place-items-center rounded-full bg-slate-50 text-center">
              <p className="text-4xl leading-none font-semibold text-slate-900">88</p>
              <p className="text-[10px] font-bold tracking-[1px] text-teal-600 uppercase">Good</p>
              <p className="text-[9px] text-slate-400">Sleep Score</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {[
            ['🌊', '64%', 'Deep', 'text-cyan-700'],
            ['☁️', '25%', 'Light', 'text-sky-700'],
            ['😶', '11%', 'Awake', 'text-amber-800'],
            ['⏱️', '180m', 'Deep dur.', 'text-slate-800'],
          ].map(([icon, value, label, color]) => (
            <Card key={label} className="rounded-2xl py-3 shadow-sm">
              <CardContent className="px-2 text-center">
                <p className="text-base">{icon}</p>
                <p className={['text-sm font-bold', color].join(' ')}>{value}</p>
                <p className="text-[9px] font-bold tracking-wide text-slate-400 uppercase">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-3xl py-4">
          <CardContent className="px-4">
            <p className="mb-2 text-xs font-bold tracking-wide text-slate-400 uppercase">Sleep Architecture · Session Timeline</p>
            <div className="flex h-12 overflow-hidden rounded-lg">
              {[
                ['4%', 'bg-amber-100'],
                ['8%', 'bg-amber-100'],
                ['6%', 'bg-sky-200'],
                ['6%', 'bg-sky-200'],
                ['14%', 'bg-cyan-700'],
                ['18%', 'bg-cyan-700'],
                ['8%', 'bg-amber-100'],
                ['8%', 'bg-amber-100'],
                ['6%', 'bg-slate-100'],
                ['10%', 'bg-sky-200'],
                ['12%', 'bg-cyan-700'],
              ].map(([width, tone], idx) => (
                <div key={idx} className={tone} style={{ width }} />
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">10 PM · 11 PM · 1 AM · 3 AM · 6 AM</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl py-4">
          <CardContent className="px-4">
            <p className="mb-2 text-xs font-bold tracking-wide text-slate-400 uppercase">Vitals During Sleep</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['Avg Heart Rate', '61 bpm', ''],
                ['Avg Respiration', '15 /min', ''],
                ['Apnea Events', '0', 'text-emerald-700'],
                ['Turns in Bed', '7', ''],
                ['Out of Bed', '1 × · 6 min', ''],
                ['Awake Duration', '35 min', ''],
              ].map(([label, value, tone]) => (
                <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">{label}</p>
                  <p className={['text-sm font-bold text-slate-800', tone].join(' ')}>{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl py-4">
          <CardContent className="px-4">
            <p className="mb-3 text-xs font-bold tracking-wide text-slate-400 uppercase">Weekly Sleep Quality Score</p>
            <div className="mb-4 flex h-16 items-end gap-1.5">
              {[72, 88, 38, 65, 80, 30, 88].map((h, idx) => (
                <div key={idx} className={h < 45 ? 'bg-amber-300' : 'bg-teal-400'} style={{ height: `${h}%`, width: '14%', borderRadius: '4px 4px 0 0' }} />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Avg score: <span className="font-bold text-slate-700">72 / 100</span>
              </p>
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">5/7 Good nights</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className={isFallen ? 'rounded-3xl border-rose-200 bg-rose-50 py-3' : 'rounded-3xl border-emerald-200 bg-emerald-50 py-3'}>
          <CardContent className="px-4">
            <p className={['text-xs font-bold uppercase tracking-wide', isFallen ? 'text-rose-700' : 'text-emerald-700'].join(' ')}>
              Safety Status
            </p>
            <p className={['mt-1 text-sm font-semibold', isFallen ? 'text-rose-800' : 'text-emerald-800'].join(' ')}>
              {isFallen ? 'Fall status is active. Prioritize wellness check before sleep routine coaching.' : 'No active fall. Sleep recommendations are shown in normal mode.'}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none bg-linear-to-br from-slate-800 to-teal-900 py-4 text-white shadow-lg shadow-teal-900/20">
          <CardContent className="px-4">
            <p className="text-[10px] font-extrabold tracking-[1.1px] text-teal-300 uppercase">✦ AI Sleep Insight</p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              {isFallen
                ? 'Sleep quality remains good, but an active fall status is present. Use sleep data as secondary context until safety is confirmed.'
                : 'Excellent deep sleep (64%) last night, no apnea events, and one short out-of-bed trip consistent with normal pre-sleep bathroom use.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { eventRows } from '../data/monitoring'
import { PageHeader } from '../components/shared/PageHeader'
import { Badge } from '../components/ui/badge'
import { Card, CardContent } from '../components/ui/card'
import { useOutletContext } from 'react-router-dom'
import type { AlertOutletContext } from '../components/layout/AppShell'

export function FallsPage() {
  const { fallStatus } = useOutletContext<AlertOutletContext>()
  const isFallen = fallStatus === 'fallen'

  return (
    <div className="pb-5">
      <PageHeader
        eyebrow="Analysis"
        title="Fall Detection"
        subtitle={isFallen ? 'Toilet sensor · esp32s3/pub' : 'Toilet sensor · No active fall'}
      />

      <div className="space-y-3 px-4">
        <Card className={['rounded-3xl border-l-4 py-4', isFallen ? 'border-l-rose-500' : 'border-l-emerald-500'].join(' ')}>
          <CardContent className="px-4">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-700">🚨 Current Sensor State</p>
                <p className="text-[11px] text-slate-400">2026-02-28T13:23:49.000Z</p>
              </div>
              <Badge className={isFallen ? 'bg-rose-100 text-rose-800 hover:bg-rose-100' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'}>
                {isFallen ? 'Fallen' : 'Not Fallen'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['Presence', 'Someone present', ''],
                ['Fall Status', isFallen ? 'Fallen' : 'Not fallen', isFallen ? 'text-rose-700' : 'text-emerald-700'],
                ['Motion', isFallen ? 'Still' : 'Active', isFallen ? 'text-amber-700' : 'text-emerald-700'],
                ['Body Movement', isFallen ? '1' : '9', isFallen ? 'text-amber-700' : 'text-emerald-700'],
                ['Stationary Dwell', isFallen ? 'Dwell present' : 'No dwell', isFallen ? 'text-rose-700 col-span-2' : 'text-emerald-700 col-span-2'],
              ].map(([label, value, className]) => (
                <div key={label} className={['rounded-xl border border-slate-100 bg-slate-50 px-3 py-2', className].join(' ')}>
                  <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">{label}</p>
                  <p className="text-sm font-bold text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="px-1 text-[11px] font-bold tracking-[1px] text-slate-400 uppercase">Sensor Event Log · Today 1:23 PM</p>
        <Card className="overflow-hidden rounded-3xl py-0">
          <CardContent className="p-0">
            {eventRows.map(([time, icon, title, subtitle, tone]) => (
              <div
                key={time}
                className={[
                  'flex gap-2 border-b border-slate-100 px-3 py-2.5 last:border-b-0',
                  tone === 'critical' && 'bg-rose-50/70',
                  tone === 'warning' && 'bg-amber-50/70',
                  tone === 'notice' && 'bg-teal-50/60',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <p className="min-w-13 pt-0.5 text-[10px] font-bold text-slate-400">{time}</p>
                <p>{icon}</p>
                <div>
                  <p className="text-xs font-bold text-slate-800">{title}</p>
                  <p className="text-[11px] text-slate-500">{subtitle}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <p className="px-1 text-[11px] font-bold tracking-[1px] text-slate-400 uppercase">Body Movement Parameters</p>
        <Card className="rounded-3xl py-4">
          <CardContent className="px-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700">bmp · All 10 messages</p>
              <Badge className={isFallen ? 'bg-rose-100 text-rose-800 hover:bg-rose-100' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'}>
                {isFallen ? 'Peak 87' : 'Peak 22'}
              </Badge>
            </div>
            <div className="flex h-14 items-end gap-1">
              {(isFallen ? [0, 21, 25, 100, 1, 1, 1, 16, 10, 0] : [0, 11, 18, 22, 14, 10, 12, 9, 8, 0]).map((h, idx) => (
                <div
                  key={idx}
                  className={[
                    'h-1.5 flex-1 rounded-t-sm bg-teal-100',
                    isFallen && idx === 3 && 'bg-rose-300',
                    isFallen && idx > 3 && idx < 8 && 'bg-amber-200',
                    idx === 1 || idx === 2 || idx === 8 ? 'bg-teal-500' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ height: `${Math.max(h, 2)}%` }}
                />
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              {isFallen
                ? 'Spike at 13:23:39 (bmp 87) = fall impact. Floor 1 = stationary dwell.'
                : 'No impact spike detected. Body movement remains in normal indoor activity range.'}
            </p>
          </CardContent>
        </Card>

        <Card
          className={[
            'rounded-3xl border-none py-4 text-white shadow-lg',
            isFallen ? 'bg-linear-to-br from-slate-800 to-teal-900 shadow-teal-900/20' : 'bg-linear-to-br from-emerald-800 to-teal-900 shadow-emerald-900/20',
          ].join(' ')}
        >
          <CardContent className="px-4">
            <p className="text-[10px] font-extrabold tracking-[1.1px] text-teal-300 uppercase">✦ AI Fall Insight</p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              {isFallen
                ? 'Today’s fall occurred in the toilet at 1:23 PM. Movement spiked to 87 on impact, then dropped to 1 while stationary dwell was present.'
                : 'Latest stream indicates no fall state. Motion and body movement patterns are consistent with normal activity.'}
            </p>
            <p className="mt-2 text-[11px] text-white/40">{isFallen ? 'Consider installing grab bars in the toilet.' : 'Continue regular monitoring and hydration reminders.'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

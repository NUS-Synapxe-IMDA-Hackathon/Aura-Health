import { Card, CardContent } from '../components/ui/card'
import { useOutletContext } from 'react-router-dom'
import type { AlertOutletContext } from '../components/layout/AppShell'

export function DashboardPage() {
  const { fallStatus } = useOutletContext<AlertOutletContext>()
  const isFallen = fallStatus === 'fallen'

  return (
    <div className="space-y-3 px-4 pb-5">
      <div className="px-1 pt-3">
        <p className="text-[11px] font-bold tracking-[1.4px] text-slate-400 uppercase">Aura</p>
        <h1 className="mt-1 text-[28px] leading-none font-semibold tracking-tight text-slate-900">Hi, Sarah</h1>
        <p className="mt-1 text-xs text-slate-500">Monitoring Ashley · 78</p>
      </div>

      <div className="grid grid-cols-[1.15fr_1fr] gap-2.5">
        <Card className="min-h-37.5 cursor-pointer bg-linear-to-br from-rose-50 to-rose-100 p-4 shadow-none">
          <CardContent className="flex h-full flex-col justify-between">
            <div className={[
              'flex h-11 w-11 items-center justify-center rounded-2xl text-2xl shadow-md',
              isFallen ? 'bg-rose-500 shadow-rose-300' : 'bg-emerald-500 shadow-emerald-300',
            ].join(' ')}>
              {isFallen ? '🚨' : '✅'}
            </div>
            <div>
              <p className={['mt-2 text-[30px] leading-none font-semibold tracking-tight', isFallen ? 'text-rose-900' : 'text-emerald-900'].join(' ')}>
                {isFallen ? 'Fallen' : 'Not Fallen'}
              </p>
              <p className={['mt-1 text-xs font-semibold', isFallen ? 'text-rose-700' : 'text-emerald-700'].join(' ')}>
                {isFallen ? 'Toilet · Still' : 'Active · Moving normally'}
              </p>
              <p className={['mt-1 text-[10px]', isFallen ? 'text-rose-800/70' : 'text-emerald-800/70'].join(' ')}>
                {isFallen ? 'Tap for report ›' : 'Safety check normal'}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2.5">
          <Card className="bg-linear-to-br from-teal-50 to-teal-100 p-3.5 shadow-none">
            <CardContent>
              <p className="mb-1 text-[10px] font-bold tracking-wide text-teal-700 uppercase">Heart Rate</p>
              <p className="text-[30px] leading-none font-semibold tracking-tight text-teal-700">61</p>
              <p className="mt-1 text-[11px] text-teal-600">bpm · sleep avg</p>
            </CardContent>
          </Card>
          <Card className="bg-linear-to-br from-blue-50 to-blue-100 p-3.5 shadow-none">
            <CardContent>
              <p className="mb-1 text-[10px] font-bold tracking-wide text-blue-800 uppercase">Sleep</p>
              <p className="text-[30px] leading-none font-semibold tracking-tight text-blue-800">88</p>
              <p className="mt-1 text-[11px] text-blue-700">Good · 64% deep</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-none bg-linear-to-br from-slate-800 to-slate-900 p-5 text-white shadow-lg shadow-slate-900/20">
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[1px] text-white/50 uppercase">Current Status</p>
            <p className="mt-1 text-xl font-semibold tracking-tight">{isFallen ? 'Fall Detected' : 'No Fall Detected'}</p>
            <p className="mt-1 text-xs text-white/60">{isFallen ? 'Toilet · Stationary dwell present' : 'Home · Motion pattern normal'}</p>
          </div>
          <div className={['flex h-18 w-18 items-center justify-center rounded-full border-4 text-center', isFallen ? 'border-rose-400' : 'border-emerald-300'].join(' ')}>
            <div>
              <p className="text-lg leading-none font-semibold">{isFallen ? '50' : '0'}</p>
              <p className="text-[8px] font-bold tracking-wide text-white/60 uppercase">Risk</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="p-4">
        <CardContent>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">Location Now</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {isFallen ? 'Toilet' : 'Living/Dining'} <span className="text-xs font-medium text-slate-400">· Home</span>
              </p>
            </div>
            <div
              className={[
                'rounded-xl px-3 py-2 text-center',
                isFallen ? 'border border-rose-200 bg-rose-50' : 'border border-emerald-200 bg-emerald-50',
              ].join(' ')}
            >
              <p className="text-[9px] font-bold tracking-wide text-rose-800 uppercase">Since</p>
              <p className={['text-sm font-extrabold', isFallen ? 'text-rose-800' : 'text-emerald-800'].join(' ')}>{isFallen ? '1:23 PM' : 'Stable'}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
            <svg viewBox="0 0 360 260" className="h-auto w-full" aria-label="Home floorplan">
              <rect x="8" y="8" width="344" height="244" rx="4" fill="#f8fafc" stroke="#0f172a" strokeWidth="5" />

              <rect x="20" y="20" width="145" height="115" fill="#f1f5f9" stroke="#0f172a" strokeWidth="2" />
              <rect x="165" y="20" width="105" height="115" fill="#f1f5f9" stroke="#0f172a" strokeWidth="2" />
              <rect x="270" y="55" width="70" height="80" fill="#f1f5f9" stroke="#0f172a" strokeWidth="2" />
              <rect x="78" y="150" width="148" height="90" fill="#f1f5f9" stroke="#0f172a" strokeWidth="2" />

              <line x1="20" y1="135" x2="340" y2="135" stroke="#0f172a" strokeWidth="2" />
              <line x1="270" y1="55" x2="270" y2="135" stroke="#0f172a" strokeWidth="2" />
              <line x1="226" y1="150" x2="226" y2="240" stroke="#0f172a" strokeWidth="2" />

              <text x="92" y="84" textAnchor="middle" fontSize="13" fontWeight="700">BEDROOM</text>
              <text x="217" y="78" textAnchor="middle" fontSize="12" fontWeight="700">LIVING/</text>
              <text x="217" y="94" textAnchor="middle" fontSize="12" fontWeight="700">DINING</text>
              <text x="305" y="99" textAnchor="middle" fontSize="12" fontWeight="700">KITCHEN</text>

              <text x="152" y="198" textAnchor="middle" fontSize="13" fontWeight="700" fill={isFallen ? '#9f1239' : '#166534'}>BATH</text>
            </svg>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

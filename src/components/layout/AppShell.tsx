import { useState } from 'react'
import { Bell, ChartNoAxesColumn, CircleDot, Moon, TriangleAlert } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import type { AlertFilter, FallStatus } from '../../types/monitoring'

type AlertOutletContext = {
  fallStatus: FallStatus
  filter: AlertFilter
  setFilter: (value: AlertFilter) => void
  count: number
  incrementReview: () => void
}

export function AppShell() {
  const location = useLocation()
  const fallStatus: FallStatus = 'not_fallen'
  const [count, setCount] = useState(0)
  const [filter, setFilter] = useState<AlertFilter>('all')

  return (
    <div className="flex min-h-screen justify-center bg-slate-50">
      <div className="relative h-dvh max-h-233 w-full max-w-107.5 overflow-hidden bg-slate-50">
        <div className="absolute inset-x-0 top-0 bottom-20.5 overflow-y-auto pb-6">
          <Outlet
            context={
              {
                fallStatus,
                filter,
                setFilter,
                count,
                incrementReview: () => setCount((value) => value + 1),
              } satisfies AlertOutletContext
            }
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 flex h-20.5 items-start border-t border-slate-200 bg-white/90 px-1 pt-2 pb-4 backdrop-blur-xl">
          {[
            { to: '/dashboard', icon: <CircleDot className="size-5" />, label: 'Dashboard' },
            { to: '/falls', icon: <ChartNoAxesColumn className="size-5" />, label: 'Falls' },
            { to: '/sleep', icon: <Moon className="size-5" />, label: 'Sleep' },
            { to: '/alerts', icon: <Bell className="size-5" />, label: 'Alerts' },
          ].map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                [
                  'relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-semibold',
                  isActive ? 'text-teal-700' : 'text-slate-400',
                ].join(' ')
              }
            >
              {tab.icon}
              {tab.label}
              {tab.to === '/alerts' ? (
                <span className="absolute top-0 right-[calc(50%-18px)] inline-flex size-4 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-[9px] font-extrabold text-white">
                  {fallStatus === 'fallen' ? 2 : 1}
                </span>
              ) : null}
            </NavLink>
          ))}
        </div>

        {location.pathname === '/dashboard' ? (
          <div
            className={[
              'pointer-events-none absolute top-2 right-4 rounded-full px-2 py-1 text-[10px] font-semibold',
              fallStatus === 'fallen'
                ? 'border border-rose-200 bg-rose-50 text-rose-700'
                : 'border border-emerald-200 bg-emerald-50 text-emerald-700',
            ].join(' ')}
          >
            <TriangleAlert className="mr-1 inline size-3" /> {fallStatus === 'fallen' ? 'Fall active' : 'No active fall'}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export type { AlertOutletContext }

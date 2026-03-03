import type { AlertItem, EventRow } from '../types/monitoring'

export const alerts: AlertItem[] = [
  {
    id: 'a1',
    severity: 'critical',
    icon: '🚨',
    title: 'Fall Detected — Living Room',
    subtitle: 'Moderate severity · EMS notified',
    time: '1d ago',
  },
  {
    id: 'a2',
    severity: 'warning',
    icon: '⚠️',
    title: 'Bathroom — No movement 18 min',
    subtitle: 'Longer than typical pattern',
    time: '2h ago',
  },
  {
    id: 'a3',
    severity: 'warning',
    icon: '💓',
    title: 'Elevated Heart Rate',
    subtitle: '102 bpm for 9 minutes · 6 AM',
    time: '6h ago',
  },
  {
    id: 'a4',
    severity: 'notice',
    icon: '🚶',
    title: 'Left home · 8:14 AM',
    subtitle: 'Returned at 9:02 AM — usual walk',
    time: '14h ago',
  },
  {
    id: 'a5',
    severity: 'notice',
    icon: '🌙',
    title: 'Late bedtime · 11:28 PM',
    subtitle: '1h 43m later than usual',
    time: '2d ago',
  },
  {
    id: 'a6',
    severity: 'notice',
    icon: '🏠',
    title: 'Left home · Extended walk',
    subtitle: 'Away 2h 14m — new route detected',
    time: '3d ago',
  },
  {
    id: 'a7',
    severity: 'ok',
    icon: '✅',
    title: 'Fall alert resolved',
    subtitle: 'Oct 18 near-fall — marked resolved',
    time: '4d ago',
  },
]

export const eventRows: EventRow[] = [
  ['13:23:24', '⬜', 'No one present', 'Motion: None · bmp: 0 · Not fallen', 'ok'],
  ['13:23:29', '🟢', 'Someone present · Active', 'Motion: Active · bmp: 18 · Not fallen', 'notice'],
  ['13:23:34', '🟢', 'Active movement', 'Motion: Active · bmp: 22 · Not fallen', 'notice'],
  ['13:23:39', '🚨', '⚡ FALL DETECTED', 'Motion: Active · bmp: 87 (spike) · Fallen', 'critical'],
  ['13:23:44', '🟡', 'Still — post-fall', 'Motion: Still · bmp: 1 · Fallen · No dwell yet', 'warning'],
  ['13:23:49', '🔴', 'Stationary dwell begins', 'Motion: Still · bmp: 1 · Fallen · Dwell present', 'critical'],
  ['13:23:54', '🔴', 'Dwell continues — no recovery', 'Motion: Still · bmp: 1 · Fallen · Dwell present', 'critical'],
  ['13:23:59', '🟡', 'Movement resumed — recovery attempt', 'Motion: Active · bmp: 14 · Fallen', 'warning'],
  ['13:24:04', '🟢', 'Recovered — upright', 'Motion: Active · bmp: 9 · Not fallen · No dwell', 'notice'],
  ['13:24:09', '⬜', 'Room empty — exited', 'Motion: None · bmp: 0 · Not fallen', 'ok'],
]

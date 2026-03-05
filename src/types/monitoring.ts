export type AlertFilter = 'all' | 'critical' | 'warning' | 'notice'

export type FallStatus = 'fallen' | 'not_fallen'

export type AlertIconType =
  | 'alert-triangle'
  | 'circle-info'
  | 'heart'
  | 'clock'
  | 'moon'
  | 'check-circle'
  | 'walking'

export type AlertItem = {
  id: string
  severity: Exclude<AlertFilter, 'all'> | 'ok'
  iconType: AlertIconType
  title: string
  detail: string
  context?: string
  time: string
}

export type EventRowTone = 'ok' | 'notice' | 'warning' | 'critical'

export type EventRow = readonly [
  time: string,
  title: string,
  subtitle: string,
  tone: EventRowTone,
]

export type WsFrame = {
  timestamp: string
  presence: boolean
  motion: 'none' | 'still' | 'active'
  bmp: number
  fallen: boolean
  dwell: boolean
  room: string
  heartRate?: number
}

export type SleepSession = {
  id: string
  date: string
  score: number
  deep_pct: number
  light_pct: number
  awake_pct: number
  duration_min: number
  avg_hr: number
  respiration: number
}

export type PatientContext = {
  frame: WsFrame | null
  connected: boolean
  fallStatus: FallStatus
  filter: AlertFilter
  setFilter: (v: AlertFilter) => void
}

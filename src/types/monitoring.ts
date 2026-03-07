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

export type Incident = {
  id: string
  started_at: string
  resolved_at: string | null
  source: 'camera' | 'sensor'
  severity: 'minor' | 'moderate' | 'critical'
  status: 'assessing' | 'needs_attention' | 'being_handled' | 'escalated' | 'resolved'
  headline: string
  locked_by: { name: string; action: string } | null
  narrative: string
  tags: Array<{ label: string; tone: 'info' | 'warning' | 'critical' }>
  voice: {
    responded: boolean | null
    response_time_seconds: number | null
    overall_emotion: string | null
    summary: string | null
    exchanges: Array<{
      speaker: 'resident' | 'aura'
      text: string
      emotion: string | null
      timestamp: string
    }>
  } | null
  video: {
    clip_url: string
    clip_duration_seconds: number
    fall_confirmed: 'confirmed' | 'not_confirmed' | 'uncertain'
    cause: string
    mobility: string
    injuries: string[]
    environment: string[]
    moments: Array<{
      time: string
      description: string
      significance: 'info' | 'warning' | 'critical'
    }>
  } | null
  detection: {
    posture_transition: string
    impact_intensity: 'low' | 'moderate' | 'high'
    confidence: number
    method: string
  } | null
  ai_assessment: {
    reasoning: string
    recommended_actions: string[]
  } | null
  event_timeline: Array<{
    timestamp: string
    label: string
    detail: string | null
  }>
  available_actions: Array<{
    id: 'ACK' | 'TALK_TO_AGENT' | 'TALK_TO_ELDERLY' | 'ACK_MONITOR'
    label: string
  }>
}

export type ResolvedIncident = {
  incident: Incident
  resolution: 'resolved' | 'false_alarm'
  resolvedAt: string
}

export type PatientContext = {
  frame: WsFrame | null
  connected: boolean
  fallStatus: FallStatus
  filter: AlertFilter
  setFilter: (v: AlertFilter) => void
  alertActions: Record<string, string>
  onAlertAction: (id: string, label: string) => void
  fallResolvedAt: string | null
  liveFallSnapshot: AlertItem | null
  resolvedIncident: ResolvedIncident | null
  onIncidentResolve: (type: 'resolved' | 'false_alarm', incident: Incident) => void
}

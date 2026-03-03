export type AlertFilter = 'all' | 'critical' | 'warning' | 'notice'

export type FallStatus = 'fallen' | 'not_fallen'

export type AlertItem = {
  id: string
  severity: Exclude<AlertFilter, 'all'> | 'ok'
  icon: string
  title: string
  subtitle: string
  time: string
}

export type EventRowTone = 'ok' | 'notice' | 'warning' | 'critical'

export type EventRow = readonly [
  time: string,
  icon: string,
  title: string,
  subtitle: string,
  tone: EventRowTone,
]

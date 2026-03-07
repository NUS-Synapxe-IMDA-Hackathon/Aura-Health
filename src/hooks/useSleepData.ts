import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { sleepSession as mockSession, weeklySleep as mockWeekly } from '../data/mock'

export type DbSleepSession = {
  id: string
  start_time: string
  end_time: string
  time_in_bed_minutes: number
  total_sleep_minutes: number
  total_awake_minutes: number
  total_light_minutes: number
  total_deep_minutes: number
  sleep_efficiency: number
  sleep_onset_latency_minutes: number
  waso_minutes: number
  sleep_quality_score: number
  avg_heart_rate: number
  avg_respiration_rate: number
  total_turns: number
  total_apnea_events: number
  times_out_of_bed: number
  out_of_bed_duration_minutes: number
  anomalies: string[]
}

export type DbInterval = {
  id: string
  sleep_session_id: string
  stage: 'awake' | 'light' | 'deep'
  start_time: string
  end_time: string
  duration_minutes: number
  avg_heart_rate: number
  avg_respiration_rate: number
  turns: number
  apnea_events: number
  abnormal_struggle: boolean
}

export type WeeklyDay = {
  bedtime: number   // decimal hour e.g. 22.5
  wake: number      // extended 24h e.g. 30.0
  deep: number      // percentage
  light: number
  awake: number
  score: number
  dayLabel: string
  hasAnomaly: boolean
  hasApnea: boolean
}

type SleepDataResult = {
  session: DbSleepSession | null
  intervals: DbInterval[]
  weekly: WeeklyDay[]
  weeklyIntervals: DbInterval[][]
  loading: boolean
  error: string | null
}

// Hardcoded until auth/resident selection is implemented
const RESIDENT_ID = '20000001-0000-4000-8000-000000000001'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function mapToWeeklyDay(s: DbSleepSession): WeeklyDay {
  const bed = new Date(s.start_time)
  const wake = new Date(s.end_time)
  const bedH = bed.getHours() + bed.getMinutes() / 60
  const wakeH = wake.getHours() + wake.getMinutes() / 60
  return {
    bedtime: bedH,
    wake: wakeH < 12 ? wakeH + 24 : wakeH,
    deep: Math.round((s.total_deep_minutes / s.time_in_bed_minutes) * 100),
    light: Math.round((s.total_light_minutes / s.time_in_bed_minutes) * 100),
    awake: Math.round((s.total_awake_minutes / s.time_in_bed_minutes) * 100),
    score: s.sleep_quality_score,
    dayLabel: DAY_NAMES[bed.getDay()],
    hasAnomaly: Array.isArray(s.anomalies) && s.anomalies.length > 0,
    hasApnea: s.total_apnea_events > 0,
  }
}

const MOCK_SESSION: DbSleepSession = {
  id: mockSession.id,
  start_time: '2026-03-03T14:00:00.000Z',
  end_time: '2026-03-03T22:00:00.000Z',
  time_in_bed_minutes: mockSession.duration_min,
  total_sleep_minutes: Math.round(mockSession.duration_min * (mockSession.deep_pct + mockSession.light_pct) / 100),
  total_awake_minutes: Math.round(mockSession.duration_min * mockSession.awake_pct / 100),
  total_light_minutes: Math.round(mockSession.duration_min * mockSession.light_pct / 100),
  total_deep_minutes: Math.round(mockSession.duration_min * mockSession.deep_pct / 100),
  sleep_efficiency: 89,
  sleep_onset_latency_minutes: 8,
  waso_minutes: 45,
  sleep_quality_score: mockSession.score,
  avg_heart_rate: mockSession.avg_hr,
  avg_respiration_rate: mockSession.respiration,
  total_turns: 7,
  total_apnea_events: 0,
  times_out_of_bed: 1,
  out_of_bed_duration_minutes: 8,
  anomalies: [],
}

const MOCK_WEEKLY: WeeklyDay[] = mockWeekly.map((d, i) => ({
  ...d,
  score: [72, 88, 38, 65, 80, 30, 88][i],
  dayLabel: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  hasAnomaly: i === 2 || i === 5,
  hasApnea: i === 2,
}))

export function useSleepData(): SleepDataResult {
  const [session, setSession] = useState<DbSleepSession | null>(null)
  const [intervals, setIntervals] = useState<DbInterval[]>([])
  const [weekly, setWeekly] = useState<WeeklyDay[]>([])
  const [weeklyIntervals, setWeeklyIntervals] = useState<DbInterval[][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) {
      setSession(MOCK_SESSION)
      setIntervals([])
      setWeekly(MOCK_WEEKLY)
      setWeeklyIntervals(MOCK_WEEKLY.map(() => []))
      setLoading(false)
      return
    }

    async function fetchData() {
      try {
        const { data: sessions, error: sessErr } = await supabase!
          .from('sleep_sessions')
          .select('*')
          .eq('resident_id', RESIDENT_ID)
          .order('start_time', { ascending: false })
          .limit(7)

        if (sessErr) throw sessErr
        if (!sessions || sessions.length === 0) {
          setLoading(false)
          return
        }

        const latest = sessions[0] as DbSleepSession
        const reversedSessions = [...sessions].reverse() as DbSleepSession[]

        setSession(latest)
        setWeekly(reversedSessions.map(s => mapToWeeklyDay(s)))

        // Fetch intervals for ALL sessions in one query
        const sessionIds = sessions.map(s => (s as DbSleepSession).id)
        const { data: allIvs, error: ivErr } = await supabase!
          .from('sleep_stage_intervals')
          .select('*')
          .in('sleep_session_id', sessionIds)
          .order('start_time', { ascending: true })

        if (ivErr) throw ivErr

        // Group intervals by session_id
        const intervalMap = new Map<string, DbInterval[]>()
        sessionIds.forEach(id => intervalMap.set(id, []));
        (allIvs ?? []).forEach(iv => {
          const arr = intervalMap.get((iv as DbInterval).sleep_session_id)
          if (arr) arr.push(iv as DbInterval)
        })

        setIntervals(intervalMap.get(latest.id) ?? [])
        setWeeklyIntervals(reversedSessions.map(s => intervalMap.get(s.id) ?? []))
      } catch (err) {
        console.error('[useSleepData]', err)
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { session, intervals, weekly, weeklyIntervals, loading, error }
}

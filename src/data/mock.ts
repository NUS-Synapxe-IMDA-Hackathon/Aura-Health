import type { AlertItem, EventRow, Incident, SleepSession } from '../types/monitoring'

export const alerts: AlertItem[] = [
  {
    id: 'a2',
    severity: 'warning',
    iconType: 'circle-info',
    title: 'No movement detected',
    detail: 'Bathroom · 18 minutes',
    context: 'Longer than his usual pattern',
    time: '6d ago',
    calledState: 'unresolved',
  },
  {
    id: 'a3',
    severity: 'warning',
    iconType: 'heart',
    title: 'Elevated heart rate',
    detail: '102 bpm · 9 minutes sustained',
    context: 'Detected at 6:00 AM during rest',
    time: '6d ago',
    calledState: 'unresolved',
  },
  {
    id: 'a4',
    severity: 'notice',
    iconType: 'clock',
    title: 'Morning walk',
    detail: 'Left 8:14 AM · Returned 9:02 AM',
    context: '48 minutes · Matches usual routine',
    time: '6d ago',
    calledState: null,
  },
  {
    id: 'a5',
    severity: 'notice',
    iconType: 'moon',
    title: 'Late bedtime',
    detail: '11:28 PM',
    context: '1h 43m later than his usual bedtime',
    time: '8d ago',
    calledState: null,
  },
  {
    id: 'a6',
    severity: 'notice',
    iconType: 'walking',
    title: 'Extended walk',
    detail: 'Away 2h 14m',
    time: '9d ago',
    calledState: null,
  },
  {
    id: 'a7',
    severity: 'critical',
    iconType: 'alert-triangle',
    title: 'Fall detected',
    detail: 'Living room',
    context: 'Emergency contacts notified',
    time: '10d ago',
    calledState: 'resolved',
  },
]

export const eventRows: EventRow[] = [
  ['1:23:24 PM', 'Living room was empty',          'No one present',                              'ok'],
  ['1:23:29 PM', 'Doris entered the living room',  'Normal movement detected',                    'notice'],
  ['1:23:39 PM', 'Fall detected — sudden impact',  'Significant body movement spike detected',    'critical'],
  ['1:23:49 PM', 'No movement after fall',         'Doris remains still on the floor',            'warning'],
  ['1:23:59 PM', 'EMS automatically notified',     'Emergency contacts alerted via app',          'critical'],
]

export const sleepSession: SleepSession = {
  id: 'ss-1',
  date: '2026-03-15',
  score: 88,
  deep_pct: 64,
  light_pct: 25,
  awake_pct: 11,
  duration_min: 480,
  avg_hr: 61,
  respiration: 15,
}

export const mockIncident: Incident = {
  id: 'inc-001',
  started_at: '2026-03-07T05:23:39.000Z',
  resolved_at: null,
  source: 'camera',
  severity: 'moderate',
  status: 'needs_attention',
  headline: 'Fall in Living Room',
  locked_by: null,
  narrative: 'Doris is initially standing in the living room. At 0:05, she begins to move forward and to the left. At 0:06, her legs buckle and she falls forward and down. By 0:07, she is on her hands and knees. At 0:08, she collapses fully onto her stomach, face down, and remains immobile in this position.',
  tags: [
    { label: 'Confirmed Fall', tone: 'critical' },
    { label: 'Collapse',       tone: 'warning'  },
    { label: 'Unable to Move', tone: 'warning'  },
  ],
  voice: {
    responded: true,
    response_time_seconds: 8,
    overall_emotion: 'distressed',
    summary: 'Doris sounds distressed. Responded after 8 seconds.',
    exchanges: [
      { speaker: 'aura',     text: 'I detected a fall. Are you okay?',  emotion: null,        timestamp: '2026-03-07T05:23:44.000Z' },
      { speaker: 'resident', text: 'Aiya... my leg pain...',            emotion: 'distressed', timestamp: '2026-03-07T05:23:47.000Z' },
      { speaker: 'aura',     text: "I've alerted your family.",         emotion: null,        timestamp: '2026-03-07T05:23:50.000Z' },
      { speaker: 'resident', text: 'Okay... thank you...',              emotion: 'distressed', timestamp: '2026-03-07T05:23:53.000Z' },
    ],
  },
  video: {
    clip_url: '/demo/fall-video.webm',
    clip_duration_seconds: 17,
    mime_type: 'video/webm',
    confidence: 90,
    fall_confirmed: 'confirmed',
    cause: 'Collapse',
    mobility: 'Unable to move',
    injuries: ['None visible'],
    summary: 'Doris is initially standing. At 0:05, she begins to move forward and left. At 0:06, her legs buckle and she falls. By 0:07 she is on her hands and knees. At 0:08 she collapses fully onto her stomach and remains immobile.',
    moments: [
      { time: '0:04',     description: 'Doris is standing and looking towards the camera',             significance: 'info'     },
      { time: '0:05',     description: 'Doris begins to move forward and to the left',                significance: 'info'     },
      { time: '0:06',     description: 'Legs buckle — Doris falls forward and down',                  significance: 'critical' },
      { time: '0:07',     description: 'Doris is on her hands and knees, torso bent forward',         significance: 'critical' },
      { time: '0:08',     description: 'Doris collapses completely onto her stomach, face down',       significance: 'critical' },
      { time: '0:09–0:17', description: 'Doris remains immobile on the floor in a prone position',    significance: 'critical' },
    ],
  },
  detection: {
    posture_transition: 'Standing → Prone',
    impact_intensity: 'moderate',
    confidence: 90,
    method: 'MoveNet pose detection',
  },
  ai_assessment: {
    reasoning: 'Leg buckling without an external trip hazard suggests a possible strength or balance episode rather than an environmental cause. This pattern warrants a follow-up mobility assessment. Doris was immobile for over 30 seconds post-fall and reported leg pain, which increases the likelihood of an injury that may not be immediately visible.',
    recommended_actions: [
      'Check on Doris immediately and assess for injury',
      'Clear the floor of all items — clothing and orange bag near sofa',
      'Repair or replace the damaged upholstery on the left armchair',
    ],
  },
  event_timeline: [
    { timestamp: '1:23:39 PM', label: 'Fall detected',                detail: 'MoveNet pose detection — Standing → Prone, 90% confidence' },
    { timestamp: '1:23:41 PM', label: 'Voice check-in started',       detail: 'AURA initiated voice contact with Doris' },
    { timestamp: '1:23:47 PM', label: 'Doris responded',              detail: 'Responded after 8 seconds, sounds distressed' },
    { timestamp: '1:23:50 PM', label: 'L1 escalation',                detail: 'Caregiver notified' },
    { timestamp: '1:23:59 PM', label: 'L2 escalation',                detail: 'Carelinks contacted — critical, unable to move' },
  ],
  available_actions: [
    { id: 'TALK_TO_ELDERLY', label: 'Talk to Doris' },
  ],
}

export const weeklyScores = [72, 88, 38, 65, 80, 30, 88]

// Daily fall risk scores for the past 28 days (oldest → newest, today = last entry)
// 0–33 = low, 34–66 = medium, 67–100 = high
export const monthlyRiskScores: number[] = [
  12, 14, 11, 16, 18, 13, 10,  // week 1 (Feb 7–13) — stable low
  15, 20, 22, 19, 24, 28, 25,  // week 2 (Feb 14–20) — slight uptick
  30, 35, 42, 38, 33, 28, 22,  // week 3 (Feb 21–27) — medium spike then recovery
  18, 16, 14, 12, 15, 14, 15,  // week 4 (Feb 28–Mar 7) — back to low
]

// bedtime / wake in extended 24h (e.g. 26 = 2 AM next day)
export const weeklySleep = [
  { bedtime: 22.5, wake: 28.5, deep: 58, light: 30, awake: 12 }, // Mon
  { bedtime: 22.0, wake: 30.0, deep: 64, light: 25, awake: 11 }, // Tue
  { bedtime: 23.5, wake: 28.5, deep: 35, light: 45, awake: 20 }, // Wed
  { bedtime: 22.8, wake: 29.3, deep: 52, light: 35, awake: 13 }, // Thu
  { bedtime: 22.2, wake: 29.7, deep: 60, light: 28, awake: 12 }, // Fri
  { bedtime: 23.8, wake: 27.8, deep: 28, light: 48, awake: 24 }, // Sat
  { bedtime: 22.0, wake: 30.0, deep: 64, light: 25, awake: 11 }, // Sun
]

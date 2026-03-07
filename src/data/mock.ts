import type { AlertItem, EventRow, Incident, SleepSession } from '../types/monitoring'

export const alerts: AlertItem[] = [
  {
    id: 'a2',
    severity: 'warning',
    iconType: 'circle-info',
    title: 'No movement detected',
    detail: 'Bathroom · 18 minutes',
    context: 'Longer than his usual pattern',
    time: '2h ago',
  },
  {
    id: 'a3',
    severity: 'warning',
    iconType: 'heart',
    title: 'Elevated heart rate',
    detail: '102 bpm · 9 minutes sustained',
    context: 'Detected at 6:00 AM during rest',
    time: '6h ago',
  },
  {
    id: 'a4',
    severity: 'notice',
    iconType: 'clock',
    title: 'Morning walk',
    detail: 'Left 8:14 AM · Returned 9:02 AM',
    context: '48 minutes · Matches usual routine',
    time: '14h ago',
  },
  {
    id: 'a5',
    severity: 'notice',
    iconType: 'moon',
    title: 'Late bedtime',
    detail: '11:28 PM',
    context: '1h 43m later than his usual bedtime',
    time: '2d ago',
  },
  {
    id: 'a6',
    severity: 'notice',
    iconType: 'walking',
    title: 'Extended walk',
    detail: 'Away 2h 14m',
    time: '3d ago',
  },
  {
    id: 'a7',
    severity: 'critical',
    iconType: 'alert-triangle',
    title: 'Fall detected',
    detail: 'Living room',
    context: 'Emergency contacts notified',
    time: '4d ago',
  },
]

export const eventRows: EventRow[] = [
  ['1:23:24 PM', 'Bathroom was empty',            'No one present',                             'ok'],
  ['1:23:29 PM', 'Alex entered the bathroom',   'Normal movement detected',                   'notice'],
  ['1:23:39 PM', 'Fall detected — sudden impact', 'Significant body movement spike detected',   'critical'],
  ['1:23:49 PM', 'No movement after fall',        'Alex remains still on the floor',            'warning'],
  ['1:23:59 PM', 'EMS automatically notified',    'Emergency contacts alerted via app',         'critical'],
]

export const sleepSession: SleepSession = {
  id: 'ss-1',
  date: '2026-03-04',
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
  severity: 'critical',
  status: 'needs_attention',
  headline: 'Fall in Living Room',
  locked_by: null,
  narrative: 'Alex tripped over a loose rug near the sofa and fell. He is responsive but sounds distressed. Motion has been minimal since impact.',
  tags: [
    { label: 'Trip',            tone: 'warning'  },
    { label: 'Limited Mobility', tone: 'warning' },
    { label: 'No Injuries',     tone: 'info'     },
  ],
  voice: {
    responded: true,
    response_time_seconds: 8,
    overall_emotion: 'distressed',
    summary: 'Resident sounds distressed. Responded after 8 seconds.',
    exchanges: [
      { speaker: 'aura',     text: 'Alex, are you okay? I detected a fall.',     emotion: null,         timestamp: '2026-03-07T05:23:44.000Z' },
      { speaker: 'resident', text: 'Aiya... my leg pain...',                        emotion: 'distressed',  timestamp: '2026-03-07T05:23:47.000Z' },
      { speaker: 'aura',     text: "I've alerted your family.",                     emotion: null,         timestamp: '2026-03-07T05:23:50.000Z' },
      { speaker: 'resident', text: 'Okay... thank you...',                          emotion: 'distressed',  timestamp: '2026-03-07T05:23:53.000Z' },
    ],
  },
  video: {
    clip_url: '',
    clip_duration_seconds: 15,
    mime_type: 'video/mp4',
    confidence: 94,
    fall_confirmed: 'confirmed',
    cause: 'Trip (rug)',
    mobility: 'Limited — unable to stand independently',
    injuries: ['None visible'],
    environment: ['Loose rug near sofa', 'Dim lighting'],
    summary: 'Alex tripped on a loose rug edge near the sofa, falling with high impact. Unable to stand independently after the fall.',
    moments: [
      { time: '0:01', description: 'Walking toward sofa',          significance: 'info'     },
      { time: '0:03', description: 'Foot catches rug edge',        significance: 'warning'  },
      { time: '0:04', description: 'Falls, hits floor',            significance: 'critical' },
      { time: '0:08', description: 'Tries to push up',             significance: 'warning'  },
      { time: '0:12', description: 'Gives up, stays down',         significance: 'warning'  },
    ],
  },
  detection: {
    posture_transition: 'Standing → Lying',
    impact_intensity: 'high',
    confidence: 94,
    method: 'MoveNet pose detection',
  },
  ai_assessment: {
    reasoning: 'Escalated because resident reports leg pain and is unable to stand independently. High-impact fall confirmed by camera with 94% confidence.',
    recommended_actions: [
      'Check for leg or hip injury',
      'Help resident to a safe position',
      'Remove or secure the loose rug',
    ],
  },
  event_timeline: [
    { timestamp: '1:23:39 PM', label: 'Fall detected',              detail: 'MoveNet pose detection confirmed posture change' },
    { timestamp: '1:23:41 PM', label: 'AI assessing',               detail: null },
    { timestamp: '1:23:44 PM', label: 'Voice check-in started',     detail: 'AURA initiated voice contact with Alex' },
    { timestamp: '1:23:47 PM', label: 'Alex responded',             detail: 'Responded after 8 seconds, sounds distressed' },
    { timestamp: '1:23:50 PM', label: 'You were notified',          detail: null },
    { timestamp: '1:23:59 PM', label: 'Emergency contacts alerted', detail: 'Family notified via app' },
  ],
  available_actions: [
    { id: 'ACK',             label: "I'm On My Way"  },
    { id: 'TALK_TO_AGENT',   label: 'Talk to AURA'   },
    { id: 'TALK_TO_ELDERLY', label: 'Talk to Alex' },
    { id: 'ACK_MONITOR',     label: 'Monitor'         },
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

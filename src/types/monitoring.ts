export type AlertFilter = "all" | "critical" | "warning" | "notice";

export type FallStatus = "fallen" | "not_fallen";

export type AlertIconType =
  | "alert-triangle"
  | "circle-info"
  | "heart"
  | "clock"
  | "moon"
  | "check-circle"
  | "walking";

export type AlertItem = {
  id: string;
  severity: Exclude<AlertFilter, "all"> | "ok";
  iconType: AlertIconType;
  title: string;
  detail: string;
  context?: string;
  time: string;
};

export type EventRowTone = "ok" | "notice" | "warning" | "critical";

export type EventRow = readonly [
  time: string,
  title: string,
  subtitle: string,
  tone: EventRowTone,
];

export type WsFrame = {
  timestamp: string;
  presence: boolean;
  motion: "none" | "still" | "active";
  bmp: number;
  fallen: boolean;
  dwell: boolean;
  room: string;
  heartRate?: number;
};

export type SleepSession = {
  id: string;
  date: string;
  score: number;
  deep_pct: number;
  light_pct: number;
  awake_pct: number;
  duration_min: number;
  avg_hr: number;
  respiration: number;
};

export type PatientContext = {
  frame: WsFrame | null;
  connected: boolean;
  fallStatus: FallStatus;
  filter: AlertFilter;
  setFilter: (v: AlertFilter) => void;
  alertActions: Record<string, string>;
  onAlertAction: (id: string, label: string) => void;
  fallResolvedAt: string | null;
  liveFallSnapshot: AlertItem | null;
};

// --- Caregiver Data Contract Types ---

// Shared
export type AiInsight = {
  summary: string;
  context: string;
  recommendation: string;
};

// Incident types
export type IncidentSeverity = "minor" | "moderate" | "critical";

export type IncidentStatus =
  | "assessing"
  | "needs_attention"
  | "being_handled"
  | "escalated"
  | "resolved";

export type IncidentActionId = "ACK" | "TALK_TO_AGENT" | "TALK_TO_ELDERLY" | "ACK_MONITOR";

export type Tag = {
  label: string;
  tone: "info" | "warning" | "critical";
};

export type VoiceExchange = {
  speaker: "resident" | "aura";
  text: string;
  emotion: string | null;
  timestamp: string;
};

export type VoiceData = {
  responded: boolean | null;
  response_time_seconds: number | null;
  overall_emotion: string | null;
  summary: string | null;
  exchanges: VoiceExchange[];
};

export type VideoMoment = {
  time: string;
  description: string;
  significance: "info" | "warning" | "critical";
};

export type VideoData = {
  clip_url: string;
  clip_duration_seconds: number;
  mime_type: string;
  confidence: number;
  fall_confirmed: "confirmed" | "not_confirmed" | "uncertain";
  cause: string;
  mobility: string;
  injuries: string[];
  environment: string[];
  moments: VideoMoment[];
  summary: string;
};

export type DetectionData = {
  posture_transition: string;
  impact_intensity: "low" | "moderate" | "high";
  confidence: number;
  method: string;
};

export type AiAssessment = {
  reasoning: string;
  recommended_actions: string[];
};

export type TimelineEntry = {
  timestamp: string;
  label: string;
  detail: string | null;
};

export type AvailableAction = {
  id: IncidentActionId;
  label: string;
};

export type LockedBy = {
  name: string;
  action: string;
};

export type Incident = {
  id: string;
  started_at: string;
  resolved_at: string | null;
  source: "camera" | "sensor";
  severity: IncidentSeverity;
  status: IncidentStatus;
  headline: string;
  locked_by: LockedBy | null;
  narrative: string;
  tags: Tag[];
  voice: VoiceData | null;
  video: VideoData | null;
  detection: DetectionData | null;
  ai_assessment: AiAssessment | null;
  event_timeline: TimelineEntry[];
  available_actions: AvailableAction[];
};

// Alert types
export type AlertCategory =
  | "vital_signs"
  | "bathroom_dwell"
  | "absence"
  | "room_hazard"
  | "risk_spike"
  | "sleep_anomaly"
  | "bed_exit"
  | "sedentary"
  | "wellness_checkin"
  | "post_fall_pattern";

export type AlertSeverityLevel = "warning" | "notice";

export type Alert = {
  id: string;
  severity: AlertSeverityLevel;
  category: AlertCategory;
  title: string;
  ai_insight: AiInsight;
  source_data: Record<string, any>;
  incident_id: string | null;
  resident_id: string;
  timestamp: string;
};

// Report types
export type ReportType = "daily_risk" | "sleep" | "post_incident" | "weekly_activity";

export type TrendPoint = {
  date: string;
  score: number;
};

export type MetricDeviation = {
  metric: string;
  current_value: string;
  baseline_value: string;
  deviation_percent: number;
  direction: "improved" | "declined";
};

export type ActivityClip = {
  clip_url: string;
  clip_type: "sit_to_stand" | "walking_bout" | "activity_snapshot";
  analysis: string;
  captured_at: string;
};

export type DailyRiskData = {
  risk_score: number;
  risk_level: "low" | "moderate" | "high" | "critical";
  previous_score: number;
  trend: "improving" | "stable" | "declining";
  trend_data: TrendPoint[];
  metric_deviations: MetricDeviation[];
  activity_clips: ActivityClip[];
};

export type SleepStages = {
  deep_pct: number;
  light_pct: number;
  awake_pct: number;
};

export type SleepVitals = {
  avg_heart_rate: number;
  avg_respiration: number;
  apnea_events: number;
};

export type SleepDisruptions = {
  times_out_of_bed: number;
  out_of_bed_duration_minutes: number;
  abnormal_struggle: boolean;
  turns: number;
};

export type SleepTrendPoint = {
  date: string;
  score: number;
  duration_minutes: number;
};

export type SleepData = {
  sleep_score: number;
  sleep_rating: "good" | "average" | "poor";
  previous_score: number;
  duration_minutes: number;
  bed_entry: string;
  bed_exit: string;
  stages: SleepStages;
  vitals: SleepVitals;
  disruptions: SleepDisruptions;
  anomalies: string[];
  trend_data: SleepTrendPoint[];
};

export type FallFrequency = {
  last_30_days: number;
  last_90_days: number;
  trend: "increasing" | "stable" | "decreasing";
};

export type EnvironmentalFactor = {
  factor: string;
  severity: "low" | "medium" | "high";
  status: "new" | "persistent" | "resolved";
  recommendation: string;
};

export type RiskImpact = {
  score_before: number;
  score_after: number;
  contributing_factors: string[];
};

export type ResponseMetrics = {
  detection_to_assessment_seconds: number;
  detection_to_caregiver_notification_seconds: number;
  caregiver_response_seconds: number | null;
  total_resolution_seconds: number;
};

export type PostIncidentData = {
  incident: Incident;
  fall_frequency: FallFrequency;
  environmental_factors: EnvironmentalFactor[];
  risk_impact: RiskImpact;
  response_metrics: ResponseMetrics;
};

export type WeeklyPeriod = {
  start: string;
  end: string;
};

export type MovementMetrics = {
  avg_sit_to_stand_count: number;
  avg_sit_to_stand_duration_ms: number;
  avg_walking_bouts_per_day: number;
  avg_gait_speed: string;
  shuffling_score: number;
};

export type PostureDistribution = {
  standing_pct: number;
  sitting_pct: number;
  lying_pct: number;
  walking_pct: number;
};

export type WeeklyComparison = {
  metric: string;
  this_week: string;
  last_week: string;
  change: string;
  direction: "improved" | "declined" | "stable";
};

export type NotableEvent = {
  description: string;
  severity: "info" | "warning" | "critical";
};

export type Highlight = {
  clip_url: string;
  clip_type: string;
  description: string;
  captured_at: string;
};

export type WeeklyActivityData = {
  period: WeeklyPeriod;
  movement: MovementMetrics;
  posture_distribution: PostureDistribution;
  comparison: WeeklyComparison[];
  notable_events: NotableEvent[];
  highlights: Highlight[];
};

export type Report = {
  id: string;
  type: ReportType;
  resident_id: string;
  generated_at: string;
  ai_insight: AiInsight;
  data: DailyRiskData | SleepData | PostIncidentData | WeeklyActivityData;
};

-- Seed data for Aura-Health caregiver app
-- All rows use resident_id = '20000001-0000-4000-8000-000000000001'

-- ============================================================
-- ALERTS TABLE (create if not exists)
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  severity TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  ai_insight_summary TEXT NOT NULL DEFAULT '',
  ai_insight_context TEXT NOT NULL DEFAULT '',
  ai_insight_recommendation TEXT NOT NULL DEFAULT '',
  source_data JSONB NOT NULL DEFAULT '{}',
  incident_id TEXT,
  resident_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INCIDENTS TABLE (create if not exists)
-- ============================================================
CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  severity TEXT NOT NULL,
  source TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  resident_id TEXT NOT NULL,
  headline TEXT NOT NULL,
  locked_by JSONB,
  narrative TEXT NOT NULL DEFAULT '',
  tags JSONB NOT NULL DEFAULT '[]',
  voice JSONB,
  video JSONB,
  detection JSONB,
  ai_assessment JSONB,
  event_timeline JSONB NOT NULL DEFAULT '[]',
  available_actions JSONB NOT NULL DEFAULT '[]'
);

-- ============================================================
-- REPORTS TABLE (create if not exists)
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  resident_id TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ai_insight JSONB NOT NULL DEFAULT '{}',
  data JSONB NOT NULL DEFAULT '{}'
);

-- ============================================================
-- SEED: ALERTS
-- ============================================================
INSERT INTO alerts (id, severity, category, title, ai_insight_summary, ai_insight_context, ai_insight_recommendation, source_data, incident_id, resident_id, timestamp)
VALUES
  ('alert-001', 'warning', 'vital_signs', 'Elevated heart rate',
   '102 bpm sustained for 9 minutes', 'Detected at 6:00 AM during rest period', 'Monitor for next hour; escalate if sustained above 110 bpm',
   '{"bpm": 102, "duration_minutes": 9}', NULL,
   '20000001-0000-4000-8000-000000000001', now() - interval '6 hours'),

  ('alert-002', 'warning', 'bathroom_dwell', 'No movement detected',
   'Bathroom · 18 minutes', 'Longer than his usual 8-minute pattern', 'Check in via voice if exceeds 25 minutes',
   '{"room": "bathroom", "dwell_minutes": 18}', NULL,
   '20000001-0000-4000-8000-000000000001', now() - interval '2 hours'),

  ('alert-003', 'notice', 'sedentary', 'Morning walk',
   'Left 8:14 AM · Returned 9:02 AM', '48 minutes — matches usual routine', 'No action needed',
   '{"departed": "08:14", "returned": "09:02"}', NULL,
   '20000001-0000-4000-8000-000000000001', now() - interval '14 hours'),

  ('alert-004', 'notice', 'sleep_anomaly', 'Late bedtime',
   '11:28 PM', '1h 43m later than his usual bedtime', 'Track if pattern persists over 3 consecutive nights',
   '{"bedtime": "23:28"}', NULL,
   '20000001-0000-4000-8000-000000000001', now() - interval '2 days'),

  ('alert-005', 'notice', 'absence', 'Extended walk',
   'Away 2h 14m', 'Returned safely; no distress detected', 'No action needed',
   '{"duration_minutes": 134}', NULL,
   '20000001-0000-4000-8000-000000000001', now() - interval '3 days'),

  ('alert-006', 'warning', 'risk_spike', 'Fall detected',
   'Living room', 'Emergency contacts notified', 'Immediate caregiver response required',
   '{"room": "living_room"}', 'inc-seed-001',
   '20000001-0000-4000-8000-000000000001', now() - interval '4 days'),

  ('alert-007', 'notice', 'wellness_checkin', 'Daily wellness check completed',
   'All vitals normal', 'Morning routine completed on schedule', 'Continue daily monitoring',
   '{}', NULL,
   '20000001-0000-4000-8000-000000000001', now() - interval '1 day'),

  ('alert-008', 'warning', 'vital_signs', 'Low heart rate detected',
   '48 bpm for 5 minutes', 'During afternoon nap', 'Monitor; normal range for sleep is 45-55 bpm',
   '{"bpm": 48, "duration_minutes": 5}', NULL,
   '20000001-0000-4000-8000-000000000001', now() - interval '5 hours'),

  ('alert-009', 'notice', 'bed_exit', 'Night-time bed exit',
   'Out of bed 3:14 AM — 12 minutes', 'Bathroom visit; returned safely', 'Track frequency this week',
   '{"exit_time": "03:14", "duration_minutes": 12}', NULL,
   '20000001-0000-4000-8000-000000000001', now() - interval '18 hours'),

  ('alert-010', 'notice', 'post_fall_pattern', 'Reduced mobility noted',
   'Sit-to-stand count down 30% this week', 'Following fall incident 4 days ago', 'Schedule physiotherapy assessment',
   '{"sit_to_stand_change": -30}', 'inc-seed-001',
   '20000001-0000-4000-8000-000000000001', now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED: INCIDENTS
-- ============================================================
INSERT INTO incidents (id, status, severity, source, started_at, resolved_at, resident_id, headline, locked_by, narrative, tags, voice, video, detection, ai_assessment, event_timeline, available_actions)
VALUES
  ('inc-seed-001', 'resolved', 'critical', 'camera',
   now() - interval '4 days', now() - interval '4 days' + interval '15 minutes',
   '20000001-0000-4000-8000-000000000001',
   'Fall in Living Room', NULL,
   'Alex tripped over a loose rug near the sofa and fell. He was responsive but sounded distressed. Motion was minimal after impact.',
   '[{"label":"Trip","tone":"warning"},{"label":"Limited Mobility","tone":"warning"},{"label":"No Injuries","tone":"info"}]',
   '{"responded":true,"response_time_seconds":8,"overall_emotion":"distressed","summary":"Resident sounds distressed. Responded after 8 seconds.","exchanges":[{"speaker":"aura","text":"Alex, are you okay? I detected a fall.","emotion":null,"timestamp":"2026-03-05T05:23:44.000Z"},{"speaker":"resident","text":"Aiya... my leg pain...","emotion":"distressed","timestamp":"2026-03-05T05:23:47.000Z"}]}',
   '{"clip_url":"","clip_duration_seconds":15,"mime_type":"video/mp4","confidence":94,"fall_confirmed":"confirmed","cause":"Trip (rug)","mobility":"Limited — unable to stand independently","injuries":["None visible"],"environment":["Loose rug near sofa","Dim lighting"],"summary":"Alex tripped on a loose rug edge near the sofa.","moments":[{"time":"0:01","description":"Walking toward sofa","significance":"info"},{"time":"0:03","description":"Foot catches rug edge","significance":"warning"},{"time":"0:04","description":"Falls, hits floor","significance":"critical"}]}',
   '{"posture_transition":"Standing → Lying","impact_intensity":"high","confidence":94,"method":"MoveNet pose detection"}',
   '{"reasoning":"Escalated because resident reports leg pain and is unable to stand independently.","recommended_actions":["Check for leg or hip injury","Help resident to a safe position","Remove or secure the loose rug"]}',
   '[{"timestamp":"1:23:39 PM","label":"Fall detected","detail":"MoveNet pose detection confirmed posture change"},{"timestamp":"1:23:44 PM","label":"Voice check-in started","detail":"AURA initiated voice contact"},{"timestamp":"1:23:50 PM","label":"Caregiver notified","detail":null},{"timestamp":"1:38:39 PM","label":"Resolved","detail":"Caregiver confirmed safe"}]',
   '[{"id":"ACK","label":"I''m On My Way"},{"id":"TALK_TO_AGENT","label":"Talk to AURA"},{"id":"TALK_TO_ELDERLY","label":"Talk to Alex"}]'),

  ('inc-seed-002', 'resolved', 'moderate', 'sensor',
   now() - interval '12 days', now() - interval '12 days' + interval '8 minutes',
   '20000001-0000-4000-8000-000000000001',
   'Bathroom Slip', NULL,
   'Sensor detected sudden impact in bathroom. Alex was able to get up on his own after a brief pause.',
   '[{"label":"Slip","tone":"warning"},{"label":"Self-recovered","tone":"info"}]',
   '{"responded":true,"response_time_seconds":5,"overall_emotion":"surprised","summary":"Resident recovered independently.","exchanges":[]}',
   NULL,
   '{"posture_transition":"Standing → Sitting","impact_intensity":"moderate","confidence":78,"method":"mmWave radar"}',
   '{"reasoning":"Moderate impact detected but resident self-recovered within 30 seconds.","recommended_actions":["Install bathroom grab bars","Check floor for wet spots"]}',
   '[{"timestamp":"9:15:00 AM","label":"Impact detected","detail":"mmWave radar detected sudden posture change"},{"timestamp":"9:15:30 AM","label":"Self-recovery","detail":"Resident stood up independently"},{"timestamp":"9:23:00 AM","label":"Resolved","detail":"No assistance needed"}]',
   '[]')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED: REPORTS (daily_risk with 28-day trend)
-- ============================================================
INSERT INTO reports (id, type, resident_id, generated_at, ai_insight, data)
VALUES
  ('rpt-daily-001', 'daily_risk',
   '20000001-0000-4000-8000-000000000001',
   now(),
   '{"summary":"Fall risk is currently low","context":"Stable vitals and normal activity patterns","recommendation":"Continue regular monitoring"}',
   '{
     "risk_score": 15,
     "risk_level": "low",
     "previous_score": 14,
     "trend": "stable",
     "trend_data": [
       {"date":"2026-02-09","score":12},{"date":"2026-02-10","score":14},
       {"date":"2026-02-11","score":11},{"date":"2026-02-12","score":16},
       {"date":"2026-02-13","score":18},{"date":"2026-02-14","score":13},
       {"date":"2026-02-15","score":10},{"date":"2026-02-16","score":15},
       {"date":"2026-02-17","score":20},{"date":"2026-02-18","score":22},
       {"date":"2026-02-19","score":19},{"date":"2026-02-20","score":24},
       {"date":"2026-02-21","score":28},{"date":"2026-02-22","score":25},
       {"date":"2026-02-23","score":30},{"date":"2026-02-24","score":35},
       {"date":"2026-02-25","score":42},{"date":"2026-02-26","score":38},
       {"date":"2026-02-27","score":33},{"date":"2026-02-28","score":28},
       {"date":"2026-03-01","score":22},{"date":"2026-03-02","score":18},
       {"date":"2026-03-03","score":16},{"date":"2026-03-04","score":14},
       {"date":"2026-03-05","score":12},{"date":"2026-03-06","score":15},
       {"date":"2026-03-07","score":14},{"date":"2026-03-08","score":15}
     ],
     "metric_deviations": [],
     "activity_clips": []
   }')
ON CONFLICT (id) DO NOTHING;

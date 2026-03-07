# Caregiver App Data Contract — Design Document

> **Version:** 1.0 | **Date:** 2026-03-06 | **Status:** Approved
> Defines all data objects, delivery mechanisms, and persistence for communication between aura-ai and Aura-Health (caregiver app).

---

## Table of Contents

1. [Overview](#1-overview)
2. [Data Objects](#2-data-objects)
   - 2.1 [Incident (Critical — Falls Only)](#21-incident-critical--falls-only)
   - 2.2 [Alert (Warning / Notice)](#22-alert-warning--notice)
   - 2.3 [Report (Periodic Summaries)](#23-report-periodic-summaries)
3. [Delivery Mechanism](#3-delivery-mechanism)
4. [Persistence Layer (Supabase)](#4-persistence-layer-supabase)
5. [Elderly App (Future — Mental Note)](#5-elderly-app-future--mental-note)

---

## 1. Overview

Three data objects flow from aura-ai to the Aura-Health caregiver app:

| Object | Severity | Delivery | Persistence | Caregiver Actions |
|--------|----------|----------|-------------|-------------------|
| **Incident** | Critical (falls only) | WebSocket push (real-time) | Supabase Postgres | Backend-tracked, first-responder-wins |
| **Alert** | Warning / Notice | WebSocket push (real-time) | Supabase Postgres | Frontend-only dismiss/ack |
| **Report** | Informational | REST API (pull on demand) | Supabase Postgres | Read-only |

Video clips and images are stored in **Supabase Storage** with signed URLs.

### Design Principles

- **Caregiver-first structure** — Data objects are shaped by what the caregiver sees on screen, not by which backend agent produced the data. Field names are human-readable, not system internals.
- **Progressive enrichment** — Incidents arrive incomplete and fill in over 30 seconds as agents produce results. Each section is nullable.
- **Narrative over data** — AI-generated text summaries tell the story. Raw metrics are available but secondary.
- **Three-field AI insight pattern** — `summary` (bold one-liner), `context` (expandable reasoning), `recommendation` (clear action). Used consistently across Alerts and Reports.

---

## 2. Data Objects

### 2.1 Incident (Critical — Falls Only)

An Incident represents a fall event with a full stateful lifecycle. It is the only object that requires backend-tracked caregiver actions. The structure maps directly to the mobile incident detail screen.

#### Visual Layout

The Incident object maps 1:1 to the caregiver's screen, top to bottom:

```
+----------------------------------+
| CRITICAL                         |  <-- severity + status
| Fall in Living Room              |  <-- headline
| 2 min ago                        |
+----------------------------------+
|                                  |
| Uncle Tan tripped over a loose   |  <-- narrative
| rug near the sofa and fell.      |
| He is responsive but sounds      |
| distressed.                      |
|                                  |
| [Trip] [Limited] [No injury]    |  <-- tags
+----------------------------------+
| What Uncle Tan Said              |
|                                  |
| "Aiya... my leg pain"           |  <-- voice.exchanges
| AURA: "I've alerted your family" |
| "Okay... thank you"             |
|                                  |
| Resident sounds distressed.      |  <-- voice.summary
| Responded after 8 seconds.       |
+----------------------------------+
| What the Camera Saw              |
|                                  |
| +------------------------------+ |
| |        > Video Player        | |  <-- video.clip_url
| |          0:04 / 0:15         | |
| +------------------------------+ |
|                                  |
| 0:01  o  Walking toward sofa     |  <-- video.moments
| 0:03  !  Foot catches rug edge  |      (tappable = seek video)
| 0:04  X  Falls, hits floor       |
| 0:08  o  Tries to push up       |
| 0:12  !  Gives up, stays down   |
|                                  |
| Cause: Trip (rug)                |
| Mobility: Limited                |
| Injuries: None visible           |
| Environment: Loose rug, dim light|
+----------------------------------+
| Detection Snapshot  [collapse]   |
| Posture: Standing -> Lying       |  <-- detection
| Impact: High                     |
| Confidence: 94%                  |
+----------------------------------+
| AI Assessment                    |
|                                  |
| "Escalated to L1 because         |  <-- ai_assessment.reasoning
| resident reports leg pain and is |
| unable to stand independently."  |
|                                  |
| Recommended:                     |
| - Check for leg/hip injury       |  <-- ai_assessment.recommended_actions
| - Help resident to safe position |
| - Remove loose rug               |
+----------------------------------+
| Timeline              [collapse] |
|                                  |
| 10:30:00  Fall detected          |  <-- event_timeline
| 10:30:02  AI assessing           |
| 10:30:05  Voice check-in started |
| 10:30:08  Uncle Tan responded    |
| 10:30:10  You were notified      |
| 10:30:25  Video analyzed         |
+----------------------------------+
|                                  |
| [I'm On My Way] [Talk to AURA] |  <-- available_actions
| [Talk to Uncle Tan]   [Monitor] |
|                                  |
+----------------------------------+
```

#### TypeScript Type

```typescript
type Incident = {
  id: string
  started_at: string                  // ISO 8601
  resolved_at: string | null
  source: "camera" | "sensor"

  // -- Top Banner --
  severity: "minor" | "moderate" | "critical"
  status: "assessing" | "needs_attention" | "being_handled" | "escalated" | "resolved"
  headline: string                    // "Fall in Living Room"

  // Lock (who's handling it)
  locked_by: {
    name: string                      // "Mary Tan"
    action: string                    // "On the way", "Talking to AURA"
  } | null

  // -- Narrative --
  // AI-generated, updated as more evidence arrives
  narrative: string                   // "Uncle Tan tripped over a loose rug..."

  // -- Quick Tags --
  tags: Array<{
    label: string                     // "Trip", "Limited Mobility", "No Injuries"
    tone: "info" | "warning" | "critical"
  }>

  // -- Voice: What the Resident Said --
  voice: {
    responded: boolean | null         // null = still waiting, true/false after timeout
    response_time_seconds: number | null
    overall_emotion: string | null    // "calm", "distressed", "in_pain", "fearful"
    summary: string | null            // "Resident sounds distressed. Responded after 8s."
    exchanges: Array<{
      speaker: "resident" | "aura"
      text: string
      emotion: string | null          // only for resident turns
      timestamp: string
    }>
  } | null                            // null until voice interaction starts

  // -- Video: What the Camera Saw --
  video: {
    clip_url: string                  // Supabase Storage signed URL
    clip_duration_seconds: number
    mime_type: string                 // "video/webm" | "video/mp4"
    confidence: number                // 0.0 - 1.0
    fall_confirmed: "confirmed" | "not_confirmed" | "uncertain"
    cause: string                     // "Trip (rug)"
    mobility: string                  // "Limited -- unable to stand"
    injuries: string[]                // ["None visible"] or ["Possible bruising on left arm"]
    environment: string[]             // ["Loose rug near sofa", "Dim lighting"]
    moments: Array<{
      time: string                    // "0:03" -- tappable to seek video to that point
      description: string
      significance: "info" | "warning" | "critical"
    }>
    summary: string                   // raw text fallback from vision agent
  } | null                            // null until video analyzed (~20-30s)

  // -- Detection Snapshot (collapsible) --
  detection: {
    posture_transition: string        // "Standing -> Lying"
    impact_intensity: "low" | "moderate" | "high"
    confidence: number                // detection confidence percentage
    method: string                    // "MoveNet pose detection" | "mmWave radar"
  } | null                            // null for mmWave falls (no MoveNet data)

  // -- AI Assessment --
  ai_assessment: {
    reasoning: string                 // plain English: why this escalation level
    recommended_actions: string[]     // ["Check for leg/hip injury", "Remove loose rug"]
  } | null                            // null until coordinator runs (~2-5s)

  // -- Event Timeline (collapsible audit trail) --
  event_timeline: Array<{
    timestamp: string
    label: string                     // "Fall detected", "Uncle Tan responded"
    detail: string | null             // optional extra context
  }>

  // -- Available Actions --
  available_actions: Array<{
    id: "ACK" | "TALK_TO_AGENT" | "TALK_TO_ELDERLY" | "ACK_MONITOR"
    label: string                     // "I'm On My Way", "Talk to AURA", etc.
  }>
}
```

#### Progressive Arrival Pattern

Incident data arrives incrementally over ~30 seconds. The frontend renders whatever is available and fills in sections as they arrive via WebSocket updates.

```
0s      Incident created
        headline: "Fall in Living Room"
        status: "assessing"
        narrative: "Fall detected, checking on Uncle Tan..."
        tags: [{ label: "Checking", tone: "warning" }]
        detection: { posture_transition: "Standing -> Lying", impact_intensity: "high", ... }
        voice: null
        video: null
        ai_assessment: null
        available_actions: []

2-5s    Coordinator assessment arrives
        ai_assessment: { reasoning: "...", recommended_actions: [...] }
        narrative: updated with coordinator findings
        tags: updated (e.g., severity tags added)
        status: "needs_attention"
        available_actions: populated with action buttons

5-15s   Voice exchanges trickle in (each exchange = separate WS update)
        voice: { responded: true, exchanges: [...], summary: "...", ... }
        narrative: updated with voice findings ("...sounds distressed")

20-30s  Video analysis arrives
        video: { clip_url, cause, moments, injuries, environment, ... }
        narrative: final update with complete picture
        tags: finalized (e.g., ["Trip", "Limited Mobility", "No Injuries"])
```

#### Incident Actions

Actions are backend-tracked with first-responder-wins atomic locking. The first caregiver to act locks the incident.

| Action ID | Button Label | Effect |
|-----------|-------------|--------|
| `ACK` | "I'm On My Way" | Cancels escalation timer. Status -> "being_handled". |
| `TALK_TO_AGENT` | "Talk to AURA" | Cancels escalation timer. Opens voice channel to AI agent. |
| `TALK_TO_ELDERLY` | "Talk to Uncle Tan" | Cancels escalation timer. Opens voice channel to resident. |
| `ACK_MONITOR` | "Monitor" | Cancels escalation timer. System continues monitoring. |

Once locked, all other connected caregivers see:
```json
{ "type": "incident_locked", "incident_id": "...", "locked_by": { "name": "Mary Tan", "action": "On the way" } }
```

#### Incident Status Values

| Status | Meaning | Triggered By |
|--------|---------|-------------|
| `assessing` | AI agents are analyzing the fall | Incident creation |
| `needs_attention` | Coordinator assessed, waiting for caregiver response | Coordinator decision (L1+) |
| `being_handled` | A caregiver has taken action | First-responder lock |
| `escalated` | No caregiver response, CareLinks 24/7 contacted | 120s timeout (L2) |
| `resolved` | Incident closed | Caregiver action or recovery detected |

---

### 2.2 Alert (Warning / Notice)

Alerts are fire-and-inform notifications for everything other than falls. They carry structured AI insight but do not require backend-tracked actions. Dismiss/acknowledge is frontend-only state.

#### TypeScript Type

```typescript
type AlertCategory =
  | "vital_signs"         // HR/respiration anomaly (Flow 9)
  | "bathroom_dwell"      // Prolonged stationary in bathroom (Flow 7)
  | "absence"             // No presence detected anywhere (Flow 7)
  | "room_hazard"         // New or persistent hazard (Flow 3)
  | "risk_spike"          // Risk score sudden increase (Flow 2)
  | "sleep_anomaly"       // Poor sleep, abnormal struggle (Flow 6)
  | "bed_exit"            // Night-time bed exit concern (Flow 8)
  | "sedentary"           // Prolonged inactivity (Flow 10)
  | "wellness_checkin"    // Concerning check-in response (Flow 4)
  | "post_fall_pattern"   // Post-fall behavioral change (Flow 10)

type Alert = {
  id: string
  severity: "warning" | "notice"
  category: AlertCategory
  title: string                       // "Elevated Heart Rate Detected"

  // Structured AI insight
  ai_insight: {
    summary: string                   // Bold one-liner for the alert card
    context: string                   // Expandable reasoning section
    recommendation: string            // Clear action call-out
  }

  // Raw data that triggered the alert
  source_data: Record<string, any>    // { heart_rate: 115, baseline_avg: 89, duration_minutes: 15 }

  // Optional link to a fall incident
  incident_id: string | null

  resident_id: string
  timestamp: string                   // ISO 8601
}
```

#### Alert Card Layout

Each alert renders as a card in the Alerts page with three visual sections:

```
+----------------------------------+
| ! Elevated Heart Rate Detected   |  <-- title + severity icon/color
|   warning  |  vital_signs        |  <-- severity badge + category
+----------------------------------+
| Heart rate 28% above 7-day       |  <-- ai_insight.summary (bold)
| baseline                         |
+----------------------------------+
| [v] More details                 |  <-- expandable
|                                  |
| HR sustained at 115bpm for 15    |  <-- ai_insight.context
| minutes. No movement detected.   |
| Similar pattern last Tuesday     |
| preceded a fever.                |
|                                  |
| Recommended:                     |
| Check if resident is feeling     |  <-- ai_insight.recommendation
| warm or unwell. Consider         |
| temperature check.               |
+----------------------------------+
| [Dismiss]          [Check In]   |  <-- frontend-only actions
+----------------------------------+
```

#### Complete Alert Catalog

All alert triggers mapped to their source flows, severity, and example AI insight summaries:

| Category | Trigger | Source Flow | Severity | Example `ai_insight.summary` |
|----------|---------|------------|----------|------------------------------|
| `vital_signs` | Sustained severe HR/respiration | Flow 9 | warning | "Heart rate 28% above 7-day baseline" |
| `vital_signs` | Apnea trend over multiple nights | Flow 9 | notice | "Apnea events trending up: 3 -> 8 -> 12 over 3 nights" |
| `bathroom_dwell` | >15min still in bathroom | Flow 7 | warning | "18 minutes stationary in bathroom -- 2.5x typical duration" |
| `absence` | No presence in any room >2hr | Flow 7 | warning | "No activity detected since 2:30pm -- unusual for this time" |
| `room_hazard` | New hazard detected | Flow 3 | notice | "Object detected near bathroom entrance -- trip risk" |
| `room_hazard` | Persistent hazard 3+ days | Flow 3 | warning | "Loose rug still present after 4 days -- previous fall involved this area" |
| `risk_spike` | Score jump >20 points in 3 days | Flow 2 | warning | "Fall risk score jumped 45 -> 72 -- gait speed declined 15%" |
| `sleep_anomaly` | Sleep <4h or >12h | Flow 6 | warning | "Only 3.5 hours sleep -- flagged as abnormally short" |
| `sleep_anomaly` | Abnormal struggle during sleep | Flow 6 | warning | "Abnormal physical struggle detected during sleep at 3:15am" |
| `sleep_anomaly` | Poor sleep 3+ consecutive nights | Flow 6 | notice | "3rd consecutive night with quality score below 40" |
| `bed_exit` | Not returned to bed >20min | Flow 8 | warning | "Left bed 25 minutes ago, not detected in any room" |
| `bed_exit` | 3+ exits in one night | Flow 8 | notice | "4 bed exits tonight -- possible discomfort or UTI pattern" |
| `sedentary` | >2hr sitting/dwell | Flow 10 | notice | "Sitting in living room for 2.5 hours -- longest this week" |
| `wellness_checkin` | Confused/disoriented response | Flow 4 | warning | "Morning check-in: Uncle Tan sounded confused, couldn't recall yesterday" |
| `post_fall_pattern` | Sedentary increase >2 weeks post-fall | Flow 10 | notice | "Activity down 40% since fall on Feb 20 -- may benefit from physio" |

#### Severity Guide

| Severity | Color | Meaning | Examples |
|----------|-------|---------|----------|
| `warning` | Amber | Needs caregiver awareness soon, potential safety concern | Vital sign anomaly, bathroom dwell, absence, risk spike |
| `notice` | Teal | Informational, review when convenient | Sleep trend, minor hazard, sedentary pattern, bed exit frequency |

Falls are **never** alerts -- they are always Incidents (critical severity, rose color).

---

### 2.3 Report (Periodic Summaries)

Reports are generated periodically and fetched on demand via REST. Each report carries structured data for charts/visualizations plus a three-field AI insight summary.

#### Common Report Structure

```typescript
type ReportType = "daily_risk" | "sleep" | "post_incident" | "weekly_activity"

type Report = {
  id: string
  type: ReportType
  resident_id: string
  generated_at: string                // ISO 8601

  // Common AI summary (three-field pattern)
  ai_insight: {
    summary: string                   // Bold one-liner
    context: string                   // Expandable reasoning
    recommendation: string            // Clear action call-out
  }

  // Type-specific payload (see below)
  data: DailyRiskData | SleepData | PostIncidentData | WeeklyActivityData
}
```

#### Report Generation Schedule

| Report Type | Trigger | Frequency |
|-------------|---------|-----------|
| `daily_risk` | End of day or on-demand | Daily |
| `sleep` | After bed exit detected (morning) | Daily |
| `post_incident` | After incident resolves | Per incident |
| `weekly_activity` | End of week (Sunday) | Weekly |

---

#### 2.3.1 Daily Risk Report

Produced by the Risk Analyst agent (Flow 2). Provides a daily fall risk score with trend data, metric deviations, and auto-captured activity clips.

```typescript
type DailyRiskData = {
  risk_score: number                  // 0-100
  risk_level: "low" | "moderate" | "high" | "critical"
  previous_score: number              // yesterday's score
  trend: "improving" | "stable" | "declining"

  // 7-day trend for charting
  trend_data: Array<{
    date: string                      // "2026-03-06"
    score: number
  }>

  // Which metrics deviated from baseline
  metric_deviations: Array<{
    metric: string                    // "Gait speed", "Sit-to-stand time"
    current_value: string             // "0.6 m/s"
    baseline_value: string            // "0.8 m/s"
    deviation_percent: number         // -25
    direction: "improved" | "declined"
  }>

  // Video clip analysis results (auto-captured)
  activity_clips: Array<{
    clip_url: string                  // Supabase Storage signed URL
    clip_type: "sit_to_stand" | "walking_bout" | "activity_snapshot"
    analysis: string                  // vision agent summary of the clip
    captured_at: string
  }>
}
```

**Example AI insight:**

| Field | Example |
|-------|---------|
| **summary** | "Fall risk score at 62 (moderate) -- up 8 points from yesterday" |
| **context** | "Gait speed declined 15% over 3 days. Sit-to-stand time increased from 2.1s to 2.9s. Pattern is consistent with fatigue or lower limb discomfort. Last week's score was stable at 52-55." |
| **recommendation** | "Monitor closely over the next 2 days. If trend continues, consider a physiotherapy referral. Ask Uncle Tan about any leg pain during next check-in." |

---

#### 2.3.2 Sleep Report

Produced after the bedroom mmWave sensor detects bed exit (morning). Compiles overnight sleep data from the mmWave sleep mode sensor (Flow 6).

```typescript
type SleepData = {
  sleep_score: number                 // 0-100
  sleep_rating: "good" | "average" | "poor"
  previous_score: number

  // Duration
  duration_minutes: number
  bed_entry: string                   // "22:15"
  bed_exit: string                    // "06:45"

  // Stages (percentages)
  stages: {
    deep_pct: number
    light_pct: number
    awake_pct: number
  }

  // Vitals during sleep
  vitals: {
    avg_heart_rate: number            // bpm
    avg_respiration: number           // breaths/min
    apnea_events: number             // count
  }

  // Disruptions
  disruptions: {
    times_out_of_bed: number
    out_of_bed_duration_minutes: number
    abnormal_struggle: boolean
    turns: number
  }

  // Anomaly flags
  anomalies: string[]                 // ["Sleep < 4 hours", "Apnea events elevated"]

  // 7-day trend for charting
  trend_data: Array<{
    date: string
    score: number
    duration_minutes: number
  }>
}
```

**Example AI insight:**

| Field | Example |
|-------|---------|
| **summary** | "Poor night -- sleep score 34, only 3.5 hours" |
| **context** | "Uncle Tan went to bed at 11:45pm (1.5hr later than usual) and woke at 3:15am. Deep sleep only 18% (baseline: 55%). 3 bed exits totaling 45 minutes. Heart rate elevated at 78bpm (baseline: 62). This is the 3rd consecutive poor night." |
| **recommendation** | "3 consecutive poor nights is a concern. Ask Uncle Tan about any pain, anxiety, or discomfort. Consider discussing with his doctor if pattern continues." |

---

#### 2.3.3 Post-Incident Report

Generated after a fall incident resolves. Contains the full finalized Incident object plus additional post-resolution analysis.

```typescript
type PostIncidentData = {
  // The full finalized Incident object
  incident: Incident

  // Fall frequency context
  fall_frequency: {
    last_30_days: number
    last_90_days: number
    trend: "increasing" | "stable" | "decreasing"
  }

  // Environmental assessment (from room scan post-fall)
  environmental_factors: Array<{
    factor: string                    // "Loose rug near sofa"
    severity: "low" | "medium" | "high"
    status: "new" | "persistent" | "resolved"
    recommendation: string            // "Secure or remove rug"
  }>

  // Risk score impact
  risk_impact: {
    score_before: number
    score_after: number
    contributing_factors: string[]     // ["Gait speed decline", "Previous fall 2 weeks ago"]
  }

  // Response performance metrics
  response_metrics: {
    detection_to_assessment_seconds: number
    detection_to_caregiver_notification_seconds: number
    caregiver_response_seconds: number | null  // null if no response (L2 escalation)
    total_resolution_seconds: number
  }
}
```

**Example AI insight:**

| Field | Example |
|-------|---------|
| **summary** | "Fall resolved -- Uncle Tan tripped over loose rug, minor injury" |
| **context** | "This is Uncle Tan's 2nd fall in 30 days (previous: Feb 20). Both involved the living room rug. Gait speed has declined 20% since first fall. Caregiver Mary responded in 45 seconds. Vision analysis confirmed trip with limited post-fall mobility." |
| **recommendation** | "Remove or secure the living room rug immediately -- it has caused 2 falls. Schedule a physiotherapy assessment to address declining gait speed. Consider increasing check-in frequency for the next week." |

---

#### 2.3.4 Weekly Activity Summary

Produced at the end of each week. Aggregates MoveNet metrics and mmWave presence data to show activity patterns and week-over-week trends (Flow 2 + Flow 10).

```typescript
type WeeklyActivityData = {
  period: {
    start: string                     // "2026-02-28"
    end: string                       // "2026-03-06"
  }

  // Movement metrics (daily averages)
  movement: {
    avg_sit_to_stand_count: number    // per day
    avg_sit_to_stand_duration_ms: number
    avg_walking_bouts_per_day: number
    avg_gait_speed: string            // "0.7 m/s"
    shuffling_score: number           // 0-1 (higher = more shuffling)
  }

  // Posture distribution (% of monitored time)
  posture_distribution: {
    standing_pct: number
    sitting_pct: number
    lying_pct: number
    walking_pct: number
  }

  // Week-over-week comparison
  comparison: Array<{
    metric: string                    // "Sit-to-stand count"
    this_week: string                 // "8/day"
    last_week: string                 // "12/day"
    change: string                    // "-33%"
    direction: "improved" | "declined" | "stable"
  }>

  // Notable patterns
  notable_events: Array<{
    description: string               // "2 falls this week (up from 0 last week)"
    severity: "info" | "warning" | "critical"
  }>

  // Best/worst activity clips of the week
  highlights: Array<{
    clip_url: string                  // Supabase Storage signed URL
    clip_type: string                 // "sit_to_stand", "walking_bout"
    description: string               // "Best sit-to-stand this week (1.8s)"
    captured_at: string
  }>
}
```

**Example AI insight:**

| Field | Example |
|-------|---------|
| **summary** | "Activity declining -- 15% less movement than last week" |
| **context** | "Sit-to-stand transitions down from 12/day to 8/day. Walking bouts shorter (avg 2min vs 4min last week). Sedentary time increased to 78% (was 65%). This started after the fall on March 3rd -- consistent with post-fall anxiety reducing mobility." |
| **recommendation** | "The post-fall activity decline has persisted into week 2. This is a strong indicator for physiotherapy referral. Encourage short walks with support. Consider a follow-up with Uncle Tan's GP." |

---

## 3. Delivery Mechanism

### 3.1 Architecture

```
                    +-------------------+
                    |     aura-ai       |
                    |     (:8001)       |
                    +---+-----+-----+--+
                        |     |     |
            +-----------+     |     +------------+
            v                 v                  v
   WS /ws/caregiver    REST /api/*      Supabase Storage
   (real-time push)    (pull on demand)   (video clips)
            |                 |                  |
            v                 v                  v
        Incidents         Reports           Video URLs
        Alerts            Historical        Room scans
        Status            incidents         Activity clips
                          Alert history
```

### 3.2 WebSocket `/ws/caregiver` -- Real-Time Push

Used for Incidents and Alerts -- anything that needs immediate caregiver attention.

**Connection:**

```
ws://localhost:8001/ws/caregiver?resident_id={resident_id}&contact_id={contact_id}
```

**Server -> Client messages:**

```jsonc
// -- Incident lifecycle (critical) --

// New incident created (BASE alert)
{ "type": "incident_created", "incident": Incident }

// Incident updated (progressive enrichment -- voice/video/assessment arrived)
{ "type": "incident_updated", "incident_id": "abc123", "incident": Incident }

// Incident locked by first responder
{ "type": "incident_locked", "incident_id": "abc123", "locked_by": { "name": "Mary Tan", "action": "On the way" } }

// Incident resolved
{ "type": "incident_resolved", "incident_id": "abc123", "resolution": "caregiver_ack" }

// -- Alerts (warning/notice) --

// New alert
{ "type": "alert", "alert": Alert }

// -- System --

// Status update / connection confirmation
{ "type": "status", "state": "MONITORING", "message": "Connected to AURA AI Backend" }

// Heartbeat
{ "type": "ping" }
```

**Client -> Server messages:**

```jsonc
// Take action on incident (backend-tracked)
{ "type": "action", "incident_id": "abc123", "action": "ACK" }

// Heartbeat response
{ "type": "pong" }
```

**Catch-up on connect:**

When a caregiver connects (or reconnects), the server sends a catch-up batch so they don't miss anything:

```
1. { type: "status", state, message }           -- current system state
2. { type: "incident_created", incident }        -- active incident (if any)
3. { type: "alert", alert }[]                    -- recent alerts (last 4 hours)
```

Recent alerts are served from the in-memory buffer (backed by Supabase Postgres for persistence beyond server restarts).

### 3.3 REST API -- Pull on Demand

Used for Reports and historical data. The caregiver app fetches these on page load or navigation.

**Reports:**

```
GET /api/reports                              -- list all reports (paginated)
GET /api/reports?type=daily_risk              -- filter by type
GET /api/reports?type=sleep&from=2026-03-01   -- filter by type + date range
GET /api/reports/{id}                         -- single report with full data
```

**Incidents (historical):**

```
GET /api/incidents                            -- current + past incidents
GET /api/incidents/{id}                       -- single incident (full Incident object)
```

**Alerts (historical):**

```
GET /api/alerts                               -- alert history (paginated)
GET /api/alerts?category=vital_signs          -- filter by category
GET /api/alerts?severity=warning              -- filter by severity
```

### 3.4 Why This Split?

| Channel | Used For | Reason |
|---------|---------|--------|
| **WebSocket** | Incidents, Alerts | Real-time. Caregiver needs to see falls and safety alerts immediately. |
| **REST** | Reports, historical data | On-demand. Reports are periodic summaries -- caregiver reads them when convenient, not in real-time. Also supports offline recovery (data persists in Supabase). |
| **Supabase Storage** | Video clips, images | Large binary files. Served via signed URLs with CDN caching. Decoupled from the WS/REST data flow. |

---

## 4. Persistence Layer (Supabase)

### 4.1 Why Supabase

- Already partially configured in Aura-Health (`src/lib/supabase.ts`)
- Postgres + Storage + Realtime in one platform
- Generous free tier for hackathon demo
- No competition benefit for using Cloudflare instead (Cloudflare has no sponsor prize; the NMLP Special Award is for SEA-LION/MERaLiON usage, which we already have via ElevenLabs + MeraLion)

### 4.2 Supabase Postgres Tables

Three tables, each storing the full object as JSONB with indexed scalar columns for filtering.

**`incidents`**

| Column | Type | Index | Notes |
|--------|------|-------|-------|
| `id` | `text` | PK | 8-char UUID hex |
| `status` | `text` | yes | For filtering active/resolved |
| `severity` | `text` | yes | For filtering by severity |
| `source` | `text` | | "camera" or "sensor" |
| `started_at` | `timestamptz` | yes | For date range queries |
| `resolved_at` | `timestamptz` | | |
| `resident_id` | `text` | yes | For multi-resident readiness |
| `data` | `jsonb` | | Full Incident object |

**`alerts`**

| Column | Type | Index | Notes |
|--------|------|-------|-------|
| `id` | `text` | PK | |
| `severity` | `text` | yes | "warning" or "notice" |
| `category` | `text` | yes | AlertCategory value |
| `timestamp` | `timestamptz` | yes | For date range queries |
| `resident_id` | `text` | yes | |
| `incident_id` | `text` | | Optional FK to incidents |
| `data` | `jsonb` | | Full Alert object |

**`reports`**

| Column | Type | Index | Notes |
|--------|------|-------|-------|
| `id` | `text` | PK | |
| `type` | `text` | yes | ReportType value |
| `generated_at` | `timestamptz` | yes | For date range queries |
| `resident_id` | `text` | yes | |
| `data` | `jsonb` | | Full Report object |

### 4.3 Supabase Storage Buckets

| Bucket | Contents | URL Pattern |
|--------|----------|-------------|
| `incident-videos` | Fall video clips | `incident-videos/{incident_id}.webm` |
| `activity-clips` | Auto-captured movement clips | `activity-clips/{clip_id}.webm` |
| `room-scans` | Room safety scan images | `room-scans/{scan_id}.jpg` |

All files served via **signed URLs with 24-hour expiry**. URLs are generated at write time and included in the Incident/Report objects. If a URL expires before the caregiver views it, the frontend requests a fresh URL from the REST API.

### 4.4 Write Pattern

```
aura-ai generates data (incident / alert / report)
  |
  +---> Write to Supabase Postgres (full object as JSONB)
  |
  +---> Upload video/image to Supabase Storage (if applicable)
  |     Generate signed URL, embed in the object
  |
  +---> Push to WS /ws/caregiver (incidents + alerts only)
  |     Real-time delivery to connected caregivers
  |
  +---> Store in in-memory buffer (for catch-up on reconnect)

Caregiver opens app
  |
  +---> WS connect --> catch-up batch (active incident + recent alerts)
  |
  +---> REST fetch --> reports, historical data from Supabase Postgres
  |
  +---> Video playback from Supabase Storage signed URLs
```

---

## 5. Elderly App (Future -- Mental Note)

Not in scope for this design. The elderly app will be a simple end-user app that receives:

- **Voice audio** -- TTS from ElevenLabs (already working via `/ws`)
- **Simple status messages** -- "Your family has been notified"
- **Directives** -- Speak, listen, play audio

The elderly app does **NOT** receive Incidents, Alerts, or Reports. Those are caregiver-only. The elderly interacts with AURA through voice, not through data dashboards.

---

## Appendix: Relationship to Existing Code

| Existing Code | Relationship to This Design |
|---------------|-----------------------------|
| `state/session_store.py` `Incident` class | Backend incident model. Needs to be mapped/serialized into the frontend `Incident` type defined here. Fields like `escalation_level`, `timeline`, and `evidence` are backend internals -- the caregiver sees `status`, `event_timeline`, and `narrative` instead. |
| `core/orchestrator.py` | Currently broadcasts raw incident lifecycle events. Needs to construct the full `Incident` object with `headline`, `narrative`, `tags`, etc. and send via WS. |
| `tools/notifications.py` | Currently handles SMS + push stubs. Alert generation logic will live here or in a new `tools/alerts.py` module. |
| `core/schemas.py` `CoordinatorDecision`, `RiskAssessment`, `VisionAnalysis` | Agent output models. These are backend schemas -- they feed INTO the caregiver-facing objects (e.g., `CoordinatorDecision.reasoning` -> `Incident.ai_assessment.reasoning`). |
| `Aura-Health/src/lib/auraCaregiverSocket.ts` | WebSocket client. Already handles `incident_created`, `incident_escalated`, `incident_locked`, `incident_resolved`. Needs to add `incident_updated` and `alert` message handlers. |
| `Aura-Health/src/types/monitoring.ts` | Frontend types. The `AlertItem` type needs to be replaced/extended with the `Alert` type from this design. `Incident` type needs to be added. |
| `Aura-Health/src/lib/supabase.ts` | Supabase client. Already configured (optional). Needs to be activated for Storage (video URLs) and Postgres (reports, historical data). |

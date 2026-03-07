# Sleep Tracking Database Design

Generated on 2026-03-05 12:04 UTC

------------------------------------------------------------------------

# 1. Entity Relationship Diagram (ERD)

## Entities Overview

### users

-   id (uuid, PK)
-   email
-   created_at

Relationship: - 1 user → many sleep_sessions

------------------------------------------------------------------------

### sleep_sessions

-   id (uuid, PK)
-   user_id (uuid, FK → users.id)
-   start_time (timestamptz)
-   end_time (timestamptz)
-   time_in_bed_minutes (int)
-   total_sleep_minutes (int)
-   total_awake_minutes (int)
-   total_light_minutes (int)
-   total_deep_minutes (int)
-   sleep_efficiency (numeric)
-   sleep_onset_latency_minutes (int)
-   waso_minutes (int)
-   sleep_quality_score (int)
-   sleep_risk_score (int)
-   avg_heart_rate (numeric)
-   avg_respiration_rate (numeric)
-   total_turns (int)
-   total_apnea_events (int)
-   times_out_of_bed (int)
-   out_of_bed_duration_minutes (int)
-   anomalies (jsonb, default '[]')
-   created_at (timestamptz)

Note: `sleep_efficiency` has a check constraint enforcing values between 0 and 100.

Relationship: - 1 sleep_session → many sleep_stage_intervals

------------------------------------------------------------------------

### sleep_stage_intervals

-   id (uuid, PK)
-   sleep_session_id (uuid, FK → sleep_sessions.id)
-   stage (text: 'awake', 'light', 'deep')
-   start_time (timestamptz)
-   end_time (timestamptz)
-   duration_minutes (int)
-   avg_heart_rate (numeric)
-   avg_respiration_rate (numeric)
-   turns (int)
-   apnea_events (int)
-   abnormal_struggle (boolean)
-   created_at (timestamptz)

------------------------------------------------------------------------

## ERD Structure (Conceptual)

users\
│\
│ 1\
│\
└───────────\< sleep_sessions \>───────────┐\
│ │\
│ 1 │ many\
│ │\
└───────────\< sleep_stage_intervals

------------------------------------------------------------------------

# 2. Example Supabase Queries for Graphs

## Sleep Timeline (Session Detail)

``` sql
select stage, start_time, end_time
from sleep_stage_intervals
where sleep_session_id = :session_id
order by start_time asc;
```

------------------------------------------------------------------------

## Sleep Stage Distribution (Pie Chart)

``` sql
select
  total_awake_minutes,
  total_light_minutes,
  total_deep_minutes
from sleep_sessions
where id = :session_id;
```

------------------------------------------------------------------------

## Weekly Sleep Duration Trend

``` sql
select
  date(start_time) as sleep_date,
  total_sleep_minutes
from sleep_sessions
where user_id = :user_id
order by sleep_date asc;
```

------------------------------------------------------------------------

## Sleep Efficiency Trend

``` sql
select
  date(start_time) as sleep_date,
  sleep_efficiency
from sleep_sessions
where user_id = :user_id
order by sleep_date asc;
```

------------------------------------------------------------------------

## WASO Trend

``` sql
select
  date(start_time) as sleep_date,
  waso_minutes
from sleep_sessions
where user_id = :user_id
order by sleep_date asc;
```

------------------------------------------------------------------------

## Heart Rate During Sleep (Interval Averages)

``` sql
select
  start_time,
  avg_heart_rate
from sleep_stage_intervals
where sleep_session_id = :session_id
order by start_time asc;
```

------------------------------------------------------------------------

## Apnea Index (Events per Hour)

``` sql
select
  total_apnea_events,
  total_sleep_minutes,
  (total_apnea_events::float / (total_sleep_minutes/60.0)) as apnea_index
from sleep_sessions
where id = :session_id;
```

------------------------------------------------------------------------

## Sleep Fragmentation (Stage Transitions Count)

``` sql
select count(*) as stage_transitions
from sleep_stage_intervals
where sleep_session_id = :session_id;
```

------------------------------------------------------------------------

# 3. Recommended Indexes

``` sql
create index on sleep_sessions(user_id);
create index on sleep_sessions(start_time);

create index on sleep_stage_intervals(sleep_session_id);
create index on sleep_stage_intervals(start_time);
```

------------------------------------------------------------------------

# Design Summary

This structure enables:

-   Sleep efficiency calculation (constrained 0–100)\
-   Sleep onset latency (SOL)\
-   WASO computation\
-   Stage distribution graphs\
-   Timeline visualization\
-   Risk scoring\
-   Trend analytics\
-   Out-of-bed disruption tracking\
-   Anomaly flag storage (e.g. "Sleep < 4 hours", "Apnea events elevated")

Without storing noisy minute-level logs.

# AURA Health — Product Requirements Document

## 1. Product Overview

AURA Health is a caregiver-facing mobile web application that provides real-time monitoring of elderly patients at home. It surfaces live fall detection data from mmWave radar sensors, sleep quality analytics, and a unified alert history — all designed to give caregivers immediate situational awareness and peace of mind.

The app runs as a progressive web app in a mobile browser (max width ~430px). There is no native app install required.

---

## 2. Target Users

**Primary — Remote Caregiver (Sarah)**

- Adult child or professional caregiver monitoring an elderly parent
- Checks the app multiple times a day, especially after receiving a notification
- Needs at-a-glance status, not raw sensor data
- Prioritises trust and calm design; false alarms erode confidence

**Secondary — On-site Nurse or Case Manager**

- Reviews trend data (sleep, fall history) during home visits
- Uses the Alerts tab to audit recent events and mark them resolved

**Patient — Ashley, 78**

- Does not interact with the app directly
- Lives alone at home with mmWave radar sensors installed in key rooms

---

## 3. Core Features

### 3.1 Dashboard

The home screen gives an instant read on patient status.

- **Fall status hero card** — large, colour-coded (emerald = safe, rose = fallen), derived from live WebSocket frame
- **Heart rate tile** — last known BPM from sensor or sleep session
- **Sleep score tile** — last night's score with quality label
- **Risk score card** — dark card with numeric risk and current location
- **Floorplan** — SVG home layout with the active room highlighted based on live `frame.room`
- **Recent alerts** — 2–3 most recent AlertRow entries linking to the Alerts tab

### 3.2 Falls

Deep-dive on fall detection state and history.

- **Current sensor state card** — live frame fields: presence, motion, BPM, dwell, fall status
- **Sensor event log** — timestamped rows of recent WsFrame events, colour-coded by tone
- **Body movement parameter chart** — bar chart of `bmp` values showing the impact spike
- **AI fall insight** — plain-language summary of the current fall state and recommendation

### 3.3 Sleep

Overnight sleep quality analytics.

- **Sleep score ring** — circular gauge showing last night's score (0–100)
- **Stage breakdown grid** — tiles for Deep %, Light %, Awake %, Deep duration
- **Sleep architecture timeline** — horizontal bar segmented by sleep stage over the session
- **Vitals grid** — avg heart rate, respiration, apnea events, turns, out-of-bed, awake duration
- **Weekly trend chart** — 7-day bar chart of sleep scores
- **Safety status banner** — fall-state-aware notice (no coaching if fall active)
- **AI sleep insight** — plain-language summary of last night's sleep

### 3.4 Alerts

Chronological history of events with filter controls.

- **Live status banner** — reflects current fall state from WebSocket
- **Filter pills** — All / Critical / Warning / Notice
- **Alert list** — scrollable list of AlertRow cards, filtered by selection
- **Resolved milestone** — bottom banner when no critical alerts for 3+ consecutive days

---

## 4. Data Architecture

### 4.1 WebSocket (Live)

mmWave radar sensors publish JSON frames to a WebSocket endpoint. Each frame:

```ts
type WsFrame = {
  timestamp: string; // ISO 8601
  presence: boolean; // someone in room
  motion: "none" | "still" | "active";
  bmp: number; // body movement parameter (0–100+)
  fallen: boolean; // fall classification
  dwell: boolean; // stationary dwell alert
  room: string; // 'living_room' | 'bathroom' | 'bedroom' | 'kitchen'
  heartRate?: number; // optional from sensor fusion
};
```

The app uses a `useWebSocket(url)` hook in production and `useMockWebSocket()` in development (toggled by `VITE_USE_MOCK_WS=true`). Both expose the same interface: `{ frame, connected, error }`.

### 4.2 Supabase (Historical)

PostgreSQL via Supabase stores persistent records. Tables:

| Table            | Key columns                                                                        |
| ---------------- | ---------------------------------------------------------------------------------- |
| `alerts`         | id, severity, title, subtitle, created_at, resolved_at                             |
| `fall_events`    | id, started_at, resolved_at, room, frames (JSONB)                                  |
| `sleep_sessions` | id, date, score, deep_pct, light_pct, awake_pct, duration_min, avg_hr, respiration |

The Supabase client (`src/lib/supabase.ts`) is initialised from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. If either env var is absent, the client returns `null` and the app falls back to static mock data. No queries are implemented in this phase.

### 4.3 Mock Data

`src/data/mock.ts` provides static arrays for alerts, event rows, and sleep sessions used when the real backend is unavailable.

---

## 5. Design Principles

- **Mobile-first** — all layouts target 390–430px viewport width; desktop shows centred column
- **Safe-area aware** — bottom nav uses `pb-safe` padding for notched iPhones
- **Calm by default** — emerald and teal dominate; rose only appears when action is needed
- **Large numbers** — key metrics (score, BPM, risk) use 28–36px font for at-a-glance reading
- **Accessible colour** — all colour-coded states also use text labels and icons; not colour-only
- **Cards** — `rounded-3xl` with soft shadows; gradient accent on hero cards
- **Typography** — tight tracking on uppercase labels, semibold on values

---

## 6. Out of Scope (v1)

- User authentication and multi-account login
- Multi-patient support (one patient per caregiver in this phase)
- Push notifications (WebSocket already provides live updates)
- Native iOS/Android app (PWA covers the use case)
- Caregiver-to-patient messaging
- Medication management

---

## 7. Tech Stack

| Layer         | Technology                             |
| ------------- | -------------------------------------- |
| Framework     | React 19 + TypeScript                  |
| Build         | Vite 7                                 |
| Routing       | React Router v7                        |
| Styling       | Tailwind CSS v4                        |
| UI Primitives | shadcn/ui (Radix UI)                   |
| Charts        | Recharts                               |
| Live Data     | WebSocket (real) / interval mock (dev) |
| Database      | Supabase (PostgreSQL) — stubbed in v1  |
| Icons         | Lucide React                           |

# AURA Health

A caregiver-facing mobile web app for real-time monitoring of elderly patients. Displays live sensor data including fall detection, heart rate, room location, and sleep analytics streamed from an mmWave radar sensor via AWS IoT Core.

## Tech Stack

| Layer         | Technology                                   |
| ------------- | -------------------------------------------- |
| Framework     | React 19 + TypeScript                        |
| Build Tool    | Vite 7                                       |
| Styling       | Tailwind CSS v4                              |
| Routing       | React Router v7                              |
| UI Components | shadcn/ui                                    |
| WebSocket     | Native browser WebSocket API                 |
| Backend       | Node.js + Express + `ws` (see mmWave repo)   |
| IoT           | AWS IoT Core (MQTT via `aws-iot-device-sdk`) |

## Project Structure

```
src/
  components/
    layout/       # AppShell — bottom nav, shared outlet context
    shared/       # AlertRow, MetricCard, SeverityBadge
    ui/           # shadcn/ui primitives (Card, Button, Badge, Tabs)
  data/
    mock.ts       # Static mock alerts, sleep session, event timeline
  hooks/
    usePatientData.ts   # Combines real/mock WS, derives fallStatus
  lib/
    websocket.ts        # Real WebSocket hook — parses mmWave server messages
    mock-websocket.ts   # Mock WS hook for development without hardware
    supabase.ts         # Supabase client stub
  pages/
    DashboardPage.tsx   # Overview: heart rate, sleep, floorplan, recent alerts
    FallsPage.tsx       # Fall status, event timeline, AI insight
    SleepPage.tsx       # Sleep score, architecture, weekly timing chart
    AlertsPage.tsx      # Filterable alert feed
  types/
    monitoring.ts       # All shared TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- mmWave backend server running (see mmWave repo)

### Installation

```bash
npm install
```

### Environment

Create a `.env.local` file in the project root:

```env
VITE_USE_MOCK_WS=false
VITE_WS_URL=ws://localhost:8000/ws
VITE_FALL_DETECTOR_WS_URL=ws://localhost:8001/ws
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## Dev / Demo Toggles

### `VITE_USE_MOCK_WS` — `.env.local`

Controls whether the app uses a live WebSocket or static mock data for the mmWave sensor feed.

| Value | Behaviour |
|---|---|
| `false` | Connects to `VITE_WS_URL` (port 8000) for live sensor data and `VITE_FALL_DETECTOR_WS_URL` (port 8001) for fall detection events |
| `true` | Uses a hardcoded static sensor frame — presence detected, HR ~68 bpm, living room. No hardware required |

Use `true` when developing UI without the mmWave hardware running.

---

### `DEV_FORCE_FALLEN` — `src/hooks/useIncidents.ts` line 9

```ts
export const DEV_FORCE_FALLEN = false; // normal monitoring state
export const DEV_FORCE_FALLEN = true;  // force active fall incident
```

Simulates an active fall incident without needing the AURA Fall Detector WebSocket to fire. Useful for demoing the fall response flow end-to-end.

**When `true`:**
- App boots directly into the fallen/active incident state
- Falls page shows the active fall report (populated from `mockIncident` in `src/data/mock.ts`)
- Alerts page shows a live "Fall Detected" critical alert pinned at the top
- Bottom nav Falls icon turns red
- Dashboard room highlight and status badge switch to fall state
- Mock heart rate raised to 95 bpm (elevated post-fall reading)

**When `false`:**
- App starts in normal monitoring state
- Fall state is only triggered by the AURA Fall Detector WebSocket (`ws://localhost:8001/ws`) sending a `status: FALL_ASSESSMENT` message

> In production, `DEV_FORCE_FALLEN` should always be `false`. Fall state is driven entirely by the live WebSocket.

### Running

```bash
# Development (local only)
npm run dev

# Development (exposed on network — for testing on phone)
npm run dev -- --host

# Production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

### Accessing on Phone

1. Run `npm run dev -- --host`
2. Open `http://<your-local-ip>:5173` in Chrome on your phone
3. Tap the browser menu > **Add to Home Screen** to install as a PWA

# AURA Health — Design Guidelines

## Typography

### Fonts

- **Page / screen headers**: Fraunces (serif, weight 700) — loaded via Google Fonts in `index.html`, applied with inline `style={{ fontFamily: "'Fraunces', Georgia, serif" }}`
- **All other UI**: System sans-serif stack — `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif`

### Type scale

| Role                  | Size                        | Weight  | Color          |
| --------------------- | --------------------------- | ------- | -------------- |
| Page title (Fraunces) | 28–30px                     | 700     | slate-900      |
| Metric value          | 36px                        | 700     | accent color   |
| Card label            | 10–11px, uppercase, tracked | 700     | slate-400      |
| Body / alert title    | 13px                        | 600     | slate-800      |
| Alert detail line     | 11px                        | 600     | severity color |
| Subtitle / caption    | 11–13px                     | 400–500 | slate-400      |

### Rules

- No eyebrow / label text above main header titles on any screen
- No em dashes anywhere in the UI — use line breaks, dots, or separate lines instead
- Location and context go on their own line, never appended to a title with punctuation
- No "Hi [Name]" greeting prefix on the dashboard — patient name is the primary element

---

## Colour Palette

| Name      | Hex                   | Usage                                                  |
| --------- | --------------------- | ------------------------------------------------------ |
| Teal      | `#0d9488`             | Primary brand, teal accents, notice alerts, active nav |
| Rose      | `#e11d48`             | Critical alerts, fall state, heart rate                |
| Emerald   | `#059669`             | Safe state, normal readings, positive status           |
| Amber     | `#d97706`             | Warning alerts                                         |
| Blue      | `#3b82f6` / `#1d4ed8` | Sleep metrics                                          |
| Slate-900 | `#0f172a`             | Primary text, dark banner bg                           |
| Slate-400 | `#94a3b8`             | Labels, captions, secondary text                       |
| White     | `#ffffff`             | Card backgrounds                                       |
| Slate-50  | `#f8fafc`             | Page background                                        |

---

## Cards

### Rules

- White background, `1px solid slate-100` border, subtle shadow only
- **No gradients** — flat fills only
- **No coloured background + border combo** — choose one or the other. If a card has a coloured background (e.g. rose-50 for a fall state), remove the border entirely
- Consistent padding: `16px`
- Border radius: `24px` (xl) for main cards, `20px` (lg) for alert cards, `14px` (md) for small cells
- Cards in the same row must be the same height — use CSS grid with `items-stretch`

---

## Icons

- SVG icons only — no emojis anywhere in the UI
- Icon style: Heroicons / outlined, `stroke-width: 2–2.5`, `stroke-linecap: round`
- Icon wraps in alerts use a light-tinted square background (e.g. `rose-50` for critical, `amber-50` for warning, `teal-50` for notice) — `rounded-[10px]`, no border
- `AlertIcon` component and severity color maps are exported from `src/components/shared/AlertRow.tsx`

### Alert icon types (`AlertIconType`)

| Key              | Usage                    |
| ---------------- | ------------------------ |
| `alert-triangle` | Critical / fall detected |
| `circle-info`    | Warning / no movement    |
| `heart`          | Warning / heart rate     |
| `clock`          | Notice / time-based      |
| `moon`           | Notice / sleep           |
| `check-circle`   | OK / resolved            |
| `walking`        | Notice / went out        |

---

## Header / Navigation

### Dashboard header

- Patient name is the primary element — large, in Fraunces, no greeting prefix
- Subtitle: age · current location, on the line below
- Live pill: emerald-50 bg, pulsing dot, "Live" label
- Profile avatar button (initials) top-right

### Bottom nav bar

- 4 tabs: Dashboard, Falls, Sleep, Alerts
- Active tab: `text-teal-600`; inactive: `text-slate-400`
- Alert badge: rose-500 circle, positioned top-right of bell icon
- SVG icons defined inline in `AppShell.tsx` (Home, UserPlus, Moon, Bell shapes)

---

## Alerts

### Three-tier message structure

Every alert must have three layers:

1. **Title** — the event type in plain language (e.g. "Fall detected", "No movement detected", "Morning walk")
2. **Detail line** — specific facts in the severity colour: location, numbers, times (e.g. "Bathroom · 18 minutes", "102 bpm · 9 minutes sustained")
3. **Context line** — OPTIONAL: what it means or what was done (e.g. "Longer than her usual pattern", "Emergency contacts notified")

### Severity colours for detail lines

- Critical → `text-rose-600`
- Warning → `text-amber-600`
- Notice → `text-teal-600`
- OK → `text-emerald-600`

### Card structure (Alerts page)

- White card, `3px solid` left border in severity colour, `rounded-[20px]`
- Icon wrap: tinted square `rounded-[10px]`, no border
- Action buttons for critical and warning only, below a top-border divider
  - Critical: "View Report" (secondary) + "Mark Resolved" (primary)
  - Warning: "Dismiss" (secondary) + "Check In" (primary)
- No action buttons on notice or ok level alerts

### Dashboard recent alerts (simple rows)

- All inside one parent white card
- Each row: icon wrap + 3-tier text + time, separated by `border-b border-slate-100`
- No action buttons

### What NOT to show

- No redundant negative state banners ("No active fall alert right now")
- Positive milestones (e.g. "3 days without critical alerts") go at the top of the alerts list as a clean white card with an emerald icon circle — no coloured card background

---

## Dashboard

- No fall detection hero card — fall status is shown only in the dark risk banner
- Lead with two equal-height metric cards in a 2-col grid: Heart Rate (rose value) + Sleep (blue value)
- Dark Fall Risk banner: slate-900 bg, "Fall Risk" label, "Low · Score 0" or "High · Score 85", circular ring
- Floorplan card: subtle `#cbd5e1` strokes, active room highlighted in `#bbf7d0` (safe) or `#fecdd3` (fallen), pulsing location dot with outer ring at 25% opacity
- Recent Alerts section: 3 rows inline in one parent card

---

## Fall Detection Page

- Title: "Fall Alert" in Fraunces, no eyebrow
- Lead with a status card: emerald-50 bg for safe, rose-50 bg (no border) for fallen
- Show interpreted fields only — Location, Duration, Movement, Heart Rate — not raw sensor values
- Emergency action buttons (Call Emergency / False Alarm) visible only in fallen state
- Fall risk shown as a progress bar card (Low 15% / High 85%)
- Fall history shown as a **timeline** in plain English, shown only when isFallen
- AI insight: dark slate-900 card with teal star icon + "AI Insight" label

---

## Sleep Page

- Title: "Sleep" in Fraunces, no eyebrow
- Sleep score ring (conic-gradient)
- Stage breakdown: colored div squares instead of emojis
- Architecture timeline bar + weekly trend chart
- AI insight: dark slate-900 card with SVG star + "AI Sleep Insight" label

---

## What to Avoid

- Gradients on cards
- Emojis as icons anywhere in the UI
- Raw sensor data shown to caregivers (bmp values, dwell flags, presence booleans)
- Em dashes in any UI text
- Eyebrow/label text above page titles
- Background colour + border on the same element
- Cards of different sizes in the same row
- "No Fall Detected" as a hero dashboard card
- "No active fall alert" live status banners on the Alerts page
- Sensor log messages that expose internal system readings

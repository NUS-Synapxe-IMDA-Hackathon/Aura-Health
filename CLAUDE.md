# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # Type-check (tsc -b) then build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build locally
```

No test runner is configured in this project.

## Architecture

**AURA Health** is a React 19 + TypeScript caregiver monitoring app targeting a mobile viewport (max-w ~430px). It uses Vite, Tailwind CSS v4, and React Router v7.

### Routing & Layout

`App.tsx` defines a nested route tree with `AppShell` as the root layout wrapping all pages via `<Outlet>`. All routes redirect to `/dashboard` by default.

`AppShell` owns the global bottom navigation bar and passes shared state down to pages via React Router's `useOutletContext`. Pages consume this context with `useOutletContext<AlertOutletContext>()`.

### Shared State via Outlet Context

`AppShell` maintains:
- `fallStatus: FallStatus` — current fall state (`'fallen' | 'not_fallen'`), currently hardcoded to `'not_fallen'`
- `filter: AlertFilter` — alert filter for AlertsPage (`'all' | 'critical' | 'warning' | 'notice'`)
- `count` / `incrementReview` — tracks reviewed alert count

This context (`AlertOutletContext`) is exported from `AppShell.tsx` and typed in pages.

### Data & Types

- `src/types/monitoring.ts` — all shared types (`AlertFilter`, `FallStatus`, `AlertItem`, `EventRow`, `EventRowTone`)
- `src/data/monitoring.ts` — static mock data arrays (`alerts`, `eventRows`) used by pages

### UI Components

- `src/components/ui/` — shadcn/ui components (Card, Button, Badge, Tabs, Alert, Chart)
- `src/components/shared/PageHeader.tsx` — reusable page header with eyebrow/title/subtitle
- `src/lib/utils.ts` — exports `cn()` (clsx + tailwind-merge) for conditional class merging

### Styling

Tailwind CSS v4 (via `@tailwindcss/vite` plugin). Use `cn()` from `src/lib/utils.ts` for conditional classes. Color palette follows `teal` for primary, `rose` for critical/fall alerts, `emerald` for safe/ok states, `blue` for sleep, `slate` for neutrals.

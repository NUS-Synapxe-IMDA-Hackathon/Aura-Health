import { useEffect, useState } from 'react'
import type { WsFrame } from '../types/monitoring'

// Simulates a full fall scenario cycle: normal activity → fall → recovery
const MOCK_SEQUENCE: Omit<WsFrame, 'timestamp'>[] = [
  { presence: false, motion: 'none', bmp: 0, fallen: false, dwell: false, room: 'living_room' },
  { presence: true, motion: 'active', bmp: 18, fallen: false, dwell: false, room: 'living_room', heartRate: 68 },
  { presence: true, motion: 'active', bmp: 22, fallen: false, dwell: false, room: 'living_room', heartRate: 71 },
  { presence: true, motion: 'active', bmp: 12, fallen: false, dwell: false, room: 'living_room', heartRate: 69 },
  // Fall impact
  { presence: true, motion: 'active', bmp: 87, fallen: true, dwell: false, room: 'living_room', heartRate: 95 },
  // Post-fall still
  { presence: true, motion: 'still', bmp: 1, fallen: true, dwell: false, room: 'living_room', heartRate: 88 },
  // Dwell begins
  { presence: true, motion: 'still', bmp: 1, fallen: true, dwell: true, room: 'living_room', heartRate: 82 },
  { presence: true, motion: 'still', bmp: 1, fallen: true, dwell: true, room: 'living_room', heartRate: 79 },
  // Recovery attempt
  { presence: true, motion: 'active', bmp: 14, fallen: true, dwell: false, room: 'living_room', heartRate: 85 },
  // Recovered
  { presence: true, motion: 'active', bmp: 9, fallen: false, dwell: false, room: 'living_room', heartRate: 74 },
  // Room empty
  { presence: false, motion: 'none', bmp: 0, fallen: false, dwell: false, room: 'living_room' },
  // Back to normal
  { presence: true, motion: 'active', bmp: 15, fallen: false, dwell: false, room: 'living_room', heartRate: 67 },
  { presence: true, motion: 'still', bmp: 3, fallen: false, dwell: false, room: 'living_room', heartRate: 65 },
  { presence: true, motion: 'active', bmp: 11, fallen: false, dwell: false, room: 'living_room', heartRate: 66 },
]


type UseMockWebSocketResult = {
  frame: WsFrame | null
  connected: boolean
  error: string | null
}

// Set to true to simulate a fallen state, false for safe state
export let MOCK_FALLEN = false

export function setMockFallen(fallen: boolean) {
  MOCK_FALLEN = fallen
}

export function useMockWebSocket(): UseMockWebSocketResult {
  const [frame, setFrame] = useState<WsFrame | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const connectTimer = setTimeout(() => {
      setConnected(true)
      setFrame({ ...MOCK_SEQUENCE[0], timestamp: new Date().toISOString() })
    }, 500)

    return () => clearTimeout(connectTimer)
  }, [])

  return { frame, connected, error: null }
}

import type { FallStatus } from '../types/monitoring'
import { useMockWebSocket } from '../lib/mock-websocket'
import { useWebSocket } from '../lib/websocket'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_WS === 'true'
const WS_URL = import.meta.env.VITE_WS_URL as string | undefined

export function usePatientData() {
  // Both hooks must always be called (Rules of Hooks)
  const mock = useMockWebSocket()
  const real = useWebSocket(USE_MOCK ? undefined : WS_URL)

  const { frame, connected } = USE_MOCK ? mock : real

  const fallStatus: FallStatus = frame?.fallen ? 'fallen' : 'not_fallen'

  return { frame, connected, fallStatus }
}

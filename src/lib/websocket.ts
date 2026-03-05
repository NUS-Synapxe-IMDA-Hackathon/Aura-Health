import { useEffect, useRef, useState } from 'react'
import type { WsFrame } from '../types/monitoring'

type UseWebSocketResult = {
  frame: WsFrame | null
  connected: boolean
  error: string | null
}

export function useWebSocket(url?: string): UseWebSocketResult {
  const [frame, setFrame] = useState<WsFrame | null>(null)
  const [connected, setConnected] = useState(false)
  const [wsError, setWsError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!url) return

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      setWsError(null)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as WsFrame
        setFrame(data)
      } catch {
        console.error('[ws] Failed to parse frame', event.data)
      }
    }

    ws.onerror = () => {
      setWsError('WebSocket error')
    }

    ws.onclose = () => {
      setConnected(false)
    }

    return () => {
      ws.close()
    }
  }, [url])

  const error = url ? wsError : 'No WebSocket URL configured'
  return { frame, connected, error }
}

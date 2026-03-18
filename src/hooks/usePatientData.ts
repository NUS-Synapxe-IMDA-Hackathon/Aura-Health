import type { FallStatus } from "../types/monitoring";
import { useMockWebSocket } from "../lib/mock-websocket";
import { useWebSocket } from "../lib/websocket";
import { useFallDetectorWs } from "./useFallDetectorWs";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_WS === "true";
const WS_URL = import.meta.env.VITE_WS_URL as string | undefined;
const FALL_DETECTOR_URL = import.meta.env.VITE_FALL_DETECTOR_WS_URL as string | undefined;

export function usePatientData() {
  // Both hooks must always be called (Rules of Hooks)
  const mock = useMockWebSocket();
  const real = useWebSocket(USE_MOCK ? undefined : WS_URL);
  const fallDetector = useFallDetectorWs(USE_MOCK ? undefined : FALL_DETECTOR_URL);

  const { frame, connected } = USE_MOCK ? mock : real;

  // Fall detector takes priority over mmWave sensor for fall status
  const fallStatus: FallStatus =
    (!USE_MOCK && fallDetector.fallen) || frame?.fallen
      ? "fallen"
      : "not_fallen";

  return { frame, connected, fallStatus, fallDetector };
}

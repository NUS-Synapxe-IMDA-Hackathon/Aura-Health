import { useOutletContext, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { AlertRow } from "../components/shared/AlertRow";
import type { PatientContext } from "../types/monitoring";

const ROOM_LABELS: Record<string, string> = {
  living_room: "Living / Dining",
  bathroom: "Bathroom",
  bedroom: "Bedroom",
  kitchen: "Kitchen",
};

const ROOM_KEY: Record<string, string> = {
  living_room: "living",
  bathroom: "bath",
  bedroom: "bedroom",
  kitchen: "kitchen",
};

const ROOM_DOT: Record<string, { cx: number; cy: number }> = {
  living: { cx: 217, cy: 110 },
  bath: { cx: 152, cy: 198 },
  bedroom: { cx: 92, cy: 84 },
  kitchen: { cx: 305, cy: 99 },
};

function riskLabel(score: number, isFallen: boolean): string {
  if (isFallen) return `High · Score ${score}`;
  if (score >= 67) return `High · Score ${score}`;
  if (score >= 34) return `Medium · Score ${score}`;
  return `Low · Score ${score}`;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const {
    frame,
    connected,
    fallStatus,
    alertActions,
    onAlertAction,
    liveFallSnapshot,
    alerts,
    riskScores,
  } = useOutletContext<PatientContext>();
  const isFallen = fallStatus === "fallen";
  const room = "living_room";
  const roomLabel = ROOM_LABELS[room] ?? room;
  const activeRoom = ROOM_KEY[room] ?? "living";
  const heartRate = connected && frame?.heartRate ? frame.heartRate : null;
  const beatDuration = heartRate ? `${(60 / heartRate).toFixed(2)}s` : "0s";
  const dot = ROOM_DOT[activeRoom] ?? ROOM_DOT.living;
  const riskScore = riskScores[riskScores.length - 1] ?? 0;

  const recentAlerts = [
    ...(liveFallSnapshot ? [liveFallSnapshot] : []),
    ...alerts.slice(0, liveFallSnapshot ? 2 : 3),
  ];

  return (
    <div className="pb-5">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-6 pb-6">
        <div>
          <p
            className="text-[30px] leading-none text-[#212529]"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Doris Ching
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[13px] text-[#6c757d]">67 · {roomLabel}</span>
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
                connected
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-[#f8f8ff] text-[#adb5bd]",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  connected ? "bg-emerald-500 animate-pulse" : "bg-[#adb5bd]",
                )}
              />
              {connected ? "Live" : "Offline"}
            </div>
          </div>
        </div>
        <button className="size-10 rounded-full bg-[#E8EAFF] flex items-center justify-center text-[14px] font-bold text-[#5b0df5] -mt-1">
          LC
        </button>
      </div>

      <div className="space-y-2.5 px-4">
        {/* Heart Rate + Sleep cards — equal height grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Heart Rate */}
          <div className="bg-white rounded-[24px] border border-[#E8EAFF] shadow-[0_2px_8px_rgba(91,13,245,0.06)] p-4 flex flex-col">
            <p className="text-[10px] font-bold tracking-[.07em] uppercase text-[#6c757d]">
              Heart Rate
            </p>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span
                className={`text-[36px] font-bold leading-none tracking-[-0.03em] ${heartRate ? "text-rose-500" : "text-slate-300"}`}
              >
                {heartRate ?? "--"}
              </span>
              {heartRate && (
                <span className="text-[13px] text-[#6c757d] font-medium">
                  bpm
                </span>
              )}
            </div>
            <p
              className={`text-[12px] font-semibold mt-1 ${heartRate ? "text-emerald-600" : "text-[#6c757d]"}`}
            >
              {heartRate ? "Normal" : "Not detected"}
            </p>
            <div className="flex-1 min-h-4" />
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#6c757d]">Live · now</span>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="#fecdd3"
                stroke="#e11d48"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transformOrigin: "center",
                  animation: heartRate
                    ? `heartbeat ${beatDuration} ease-in-out infinite`
                    : "none",
                }}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
          </div>

          {/* Sleep */}
          <div className="bg-white rounded-[24px] border border-[#E8EAFF] shadow-[0_2px_8px_rgba(91,13,245,0.06)] p-4 flex flex-col">
            <p className="text-[10px] font-bold tracking-[.07em] uppercase text-[#6c757d]">
              Sleep
            </p>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-[36px] font-bold leading-none tracking-[-0.03em] text-[#5b0df5]">
                88
              </span>
              <span className="text-[13px] text-[#6c757d] font-medium">
                / 100
              </span>
            </div>
            <p className="text-[12px] font-semibold text-[#5b0df5] mt-1">
              Good · 8h 00m
            </p>
            <div className="flex-1 min-h-4" />
            <div className="flex rounded overflow-hidden h-1.5">
              <div className="bg-cyan-600" style={{ width: "64%" }} />
              <div className="bg-sky-300" style={{ width: "25%" }} />
              <div className="bg-amber-200" style={{ width: "11%" }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[9px] font-bold text-cyan-700">
                64% deep
              </span>
              <span className="text-[9px] font-bold text-sky-600">
                25% light
              </span>
              <span className="text-[9px] font-bold text-amber-700">
                11% awake
              </span>
            </div>
          </div>
        </div>

        {/* Fall Risk banner */}
        <button
          className="w-full bg-[#212529] rounded-[24px] p-4 flex items-center justify-between touch-manipulation text-left"
          onClick={() => navigate("/falls", { state: { riskReport: true } })}
        >
          <div>
            <p className="text-[10px] font-bold tracking-[.08em] uppercase text-white/50">
              Fall Risk
            </p>
            <p className="text-[18px] font-bold text-white mt-0.5 tracking-tight">
              {riskLabel(riskScore, false)}
            </p>
            <p className="text-[12px] text-white/50 mt-0.5">
              Continuously monitored
            </p>
          </div>
          <div
            className={cn(
              "size-14 rounded-full border-[3px] flex flex-col items-center justify-center",
              "border-emerald-400",
            )}
          >
            <span className="text-[18px] font-bold text-white leading-none">
              {riskScore}
            </span>
            <span className="text-[8px] font-bold uppercase tracking-wide text-white/50">
              risk
            </span>
          </div>
        </button>

        {/* Floorplan */}
        <div className="bg-white rounded-[24px] border border-[#E8EAFF] shadow-[0_2px_8px_rgba(91,13,245,0.06)] p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[16px] font-bold text-[#212529]">
                {roomLabel}
              </p>
              <p className="text-[12px] text-[#6c757d] mt-0.5">
                Home · Last updated now
              </p>
            </div>
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-[12px] font-bold",
                isFallen
                  ? "bg-rose-50 text-rose-600"
                  : "bg-emerald-50 text-emerald-600",
              )}
            >
              {isFallen ? "Fall" : "Safe"}
            </span>
          </div>
          <div className="bg-[#f8f8ff] border border-[#E8EAFF] rounded-[14px] p-2">
            <svg
              viewBox="0 0 360 260"
              className="w-full h-auto"
              aria-label="Home floorplan"
            >
              <rect
                x="8"
                y="8"
                width="344"
                height="244"
                rx="6"
                fill="#f8f8ff"
                stroke="#dee2e6"
                strokeWidth="2"
              />
              <rect
                x="20"
                y="20"
                width="145"
                height="115"
                fill={
                  activeRoom === "bedroom"
                    ? isFallen
                      ? "#fecdd3"
                      : "#bbf7d0"
                    : "#f8f8ff"
                }
                stroke="#dee2e6"
                strokeWidth="1.5"
              />
              <rect
                x="165"
                y="20"
                width="105"
                height="115"
                fill={
                  activeRoom === "living"
                    ? isFallen
                      ? "#fecdd3"
                      : "#bbf7d0"
                    : "#f8f8ff"
                }
                stroke="#dee2e6"
                strokeWidth="1.5"
              />
              <rect
                x="270"
                y="55"
                width="70"
                height="80"
                fill={
                  activeRoom === "kitchen"
                    ? isFallen
                      ? "#fecdd3"
                      : "#bbf7d0"
                    : "#f8f8ff"
                }
                stroke="#dee2e6"
                strokeWidth="1.5"
              />
              <rect
                x="78"
                y="150"
                width="148"
                height="90"
                fill={
                  activeRoom === "bath"
                    ? isFallen
                      ? "#fecdd3"
                      : "#bbf7d0"
                    : "#f8f8ff"
                }
                stroke="#dee2e6"
                strokeWidth="1.5"
              />
              <line
                x1="20"
                y1="135"
                x2="340"
                y2="135"
                stroke="#dee2e6"
                strokeWidth="1.5"
              />
              <line
                x1="270"
                y1="55"
                x2="270"
                y2="135"
                stroke="#dee2e6"
                strokeWidth="1.5"
              />
              <line
                x1="226"
                y1="150"
                x2="226"
                y2="240"
                stroke="#dee2e6"
                strokeWidth="1.5"
              />
              <text
                x="92"
                y="84"
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill={activeRoom === "bedroom" ? "#212529" : "#adb5bd"}
              >
                BEDROOM
              </text>
              <text
                x="217"
                y="78"
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill={activeRoom === "living" ? "#212529" : "#adb5bd"}
              >
                LIVING/
              </text>
              <text
                x="217"
                y="93"
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill={activeRoom === "living" ? "#212529" : "#adb5bd"}
              >
                DINING
              </text>
              <text
                x="305"
                y="99"
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill={activeRoom === "kitchen" ? "#212529" : "#adb5bd"}
              >
                KITCHEN
              </text>
              <text
                x="152"
                y="198"
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill={activeRoom === "bath" ? "#212529" : "#adb5bd"}
              >
                BATH
              </text>
              {/* Location dot with outer ring */}
              <circle
                cx={dot.cx}
                cy={dot.cy}
                r="10"
                fill={isFallen ? "#e11d48" : "#10b981"}
                opacity="0.25"
              />
              <circle
                cx={dot.cx}
                cy={dot.cy}
                r="6"
                fill={isFallen ? "#e11d48" : "#10b981"}
              />
            </svg>
          </div>
        </div>

        {/* Recent Alerts */}
        <p className="text-[11px] font-bold tracking-[.08em] text-[#6c757d] uppercase px-1 mt-4">
          Recent Alerts
        </p>
        <div className="space-y-2">
          {recentAlerts.map((alert) => (
            <AlertRow
              key={alert.id}
              alert={alert}
              actionTaken={alertActions[alert.id] ?? null}
              onAction={(label) => onAlertAction(alert.id, label)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

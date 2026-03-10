import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { monthlyRiskScores } from "../data/mock";
import type { DailyRiskData, Report } from "../types/monitoring";

const RESIDENT_ID = "20000001-0000-4000-8000-000000000001";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function reportToScores(report: Report): number[] | null {
  if (report.type !== "daily_risk") return null;

  const riskData = report.data as DailyRiskData;
  const trendScores = (riskData.trend_data ?? [])
    .map((point) => point.score)
    .filter(isFiniteNumber);

  if (trendScores.length > 0) {
    return trendScores;
  }

  const fallback = [riskData.previous_score, riskData.risk_score].filter(
    isFiniteNumber,
  );
  return fallback.length > 0 ? fallback : null;
}

export function useRiskScores() {
  const [scores, setScores] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setScores(monthlyRiskScores);
      setLoading(false);
      return;
    }

    async function fetchScores() {
      try {
        const { data, error } = await supabase!
          .from("reports")
          .select("*")
          .eq("resident_id", RESIDENT_ID)
          .eq("type", "daily_risk")
          .order("generated_at", { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          const nextScores = reportToScores(data[0] as Report);
          setScores(nextScores ?? monthlyRiskScores);
        } else {
          setScores(monthlyRiskScores);
        }
      } catch (err) {
        console.error("[useRiskScores]", err);
        setScores(monthlyRiskScores);
      } finally {
        setLoading(false);
      }
    }

    fetchScores();
  }, []);

  function applyLiveReport(report: Report) {
    const nextScores = reportToScores(report);
    if (!nextScores) return;
    setScores(nextScores);
  }

  return { scores, loading, applyLiveReport };
}

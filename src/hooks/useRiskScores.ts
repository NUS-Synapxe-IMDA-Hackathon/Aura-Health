import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { monthlyRiskScores } from "../data/mock";
import type { DailyRiskData } from "../types/monitoring";

const RESIDENT_ID = "20000001-0000-4000-8000-000000000001";

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
          const reportData = data[0].data as DailyRiskData;
          if (reportData?.trend_data) {
            setScores(reportData.trend_data.map((p) => p.score));
          } else {
            setScores(monthlyRiskScores);
          }
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

  return { scores, loading };
}

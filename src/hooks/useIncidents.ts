import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { mockIncident } from "../data/mock";
import type { Incident } from "../types/monitoring";

const RESIDENT_ID = "20000001-0000-4000-8000-000000000001";

export function useIncidents() {
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [pastIncidents, setPastIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setPastIncidents([
        {
          ...mockIncident,
          status: "resolved",
          resolved_at: "2026-03-07T06:00:00Z",
        },
      ]);
      setLoading(false);
      return;
    }

    async function fetchIncidents() {
      try {
        const { data, error } = await supabase!
          .from("incidents")
          .select("*")
          .eq("resident_id", RESIDENT_ID)
          .order("started_at", { ascending: false })
          .limit(20);

        if (error) throw error;

        const incidents = (data ?? []) as Incident[];
        const active = incidents.find((i) => !i.resolved_at) ?? null;
        const past = incidents.filter((i) => i.resolved_at);

        setActiveIncident(active);
        setPastIncidents(past);
      } catch (err) {
        console.error("[useIncidents]", err);
        setPastIncidents([
          {
            ...mockIncident,
            status: "resolved",
            resolved_at: "2026-03-07T06:00:00Z",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchIncidents();
  }, []);

  const resolveIncident = useCallback((id: string) => {
    setActiveIncident((prev) => {
      if (prev?.id !== id) return prev;
      const resolved = {
        ...prev,
        status: "resolved" as const,
        resolved_at: new Date().toISOString(),
      };
      setPastIncidents((past) => [resolved, ...past]);
      return null;
    });
  }, []);

  return {
    activeIncident,
    pastIncidents,
    loading,
    setActiveIncident,
    resolveIncident,
  };
}

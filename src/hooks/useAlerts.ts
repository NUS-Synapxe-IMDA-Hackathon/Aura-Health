import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { alertToAlertItem } from "../lib/alertAdapter";
import { alerts as mockAlerts } from "../data/mock";
import type { Alert, AlertItem } from "../types/monitoring";

const RESIDENT_ID = "20000001-0000-4000-8000-000000000001";

export function useAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setAlerts(mockAlerts);
      setLoading(false);
      return;
    }

    async function fetchAlerts() {
      try {
        const { data, error } = await supabase!
          .from("alerts")
          .select("*")
          .eq("resident_id", RESIDENT_ID)
          .order("timestamp", { ascending: false })
          .limit(50);

        if (error) throw error;
        setAlerts((data ?? []).map((row) => alertToAlertItem(row as Alert)));
      } catch (err) {
        console.error("[useAlerts]", err);
        setAlerts(mockAlerts);
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
  }, []);

  const addLiveAlert = useCallback((alert: Alert) => {
    const item = alertToAlertItem(alert);
    setAlerts((prev) => {
      if (prev.some((a) => a.id === item.id)) return prev;
      return [item, ...prev];
    });
  }, []);

  return { alerts, loading, addLiveAlert };
}

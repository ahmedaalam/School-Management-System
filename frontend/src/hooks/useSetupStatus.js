import { useCallback, useEffect, useState } from "react";
import { ENDPOINTS } from "../api/config";
import { isSetupComplete } from "../config/setupSteps";
import useApi from "./useApi";

const EMPTY_COUNTS = { campuses: 0, subjects: 0, classes: 0, sections: 0, timetable: 0 };

export default function useSetupStatus() {
  const api = useApi();
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [camp, sub, secRes, tt] = await Promise.all([
        api.get(ENDPOINTS.campuses),
        api.get(ENDPOINTS.subjects),
        api.get(ENDPOINTS.sections),
        api.get(ENDPOINTS.timetable),
      ]);
      const allSections = secRes.data;
      setCounts({
        campuses: camp.data.length,
        subjects: sub.data.length,
        classes: allSections.filter((s) => s.kind === "class").length,
        sections: allSections.filter((s) => s.kind !== "class").length,
        timetable: tt.data.length,
      });
    } catch {
      setCounts(EMPTY_COUNTS);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [api]);

  useEffect(() => { refresh(); }, [refresh]);

  return {
    counts,
    loading,
    refresh,
    isComplete: isSetupComplete(counts),
  };
}

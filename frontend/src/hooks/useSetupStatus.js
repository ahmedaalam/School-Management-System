import { useCallback, useEffect, useState } from "react";
import { ENDPOINTS } from "../api/config";
import { isSetupComplete } from "../config/setupSteps";
import useApi from "./useApi";

const EMPTY_COUNTS = { campuses: 0, subjects: 0, sections: 0, students: 0, timetable: 0 };

export default function useSetupStatus() {
  const api = useApi();
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [camp, sub, sec, users, tt] = await Promise.all([
        api.get(ENDPOINTS.campuses),
        api.get(ENDPOINTS.subjects),
        api.get(ENDPOINTS.sections),
        api.get(ENDPOINTS.users),
        api.get(ENDPOINTS.timetable),
      ]);
      setCounts({
        campuses: camp.data.length,
        subjects: sub.data.length,
        sections: sec.data.length,
        students: users.data.length,
        timetable: tt.data.length,
      });
    } catch {
      setCounts(EMPTY_COUNTS);
    } finally {
      setLoading(false);
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

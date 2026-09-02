import { useEffect, useState } from "react";
import { getLookups } from "../api/lookups.js";

export function useLookups() {
  const [lookups, setLookups] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getLookups()
      .then((data) => {
        if (!cancelled) setLookups(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { lookups, loading, error };
}

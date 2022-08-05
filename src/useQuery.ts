import { useMemo } from "react";
import { useLocation } from "react-router";

export const useQuery = (): Record<string, any> => {
  const { search } = useLocation();

  return useMemo(() => {
    const query = new URLSearchParams(search)

    const queryObject = Array.from(query.entries()).reduce((acc, [key, val]) => ({
      ...acc,
      [key]: val
    }), {})

    return queryObject || {}
  }, [search])
}

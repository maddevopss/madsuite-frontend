import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useMonthlyData(year) {
  return useQuery({
    queryKey: ["reports", "monthly", year],
    queryFn: async () => {
      const { data } = await axios.get("/api/reports/monthly-data", {
        params: { year },
      });
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache 5 min
    gcTime: 10 * 60 * 1000, // Keep 10 min in memory
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

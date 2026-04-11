import { useQuery } from "@tanstack/react-query";
import { fetchSettings } from "@/lib/api";

export type SiteSettings = Record<string, string | null>;

export function useSettings() {
  return useQuery<SiteSettings>({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 30, // 30 min — settings change rarely
  });
}

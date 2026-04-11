import { useQuery } from "@tanstack/react-query";
import { fetchServices } from "@/lib/api";

export interface Service {
  id: number;
  title: string;
  slug: string;
  description?: string;
  icon_name?: string;
  sort_order: number;
}

export interface PaginatedServices {
  items: Service[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export function useServices() {
  return useQuery<PaginatedServices>({
    queryKey: ["services"],
    queryFn: fetchServices,
  });
}

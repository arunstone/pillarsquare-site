import { useQuery } from "@tanstack/react-query";
import { fetchTestimonials } from "@/lib/api";

export interface Testimonial {
  id: number;
  client_name: string;
  client_role?: string;
  content: string;
  rating: number;
  is_featured: boolean;
  created_at: string;
}

export interface PaginatedTestimonials {
  items: Testimonial[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export function useTestimonials(featuredOnly?: boolean) {
  return useQuery<PaginatedTestimonials>({
    queryKey: ["testimonials", { featuredOnly }],
    queryFn: () => fetchTestimonials(featuredOnly),
  });
}

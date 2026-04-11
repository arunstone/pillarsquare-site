import { useQuery } from "@tanstack/react-query";
import { fetchProjects, fetchProject } from "@/lib/api";

export interface ProjectImage {
  id: number;
  image_url: string;
  caption?: string;
  sort_order: number;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  description?: string;
  category: "residential" | "commercial" | "renovation";
  location?: string;
  area_sqft?: number;
  status: "completed" | "ongoing" | "upcoming";
  featured_image?: string;
  is_featured: boolean;
  created_at: string;
  images?: ProjectImage[];
}

export interface PaginatedProjects {
  items: Project[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

interface ProjectFilters {
  category?: string;
  status?: string;
  featured?: boolean;
  page?: number;
  size?: number;
}

export function useProjects(filters?: ProjectFilters) {
  return useQuery<PaginatedProjects>({
    queryKey: ["projects", filters],
    queryFn: () => fetchProjects(filters as Record<string, string | boolean | number>),
  });
}

export function useProject(slug: string) {
  return useQuery<Project>({
    queryKey: ["project", slug],
    queryFn: () => fetchProject(slug),
    enabled: !!slug,
  });
}

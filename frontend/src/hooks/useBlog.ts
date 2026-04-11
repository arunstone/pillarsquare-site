import { useQuery } from "@tanstack/react-query";
import { fetchPosts, fetchPost } from "@/lib/api";

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
}

export interface BlogPostDetail extends BlogPost {
  content?: string;
}

export interface PaginatedPosts {
  items: BlogPost[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export function useBlogPosts(page = 1, size = 10) {
  return useQuery<PaginatedPosts>({
    queryKey: ["blog", { page, size }],
    queryFn: () => fetchPosts({ page, size }),
  });
}

export function useBlogPost(slug: string) {
  return useQuery<BlogPostDetail>({
    queryKey: ["blog", slug],
    queryFn: () => fetchPost(slug),
    enabled: !!slug,
  });
}

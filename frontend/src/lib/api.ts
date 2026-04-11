/// <reference types="vite/client" />
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ── Projects ──────────────────────────────────────────────────────────────────
export const fetchProjects = (params?: Record<string, string | boolean | number>) =>
  api.get("/projects", { params }).then((r) => r.data);

export const fetchProject = (slug: string) =>
  api.get(`/projects/${slug}`).then((r) => r.data);

// ── Services ──────────────────────────────────────────────────────────────────
export const fetchServices = () =>
  api.get("/services").then((r) => r.data);

// ── Testimonials ──────────────────────────────────────────────────────────────
export const fetchTestimonials = (featured?: boolean) =>
  api.get("/testimonials", { params: featured ? { featured_only: true } : undefined }).then((r) => r.data);

// ── Blog ──────────────────────────────────────────────────────────────────────
export const fetchPosts = (params?: Record<string, string | number>) =>
  api.get("/blog", { params }).then((r) => r.data);

export const fetchPost = (slug: string) =>
  api.get(`/blog/${slug}`).then((r) => r.data);

// ── Inquiry / Contact ─────────────────────────────────────────────────────────
export const submitInquiry = (data: {
  name: string;
  phone: string;
  email?: string;
  message?: string;
}) => api.post("/inquiries", data).then((r) => r.data);

// ── Site Settings ─────────────────────────────────────────────────────────────
export const fetchSettings = () =>
  api.get("/settings").then((r) => r.data);

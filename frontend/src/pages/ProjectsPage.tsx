import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/lib/api";
import ProjectCard from "@/components/ProjectCard";
import SectionHeader from "@/components/SectionHeader";

const CATEGORIES = ["all", "residential", "commercial", "renovation"];
const STATUSES = ["all", "completed", "ongoing", "upcoming"];

export default function ProjectsPage() {
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const params: Record<string, string> = {};
  if (category !== "all") params.category = category;
  if (status !== "all") params.status = status;

  const { data, isLoading } = useQuery({
    queryKey: ["projects", category, status],
    queryFn: () => fetchProjects(params),
  });

  return (
    <>
      <Helmet>
        <title>Projects | Pillar Square Properties</title>
      </Helmet>

      <div className="pt-24 pb-20">
        <div className="container-custom">
          <SectionHeader
            subtitle="Portfolio"
            title="Our Projects"
            description="Explore our portfolio of residential, commercial, and renovation projects across Chennai."
          />

          {/* Filters */}
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                    category === c
                      ? "bg-brand-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {c === "all" ? "All Categories" : c}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                    status === s
                      ? "bg-charcoal-800 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s === "all" ? "All Status" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="card aspect-[4/3] animate-pulse bg-gray-200" />
                  ))
              : (data?.items ?? []).map((p: any) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
          </div>

          {!isLoading && !data?.items?.length && (
            <p className="text-center text-gray-400 mt-20">No projects found.</p>
          )}
        </div>
      </div>
    </>
  );
}

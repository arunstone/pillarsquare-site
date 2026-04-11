import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { fetchProject, fetchProjects } from "@/lib/api";
import { MapPin, Ruler, Tag, Activity, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", slug],
    queryFn: () => fetchProject(slug!),
    enabled: !!slug,
  });

  const { data: allProjectsData } = useQuery<{ items: any[] }>({
    queryKey: ["projects", "all"],
    queryFn: () => fetchProjects({ limit: "20" }),
    enabled: !!project,
  });

  const related = (allProjectsData?.items ?? [])
    .filter((p) => p.slug !== slug && p.category === project?.category)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 animate-pulse">
          <div className="h-5 w-32 rounded mb-6" style={{ background: "var(--bg-elevated)" }} />
          <div className="h-96 rounded-lg mb-8" style={{ background: "var(--bg-elevated)" }} />
          <div className="h-8 w-64 rounded mb-4" style={{ background: "var(--bg-elevated)" }} />
          <div className="h-4 w-full rounded" style={{ background: "var(--bg-elevated)" }} />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="pt-24 text-center">
        <p style={{ color: "var(--text-secondary)" }}>Project not found.</p>
        <Link to="/projects" className="btn-primary mt-4 inline-flex">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{project.title} | Pillar Square Properties</title>
        <meta name="description" content={project.description?.slice(0, 160)} />
      </Helmet>

      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          {/* Back link */}
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm mb-6 transition-colors duration-200 hover:opacity-80"
            style={{ color: "var(--accent-gold)" }}
          >
            <ArrowLeft size={15} /> Back to Projects
          </Link>

          {/* Featured image */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg overflow-hidden mb-8"
            style={{ maxHeight: "500px" }}
          >
            <img
              src={project.featured_image || "/placeholder-project.jpg"}
              alt={project.title}
              className="w-full object-cover"
              style={{ maxHeight: "500px" }}
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl font-display font-semibold mb-5"
            style={{ color: "var(--text-primary)" }}
          >
            {project.title}
          </motion.h1>

          {/* Info row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-6 mb-8 pb-8"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            {project.category && (
              <div className="flex items-center gap-2">
                <Tag size={14} style={{ color: "var(--accent-gold)" }} />
                <span className="text-xs uppercase tracking-widest" style={{ color: "var(--accent-gold)" }}>Category</span>
                <span className="text-sm capitalize ml-1" style={{ color: "var(--text-primary)" }}>{project.category}</span>
              </div>
            )}
            {project.location && (
              <div className="flex items-center gap-2">
                <MapPin size={14} style={{ color: "var(--accent-gold)" }} />
                <span className="text-xs uppercase tracking-widest" style={{ color: "var(--accent-gold)" }}>Location</span>
                <span className="text-sm ml-1" style={{ color: "var(--text-primary)" }}>{project.location}</span>
              </div>
            )}
            {project.area_sqft && (
              <div className="flex items-center gap-2">
                <Ruler size={14} style={{ color: "var(--accent-gold)" }} />
                <span className="text-xs uppercase tracking-widest" style={{ color: "var(--accent-gold)" }}>Area</span>
                <span className="text-sm ml-1" style={{ color: "var(--text-primary)" }}>{project.area_sqft.toLocaleString()} sq.ft</span>
              </div>
            )}
            {project.status && (
              <div className="flex items-center gap-2">
                <Activity size={14} style={{ color: "var(--accent-gold)" }} />
                <span className="text-xs uppercase tracking-widest" style={{ color: "var(--accent-gold)" }}>Status</span>
                <span className="text-sm capitalize ml-1" style={{ color: "var(--text-primary)" }}>{project.status}</span>
              </div>
            )}
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="max-w-3xl mb-12 text-base"
            style={{ color: "var(--text-secondary)", lineHeight: "1.8" }}
          >
            {project.description}
          </motion.p>

          {/* Gallery */}
          {project.images?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2
                className="text-xl font-display font-semibold mb-5"
                style={{ color: "var(--text-primary)" }}
              >
                Gallery
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {project.images.map((img: any) => (
                  <div
                    key={img.id}
                    className="rounded-lg overflow-hidden"
                    style={{ maxHeight: "300px" }}
                  >
                    <img
                      src={img.image_url}
                      alt={img.caption || project.title}
                      className="w-full object-cover hover:scale-105 transition-transform duration-300"
                      style={{ maxHeight: "300px" }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Enquire CTA */}
          <div className="mb-16">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-opacity duration-200 hover:opacity-80"
              style={{ background: "var(--accent-gold)", color: "#0a0a0f" }}
            >
              Enquire About This Project
            </Link>
          </div>

          {/* Related projects */}
          {related.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h2
                className="text-xl font-display font-semibold mb-6"
                style={{ color: "var(--text-primary)" }}
              >
                Related Projects
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {related.map((p: any) => (
                  <Link
                    key={p.id}
                    to={`/projects/${p.slug}`}
                    className="group rounded-lg overflow-hidden transition-opacity duration-200 hover:opacity-90"
                    style={{ border: "1px solid var(--border)", background: "var(--bg-secondary)" }}
                  >
                    <div className="overflow-hidden" style={{ height: "160px" }}>
                      <img
                        src={p.featured_image || "/placeholder-project.jpg"}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--accent-gold)" }}>
                        {p.category}
                      </p>
                      <h3 className="text-sm font-semibold line-clamp-2" style={{ color: "var(--text-primary)" }}>
                        {p.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </>
  );
}

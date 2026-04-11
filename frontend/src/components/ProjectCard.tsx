import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: number;
  title: string;
  slug: string;
  category: string;
  location: string;
  area_sqft: number | null;
  status: "completed" | "ongoing" | "upcoming";
  featured_image: string | null;
  description: string;
}

const statusColors = {
  completed: "bg-green-100 text-green-700",
  ongoing: "bg-brand-100 text-brand-700",
  upcoming: "bg-blue-100 text-blue-700",
};

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="card group"
    >
      <Link to={`/projects/${project.slug}`}>
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={project.featured_image || "/placeholder-project.jpg"}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span
            className={cn(
              "absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold capitalize",
              statusColors[project.status]
            )}
          >
            {project.status}
          </span>
        </div>

        <div className="p-5">
          <p className="text-xs text-brand-500 font-semibold uppercase tracking-wider mb-1 capitalize">
            {project.category}
          </p>
          <h3 className="text-lg font-display font-semibold text-charcoal-900 group-hover:text-brand-500 transition-colors line-clamp-2">
            {project.title}
          </h3>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={14} className="text-brand-400" />
              {project.location}
            </span>
            {project.area_sqft && (
              <span className="flex items-center gap-1">
                <Ruler size={14} className="text-brand-400" />
                {project.area_sqft.toLocaleString()} sq.ft
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import SectionHeader from "@/components/SectionHeader";

export default function BlogPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => fetchPosts(),
  });

  return (
    <>
      <Helmet>
        <title>Blog | Pillar Square Properties</title>
      </Helmet>

      <div className="pt-24 pb-20">
        <div className="container-custom">
          <SectionHeader
            subtitle="Insights"
            title="Construction & Real Estate Blog"
            description="Tips, trends, and stories from our team of construction experts."
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="card animate-pulse">
                      <div className="aspect-video bg-gray-200" />
                      <div className="p-5">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                        <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                        <div className="h-3 bg-gray-100 rounded w-5/6" />
                      </div>
                    </div>
                  ))
              : (data?.items ?? []).map((post: any, i: number) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="card group"
                  >
                    <Link to={`/blog/${post.slug}`}>
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.featured_image || "/placeholder-blog.jpg"}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5">
                        <time className="text-xs" style={{ color: "var(--text-dim)" }}>
                          {formatDate(post.published_at)}
                        </time>
                        <h2 className="mt-2 font-display font-semibold transition-colors line-clamp-2" style={{ color: "var(--accent-gold)" }}>
                          {post.title}
                        </h2>
                        <p className="mt-2 text-sm line-clamp-3" style={{ color: "var(--text-secondary)" }}>
                          {post.excerpt}
                        </p>
                        <span className="mt-4 inline-block text-sm font-semibold" style={{ color: "var(--accent-gold)" }}>
                          Read More →
                        </span>
                      </div>
                    </Link>
                  </motion.article>
                ))}
          </div>
        </div>
      </div>
    </>
  );
}

import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { fetchPost } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPost(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="pt-24 container-custom max-w-3xl animate-pulse">
        <div className="h-64 rounded-2xl mb-8" style={{ background: "var(--bg-elevated)" }} />
        <div className="h-8 w-3/4 rounded mb-4" style={{ background: "var(--bg-elevated)" }} />
        <div className="space-y-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-3 rounded" style={{ background: "var(--bg-secondary)" }} />
          ))}
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <>
      <Helmet>
        <title>{post.title} | Pillar Square Properties</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      <div className="pt-24 pb-20">
        <div className="container-custom max-w-3xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-gold)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            <ArrowLeft size={16} /> Back to Blog
          </Link>

          {post.featured_image && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden aspect-video mb-8"
            >
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          <time className="text-sm" style={{ color: "var(--text-secondary)" }}>{formatDate(post.published_at)}</time>
          <h1
            className="mt-2 mb-8"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", lineHeight: 1.1, letterSpacing: "-0.02em" }}
          >
            {post.title}
          </h1>

          <article className="prose prose-lg max-w-none" style={{ color: "var(--text-secondary)" }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)", fontSize: "2.25rem", letterSpacing: "-0.02em", marginBottom: "1rem" }}>{children}</h1>,
                h2: ({ children }) => <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)", fontSize: "1.75rem", letterSpacing: "-0.02em", marginTop: "2rem", marginBottom: "0.75rem" }}>{children}</h2>,
                h3: ({ children }) => <h3 style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)", fontSize: "1.35rem", marginTop: "1.5rem", marginBottom: "0.5rem" }}>{children}</h3>,
                p: ({ children }) => <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "1rem" }}>{children}</p>,
                strong: ({ children }) => <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{children}</strong>,
                a: ({ href, children }) => <a href={href} style={{ color: "var(--accent-gold)", textDecoration: "underline" }}>{children}</a>,
                ul: ({ children }) => <ul style={{ color: "var(--text-secondary)", paddingLeft: "1.5rem", marginBottom: "1rem", listStyleType: "disc" }}>{children}</ul>,
                ol: ({ children }) => <ol style={{ color: "var(--text-secondary)", paddingLeft: "1.5rem", marginBottom: "1rem", listStyleType: "decimal" }}>{children}</ol>,
                li: ({ children }) => <li style={{ marginBottom: "0.4rem", lineHeight: 1.7 }}>{children}</li>,
                blockquote: ({ children }) => <blockquote style={{ borderLeft: "3px solid var(--accent-gold)", paddingLeft: "1rem", marginLeft: 0, color: "var(--text-secondary)", fontStyle: "italic" }}>{children}</blockquote>,
                table: ({ children }) => <div style={{ overflowX: "auto", marginBottom: "1rem" }}><table style={{ width: "100%", borderCollapse: "collapse" }}>{children}</table></div>,
                th: ({ children }) => <th style={{ padding: "0.6rem 1rem", textAlign: "left", background: "var(--bg-elevated)", color: "var(--accent-gold)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid var(--border)" }}>{children}</th>,
                td: ({ children }) => <td style={{ padding: "0.6rem 1rem", color: "var(--text-secondary)", border: "1px solid var(--border)", fontSize: "0.9rem" }}>{children}</td>,
                hr: () => <div style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--accent-gold), transparent)", opacity: 0.3, margin: "2rem 0" }} />,
                code: ({ children }) => <code style={{ background: "var(--bg-elevated)", color: "var(--accent-gold)", padding: "0.15rem 0.4rem", fontSize: "0.875em", borderRadius: 2 }}>{children}</code>,
              }}
            >
              {post.content}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </>
  );
}

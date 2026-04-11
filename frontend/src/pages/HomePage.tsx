import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, Users, Award, Clock } from "lucide-react";
import { fetchProjects, fetchServices, fetchTestimonials } from "@/lib/api";
import ProjectCard from "@/components/ProjectCard";
import SectionHeader from "@/components/SectionHeader";
import ContactForm from "@/components/ContactForm";

const stats = [
  { icon: <Building2 size={28} />, value: "200+", label: "Projects Completed" },
  { icon: <Users size={28} />, value: "500+", label: "Happy Clients" },
  { icon: <Award size={28} />, value: "18+", label: "Years Experience" },
  { icon: <Clock size={28} />, value: "100%", label: "On-Time Delivery" },
];

export default function HomePage() {
  const { data: projects } = useQuery<{ items: any[] }>({
    queryKey: ["projects", "featured"],
    queryFn: () => fetchProjects({ featured: "true", limit: "6" }),
  });

  const { data: services } = useQuery<{ items: any[] }>({
    queryKey: ["services"],
    queryFn: () => fetchServices(),
  });

  const { data: testimonials } = useQuery<{ items: any[] }>({
    queryKey: ["testimonials"],
    queryFn: () => fetchTestimonials(),
  });

  return (
    <>
      <Helmet>
        <title>Pillar Square Properties | Premium Construction in Chennai</title>
      </Helmet>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center bg-charcoal-950 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950 via-charcoal-950/80 to-transparent" />

        <div className="container-custom relative z-10 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <p className="section-subtitle text-brand-400 mb-4">
              Chennai's Trusted Builder
            </p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight">
              Building Dreams,{" "}
              <span style={{ color: "var(--accent-gold)" }}>Crafting Legacies</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 leading-relaxed">
              From luxury villas to commercial complexes — Pillar Square Properties delivers
              construction excellence with precision, quality, and trust.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/projects" className="btn-primary">
                View Our Projects <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="btn-outline border-white text-white hover:bg-white">
                Get a Quote
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-1">
            <div className="w-1 h-3 bg-white/60 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <section className="bg-brand-500 py-12">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center text-white"
              >
                <div className="flex justify-center mb-2 opacity-80">{s.icon}</div>
                <div className="text-3xl font-bold">{s.value}</div>
                <div className="text-sm mt-1 opacity-80">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Projects ──────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <SectionHeader
              subtitle="Our Work"
              title="Featured Projects"
              description="A showcase of our finest residential and commercial developments across Chennai."
            />
            <Link to="/projects" className="btn-outline shrink-0">
              All Projects <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(projects?.items ?? Array(6).fill(null)).map((p: any, i: number) =>
              p ? (
                <ProjectCard key={p.id} project={p} />
              ) : (
                <div key={i} className="card aspect-[4/3] animate-pulse bg-gray-200" />
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container-custom">
          <SectionHeader
            subtitle="What We Do"
            title="Our Services"
            description="End-to-end construction and real estate solutions tailored for you."
            center
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(services?.items ?? Array(6).fill(null)).map((s: any, i: number) => (
              <motion.div
                key={s?.id ?? i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--bg-elevated)" }}>
                  <Building2 size={24} style={{ color: "var(--accent-gold)" }} />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2" style={{ color: "var(--text-primary)" }}>
                  {s?.title ?? <span className="inline-block w-32 h-4 bg-gray-200 rounded animate-pulse" />}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {s?.description ?? (
                    <span className="inline-block w-full h-3 bg-gray-100 rounded animate-pulse" />
                  )}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      <section className="py-20 bg-charcoal-900">
        <div className="container-custom">
          <SectionHeader
            subtitle="Client Stories"
            title="What Our Clients Say"
            center
          />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(testimonials?.items ?? Array(3).fill(null)).map((t: any, i: number) => (
              <motion.div
                key={t?.id ?? i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array(t?.rating ?? 5)
                    .fill(0)
                    .map((_, j) => (
                      <span key={j} className="text-brand-400 text-lg">★</span>
                    ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed italic">
                  "{t?.content ?? "..."}"
                </p>
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-white font-semibold">{t?.client_name ?? "..."}</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{t?.client_role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact CTA ────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container-custom">
          <div className="bg-brand-500 rounded-3xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-10 md:p-14 text-white">
                <p className="text-brand-100 text-sm font-semibold uppercase tracking-widest mb-3">
                  Get In Touch
                </p>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  Ready to Build Your Dream?
                </h2>
                <p className="text-brand-100 leading-relaxed">
                  Let's discuss your project. Our team will get back to you within 24 hours
                  with a personalised plan and free consultation.
                </p>
              </div>
              <div className="bg-white p-10 md:p-14">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

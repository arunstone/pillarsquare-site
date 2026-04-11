import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { fetchServices } from "@/lib/api";
import { motion } from "framer-motion";
import { Building2, HardHat, IndianRupee, Wrench } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { Link } from "react-router-dom";

const ICON_MAP: Record<string, React.ElementType> = {
  "building-2": Building2,
  "hard-hat": HardHat,
  "indian-rupee": IndianRupee,
  "wrench": Wrench,
};

function ServiceCard({ s, i }: { s: any; i: number }) {
  const [hovered, setHovered] = useState(false);
  const Icon = ICON_MAP[s?.icon_name] ?? Building2;

  return (
    <motion.div
      key={s?.id ?? i}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "rgba(18,18,26,0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${hovered ? "rgba(200,169,81,0.4)" : "rgba(200,169,81,0.12)"}`,
        boxShadow: hovered ? "0 0 30px rgba(200,169,81,0.08)" : "none",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.3s ease",
        padding: "2rem",
      }}
    >
      <div
        className="w-14 h-14 flex items-center justify-center mb-5"
        style={{ background: "rgba(200,169,81,0.1)", border: "1px solid rgba(200,169,81,0.3)" }}
      >
        <Icon size={26} style={{ color: "var(--accent-gold)" }} />
      </div>
      <h3
        className="text-xl mb-3"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
      >
        {s?.title ?? <span className="block w-36 h-5 rounded animate-pulse" style={{ background: "var(--bg-elevated)" }} />}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {s?.description ?? (
          <>
            <span className="block w-full h-3 rounded animate-pulse mb-2" style={{ background: "var(--bg-elevated)" }} />
            <span className="block w-3/4 h-3 rounded animate-pulse" style={{ background: "var(--bg-elevated)" }} />
          </>
        )}
      </p>
    </motion.div>
  );
}

export default function ServicesPage() {
  const { data } = useQuery({ queryKey: ["services"], queryFn: fetchServices });

  return (
    <>
      <Helmet>
        <title>Services | Pillar Square Properties</title>
      </Helmet>

      <div className="pt-24 pb-20">
        <div className="container-custom">
          <SectionHeader
            subtitle="What We Offer"
            title="Our Services"
            description="Comprehensive construction and real estate solutions under one roof."
            center
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {(data?.items ?? Array(4).fill(null)).map((s: any, i: number) => (
              <ServiceCard key={s?.id ?? i} s={s} i={i} />
            ))}
          </div>

          {/* CTA banner */}
          <div
            className="mt-20 text-center p-10 md:p-16"
            style={{ background: "rgba(18,18,26,0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(200,169,81,0.12)" }}
          >
            <h2
              className="mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)", fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
            >
              Not Sure What You Need?
            </h2>
            <p className="max-w-xl mx-auto mb-8 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Our experts will help you plan the perfect solution for your requirements —
              completely free consultation.
            </p>
            <Link to="/contact" className="btn-gold">
              Book a Free Consultation
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

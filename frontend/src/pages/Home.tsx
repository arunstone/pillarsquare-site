import { useEffect, useRef, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import {
  ChevronDown,
  ArrowRight,
  Building2,
  Home as HomeIcon,
  Wrench,
  Ruler,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  ClipboardList,
  HardHat,
  Handshake,
  Key,
  FileText,
  Layers,
  PaintBucket,
} from "lucide-react";
import { fetchProjects, fetchServices, fetchTestimonials, submitInquiry } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Project {
  id: number;
  title: string;
  slug: string;
  category: string;
  location: string;
  area_sqft: number | null;
  status: string;
  featured_image: string | null;
  description: string;
}

interface Service {
  id: number;
  title: string;
  description: string;
  icon?: string;
}

interface Testimonial {
  id: number;
  client_name: string;
  client_role?: string;
  content: string;
  rating: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SERVICE_ICONS = [Building2, HomeIcon, Wrench, Ruler];

const HOW_IT_WORKS = [
  { icon: Handshake, title: "Initial Consultation", desc: "We sit down to understand your vision, budget, and timeline." },
  { icon: FileText, title: "Site Assessment", desc: "Our engineers conduct a thorough evaluation of the project site." },
  { icon: ClipboardList, title: "Design & Planning", desc: "Architects draft detailed blueprints aligned with your goals." },
  { icon: CheckCircle2, title: "Permit Acquisition", desc: "We handle all regulatory approvals and building permits." },
  { icon: Layers, title: "Foundation Work", desc: "Precision earthwork and structural foundation laying begins." },
  { icon: HardHat, title: "Construction Phase", desc: "Skilled crews build with premium materials and strict QC." },
  { icon: PaintBucket, title: "Interior Finishing", desc: "Expert artisans handle flooring, painting, and fixtures." },
  { icon: Ruler, title: "Quality Inspection", desc: "Multi-point inspection ensures every detail meets our standard." },
  { icon: Key, title: "Handover", desc: "We deliver your completed project with full documentation." },
];

const PROJECT_FILTERS = ["All", "Residential", "Commercial", "Renovation"];

const STATS = [
  { value: 3, suffix: "+", label: "Locations" },
  { value: 10, suffix: "+", label: "Years Experience" },
  { value: 50, suffix: "+", label: "Projects Completed" },
];

// ─── Counter Hook ─────────────────────────────────────────────────────────────
function useCounter(end: number, duration = 2000, trigger: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, trigger]);
  return count;
}

// ─── Stat Counter ─────────────────────────────────────────────────────────────
function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const count = useCounter(value, 1800, inView);
  return (
    <div ref={ref} className="text-center">
      <div className="font-mono text-5xl font-bold" style={{ color: "var(--accent-gold)", fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}>
        {count}{suffix}
      </div>
      <div className="mt-2 text-sm uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>{label}</div>
    </div>
  );
}

// ─── Glass Service Card ───────────────────────────────────────────────────────
function ServiceCard({ service, index, Icon }: { service: Service; index: number; Icon: React.ElementType }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="p-8 cursor-default"
      style={{
        background: "rgba(18,18,26,0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${hovered ? "rgba(200,169,81,0.4)" : "rgba(200,169,81,0.12)"}`,
        boxShadow: hovered ? "0 0 30px rgba(200,169,81,0.08)" : "none",
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
        transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <div
        className="w-14 h-14 flex items-center justify-center mb-6"
        style={{ background: "rgba(200,169,81,0.1)", border: "1px solid rgba(200,169,81,0.3)" }}
      >
        <Icon size={24} style={{ color: "var(--accent-gold)" }} />
      </div>
      <h3 className="text-xl mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}>
        {service.title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {service.description}
      </p>
      <div
        className="mt-6 h-px"
        style={{
          background: "linear-gradient(90deg, var(--accent-gold), transparent)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      />
    </motion.div>
  );
}

// ─── 3D Tilt Project Card ─────────────────────────────────────────────────────
function TiltProjectCard({ project, delay = 0 }: { project: Project; delay?: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -3, y: dx * 3 });
  }, []);

  const handleMouseLeave = useCallback(() => { setTilt({ x: 0, y: 0 }); setHovered(false); }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1000px",
        transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.15s ease-out",
      }}
      className="cursor-pointer group"
    >
      <Link to={`/projects/${project.slug}`}>
        <div
          className="relative overflow-hidden"
          style={{
            border: `1px solid ${hovered ? "rgba(200,169,81,0.4)" : "rgba(200,169,81,0.12)"}`,
            boxShadow: hovered ? "0 0 30px rgba(200,169,81,0.08)" : "none",
            transition: "border-color 0.3s, box-shadow 0.3s",
          }}
        >
          <div className="overflow-hidden aspect-[4/3]">
            <img
              src={project.featured_image || "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800"}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6"
            style={{ background: "linear-gradient(to top, rgba(10,10,15,0.95) 0%, transparent 60%)" }}
          >
            <div>
              <span className="text-xs uppercase tracking-widest" style={{ color: "var(--accent-gold)" }}>
                {project.category}
              </span>
              <h3 className="mt-1 text-lg text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {project.title}
              </h3>
              {project.location && (
                <span className="flex items-center gap-1 mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <MapPin size={11} /> {project.location}
                </span>
              )}
            </div>
          </div>
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ boxShadow: "inset 0 0 0 1px var(--accent-gold)", pointerEvents: "none" }}
          />
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Testimonial Carousel ─────────────────────────────────────────────────────
function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIdx((i) => (i + 1) % testimonials.length), 5000);
  }, [testimonials.length]);

  useEffect(() => {
    if (!testimonials.length) return;
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [testimonials.length, resetTimer]);

  const go = (dir: number) => {
    setIdx((i) => (i + dir + testimonials.length) % testimonials.length);
    resetTimer();
  };

  if (!testimonials.length) return null;

  const visible = [
    testimonials[(idx - 1 + testimonials.length) % testimonials.length],
    testimonials[idx],
    testimonials[(idx + 1) % testimonials.length],
  ];

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        {visible.map((t, i) => (
          <motion.div
            key={`${t.id}-${i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: i === 1 ? 1 : 0.45, y: 0, scale: i === 1 ? 1 : 0.96 }}
            transition={{ duration: 0.4 }}
            className="glass p-8 relative"
          >
            <div className="absolute top-4 right-6 text-7xl leading-none select-none" style={{ color: "var(--accent-gold)", opacity: 0.15, fontFamily: "serif" }}>
              "
            </div>
            <div className="flex gap-1 mb-4">
              {Array(t.rating ?? 5).fill(0).map((_, j) => (
                <Star key={j} size={14} fill="var(--accent-gold)" style={{ color: "var(--accent-gold)" }} />
              ))}
            </div>
            <p className="text-sm leading-relaxed italic" style={{ color: "var(--text-secondary)" }}>
              "{t.content}"
            </p>
            <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{t.client_name}</p>
              {t.client_role && (
                <p className="text-xs mt-0.5" style={{ color: "var(--accent-gold)" }}>{t.client_role}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-10">
        <button
          onClick={() => go(-1)}
          className="w-10 h-10 flex items-center justify-center transition-all"
          style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => { setIdx(i); resetTimer(); }}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: i === idx ? "2rem" : "0.5rem",
                background: i === idx ? "var(--accent-gold)" : "var(--border)",
              }}
            />
          ))}
        </div>
        <button
          onClick={() => go(1)}
          className="w-10 h-10 flex items-center justify-center transition-all"
          style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Contact Form ─────────────────────────────────────────────────────────────
const inquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
type InquiryForm = z.infer<typeof inquirySchema>;

function HomeContactForm() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InquiryForm>({
    resolver: zodResolver(inquirySchema),
  });
  const mutation = useMutation({
    mutationFn: (data: InquiryForm) => submitInquiry({ ...data, email: data.email || undefined }),
    onSuccess: () => { toast.success("Message sent! We'll get back to you shortly."); reset(); },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <input {...register("name")} placeholder="Your Name *" className="form-input" />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>
        <div>
          <input {...register("phone")} placeholder="Phone Number *" className="form-input" />
          {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
        </div>
      </div>
      <div>
        <input {...register("email")} type="email" placeholder="Email Address" className="form-input" />
        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
      </div>
      <div>
        <textarea
          {...register("message")}
          placeholder="Tell us about your project *"
          rows={5}
          className="form-input resize-none"
        />
        {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>}
      </div>
      <button
        type="submit"
        disabled={mutation.isPending}
        className="btn-gold w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          boxShadow: mutation.isPending ? "none" : "0 0 24px rgba(200,169,81,0.25)",
          transition: "all 0.3s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 40px rgba(200,169,81,0.5)")}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 24px rgba(200,169,81,0.25)")}
      >
        {mutation.isPending ? "Sending…" : <><Send size={16} /> Send Message</>}
      </button>
    </form>
  );
}

// ─── Gold Accent Section Title ────────────────────────────────────────────────
function SectionTitle({ eyebrow, title, sub, center = false }: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: "var(--accent-gold)" }}>{eyebrow}</p>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          color: "var(--text-primary)",
          fontSize: "clamp(2rem, 4vw, 3.25rem)",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h2>
      <div
        className={`mt-4 mb-0 ${center ? "mx-auto" : ""}`}
        style={{ width: 60, height: 2, background: "var(--accent-gold)", opacity: 0.85 }}
      />
      {sub && (
        <p className="mt-5 text-sm leading-relaxed max-w-xl" style={{ color: "var(--text-secondary)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();

  // Parallax transforms — bg moves at 0.3× scroll speed, text at 0.8×
  const bgY = useTransform(scrollY, [0, 800], [0, 240]);
  const textY = useTransform(scrollY, [0, 800], [0, 128]);

  // Data
  const { data: projectsData } = useQuery<{ items: Project[] }>({
    queryKey: ["projects", "featured"],
    queryFn: () => fetchProjects({ featured: "true", limit: "8" }),
  });
  const { data: servicesData } = useQuery<{ items: Service[] }>({
    queryKey: ["services"],
    queryFn: () => fetchServices(),
  });
  const { data: testimonialsData } = useQuery<{ items: Testimonial[] }>({
    queryKey: ["testimonials"],
    queryFn: () => fetchTestimonials(),
  });

  const projects: Project[] = projectsData?.items ?? [];
  const services: Service[] = servicesData?.items ?? [];
  const testimonials: Testimonial[] = testimonialsData?.items ?? [];

  // Project filter
  const [activeFilter, setActiveFilter] = useState("All");
  const filteredProjects = activeFilter === "All"
    ? projects
    : projects.filter((p) => p.category?.toLowerCase() === activeFilter.toLowerCase());

  // Stagger variants for headline
  const containerVar = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };
  const lineVar = {
    hidden: { clipPath: "inset(0 0 100% 0)", opacity: 0 },
    show: { clipPath: "inset(0 0 0% 0)", opacity: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
  };

  const heroLines = ["We Create", "Foundations", "for Your Dreams"];

  return (
    <>
      <Helmet>
        <title>Pillar Square Properties | Premium Construction</title>
        <meta name="description" content="Pillar Square Properties — Premium construction services across Tamil Nadu. Residential, commercial, and renovation projects built with precision and trust." />
      </Helmet>

      {/* ══════════════════════════════════════════════════════════════
          1. HERO — 4-layer parallax
      ══════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative overflow-hidden flex items-center justify-center" style={{ height: "100vh", minHeight: "640px" }}>

        {/* Layer 1: Background image with parallax */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80')",
            y: bgY,
            scale: 1.15,
          }}
        />

        {/* Layer 2: Dark gradient overlay + CSS mesh gradient in gold/amber */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 40%, rgba(200,169,81,0.04) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 80% 20%, rgba(232,212,139,0.03) 0%, transparent 55%),
              radial-gradient(ellipse 70% 40% at 60% 80%, rgba(180,140,60,0.04) 0%, transparent 60%),
              radial-gradient(ellipse 50% 60% at 10% 90%, rgba(200,169,81,0.03) 0%, transparent 50%),
              linear-gradient(to bottom, rgba(10,10,15,0.45) 0%, rgba(10,10,15,0.65) 50%, rgba(10,10,15,0.92) 100%)
            `,
          }}
        />

        {/* Layer 3: Gold SVG geometric lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <defs>
              <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c8a951" stopOpacity="0" />
                <stop offset="50%" stopColor="#c8a951" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#c8a951" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Diagonal geometric lines */}
            <line x1="0" y1="200" x2="600" y2="0" stroke="url(#goldLine)" strokeWidth="0.8" />
            <line x1="0" y1="500" x2="900" y2="0" stroke="url(#goldLine)" strokeWidth="0.5" />
            <line x1="200" y1="900" x2="1440" y2="100" stroke="url(#goldLine)" strokeWidth="0.8" />
            <line x1="600" y1="900" x2="1440" y2="300" stroke="url(#goldLine)" strokeWidth="0.5" />
            {/* Corner accents */}
            <polyline points="80,80 80,160 160,160" fill="none" stroke="#c8a951" strokeWidth="1" opacity="0.4" />
            <polyline points="1360,80 1360,160 1280,160" fill="none" stroke="#c8a951" strokeWidth="1" opacity="0.4" />
            <polyline points="80,820 80,740 160,740" fill="none" stroke="#c8a951" strokeWidth="1" opacity="0.4" />
            <polyline points="1360,820 1360,740 1280,740" fill="none" stroke="#c8a951" strokeWidth="1" opacity="0.4" />
            {/* Center diamond */}
            <polygon points="720,320 760,380 720,440 680,380" fill="none" stroke="#c8a951" strokeWidth="0.8" opacity="0.25" />
          </motion.svg>
        </div>

        {/* Layer 4: Text content with parallax */}
        <motion.div
          className="relative z-10 text-center px-4"
          style={{ y: textY }}
        >
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs uppercase tracking-[0.3em] mb-8"
            style={{ color: "var(--accent-gold)" }}
          >
            Premium Construction & Real Estate
          </motion.p>

          {/* Staggered headline */}
          <motion.h1
            variants={containerVar}
            initial="hidden"
            animate="show"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--text-primary)",
              fontSize: "clamp(3rem, 8vw, 6.5rem)",
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
            }}
          >
            {heroLines.map((line, i) => (
              <motion.span key={i} variants={lineVar} className="block overflow-hidden">
                {i === 2
                  ? <><span style={{ color: "var(--text-primary)" }}>for </span><span style={{ color: "var(--accent-gold)" }}>Your Dreams</span></>
                  : line}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="mt-6 text-base sm:text-lg max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Building premium residences and commercial spaces across Tamil Nadu with uncompromising precision and craftsmanship.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to="/projects"
              className="btn-gold"
              style={{ boxShadow: "0 0 30px rgba(200,169,81,0.3)" }}
            >
              Explore Projects <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="btn-outline-gold">
              Get a Quote
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" })}
        >
          <span className="text-xs uppercase tracking-widest" style={{ color: "var(--accent-gold)", opacity: 0.6 }}>Scroll</span>
          <ChevronDown size={20} style={{ color: "var(--accent-gold)" }} />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          2. ABOUT — split layout + stats
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-32" style={{ background: "var(--bg-secondary)" }}>
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image with gold border */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div
                className="absolute inset-0 -left-3"
                style={{ borderLeft: "4px solid var(--accent-gold)", borderRadius: "0" }}
              />
              <div className="overflow-hidden aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80"
                  alt="Pillar Square craftsmanship"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Gold badge */}
              <div
                className="absolute -bottom-6 -right-6 w-28 h-28 flex flex-col items-center justify-center text-center"
                style={{ background: "var(--accent-gold)", color: "var(--bg-primary)" }}
              >
                <span className="text-3xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>10+</span>
                <span className="text-xs uppercase tracking-wider leading-tight">Years of<br />Excellence</span>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <SectionTitle
                eyebrow="About Us"
                title={<>Building Trust, One<br /><span style={{ color: "var(--accent-gold)" }}>Foundation</span> at a Time</>}
              />
              <p className="leading-relaxed mb-4 mt-6" style={{ color: "var(--text-secondary)" }}>
                Pillar Square Properties was founded on the belief that construction is more than just buildings — it's the creation of spaces where lives unfold. For over a decade, we've partnered with families and businesses to bring their architectural visions to life.
              </p>
              <p className="leading-relaxed mb-10" style={{ color: "var(--text-secondary)" }}>
                Our teams across multiple locations combine traditional craftsmanship with modern engineering, ensuring every project is delivered with precision, on time, and within budget.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
                {STATS.map((s) => (
                  <StatCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ══════════════════════════════════════════════════════════════
          3. SERVICES — 2×2 glass cards
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-32" style={{ background: "var(--bg-primary)" }}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <SectionTitle
              eyebrow="What We Offer"
              title={<>Our <span style={{ color: "var(--accent-gold)" }}>Services</span></>}
              sub="End-to-end construction and real estate solutions, delivered with the highest standards of quality and professionalism."
              center
            />
          </motion.div>

          {services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {services.slice(0, 4).map((s, i) => {
                const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
                return <ServiceCard key={s.id} service={s} index={i} Icon={Icon} />;
              })}
            </div>
          ) : (
            // Skeleton
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Array(4).fill(null).map((_, i) => (
                <div key={i} className="glass p-8 animate-pulse">
                  <div className="w-14 h-14 mb-6" style={{ background: "var(--bg-elevated)" }} />
                  <div className="h-5 w-40 mb-3 rounded" style={{ background: "var(--bg-elevated)" }} />
                  <div className="h-3 w-full rounded mb-2" style={{ background: "var(--bg-elevated)" }} />
                  <div className="h-3 w-5/6 rounded" style={{ background: "var(--bg-elevated)" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="section-divider" />

      {/* ══════════════════════════════════════════════════════════════
          4. HOW IT WORKS — vertical timeline, 9 steps
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-32" style={{ background: "var(--bg-secondary)" }}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <SectionTitle
              eyebrow="Our Process"
              title={<>How It <span style={{ color: "var(--accent-gold)" }}>Works</span></>}
              center
            />
          </motion.div>

          <div className="relative">
            {/* Central vertical line */}
            <div
              className="absolute left-1/2 top-0 bottom-0 w-px hidden md:block"
              style={{ background: "linear-gradient(to bottom, transparent, var(--accent-gold), transparent)", opacity: 0.3, transform: "translateX(-50%)" }}
            />

            <div className="space-y-12 md:space-y-0">
              {HOW_IT_WORKS.map((step, i) => {
                const isLeft = i % 2 === 0;
                const Icon = step.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: 0.05 }}
                    className={`relative md:grid md:grid-cols-2 md:gap-16 items-center mb-12`}
                  >
                    {/* Content */}
                    <div className={isLeft ? "md:text-right md:pr-12" : "md:col-start-2 md:pl-12"}>
                      <div className={`flex items-center gap-4 mb-3 ${isLeft ? "md:flex-row-reverse" : ""}`}>
                        <div
                          className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(200,169,81,0.1)", border: "1px solid rgba(200,169,81,0.3)" }}
                        >
                          <Icon size={18} style={{ color: "var(--accent-gold)" }} />
                        </div>
                        <h3 className="text-lg" style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}>
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {step.desc}
                      </p>
                    </div>

                    {/* Gold numbered circle (center) */}
                    <div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold hidden md:flex z-10"
                      style={{
                        background: "var(--bg-secondary)",
                        border: "2px solid var(--accent-gold)",
                        color: "var(--accent-gold)",
                        fontFamily: "'JetBrains Mono', monospace",
                        boxShadow: "0 0 16px rgba(200,169,81,0.2)",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>

                    {/* Mobile: number badge */}
                    <div
                      className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-3"
                      style={{ background: "var(--accent-gold)", color: "var(--bg-primary)", fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {i + 1}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ══════════════════════════════════════════════════════════════
          5. PROJECTS — masonry/grid with filter tabs + 3D tilt
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-32" style={{ background: "var(--bg-primary)" }}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
          >
            <SectionTitle
              eyebrow="Portfolio"
              title={<>Our <span style={{ color: "var(--accent-gold)" }}>Projects</span></>}
            />
            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2">
              {PROJECT_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="px-5 py-2 text-xs uppercase tracking-widest transition-all duration-200"
                  style={{
                    background: activeFilter === f ? "var(--accent-gold)" : "transparent",
                    color: activeFilter === f ? "var(--bg-primary)" : "var(--text-secondary)",
                    border: "1px solid",
                    borderColor: activeFilter === f ? "var(--accent-gold)" : "var(--border)",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </motion.div>

          {projects.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFilter}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {(filteredProjects.length > 0 ? filteredProjects : projects).map((p, i) => (
                  <TiltProjectCard key={p.id} project={p} delay={i * 0.06} />
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(null).map((_, i) => (
                <div key={i} className="animate-pulse aspect-[4/3]" style={{ background: "var(--bg-elevated)" }} />
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/projects" className="btn-outline-gold">
              View All Projects <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ══════════════════════════════════════════════════════════════
          6. TESTIMONIALS — auto-scroll carousel
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-32" style={{ background: "var(--bg-secondary)" }}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <SectionTitle
              eyebrow="Client Stories"
              title={<>What Our <span style={{ color: "var(--accent-gold)" }}>Clients</span> Say</>}
              center
            />
          </motion.div>

          {testimonials.length > 0 ? (
            <TestimonialCarousel testimonials={testimonials} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array(3).fill(null).map((_, i) => (
                <div key={i} className="glass p-8 animate-pulse space-y-4">
                  <div className="h-3 w-24 rounded" style={{ background: "var(--bg-elevated)" }} />
                  <div className="h-3 w-full rounded" style={{ background: "var(--bg-elevated)" }} />
                  <div className="h-3 w-5/6 rounded" style={{ background: "var(--bg-elevated)" }} />
                  <div className="h-3 w-4/6 rounded" style={{ background: "var(--bg-elevated)" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="section-divider" />

      {/* ══════════════════════════════════════════════════════════════
          7. CTA / CONTACT FORM
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-32" style={{ background: "var(--bg-primary)" }}>
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left: messaging */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionTitle
                eyebrow="Start a Conversation"
                title={<>Ready to Build<br /><span style={{ color: "var(--accent-gold)" }}>Your Vision?</span></>}
              />
              <p className="leading-relaxed mb-8 mt-6" style={{ color: "var(--text-secondary)" }}>
                Tell us about your project and our team will respond within 24 hours with a personalised consultation plan. Whether it's a home, a commercial space, or a renovation — we're here to make it happen.
              </p>

              {/* Trust signals */}
              <div className="space-y-4">
                {["Free initial consultation", "Transparent pricing with no hidden costs", "Dedicated project manager from day one"].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 size={16} style={{ color: "var(--accent-gold)", flexShrink: 0 }} />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass p-8 sm:p-10"
            >
              <h3 className="text-2xl mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}>
                Send Us a Message
              </h3>
              <HomeContactForm />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

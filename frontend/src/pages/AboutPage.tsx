import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Award, Users, Building2, Clock } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { Link } from "react-router-dom";

const values = [
  {
    icon: <Award size={28} />,
    title: "Quality First",
    desc: "We never compromise on materials, workmanship, or safety standards.",
  },
  {
    icon: <Clock size={28} />,
    title: "On-Time Delivery",
    desc: "We respect your time. Projects delivered as promised, every time.",
  },
  {
    icon: <Users size={28} />,
    title: "Client-Centric",
    desc: "Your vision drives every decision we make throughout the project.",
  },
  {
    icon: <Building2 size={28} />,
    title: "Expert Team",
    desc: "Seasoned architects, engineers, and craftsmen under one roof.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Us | Pillar Square Properties</title>
      </Helmet>

      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-charcoal-950 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/about-bg.jpg')" }}
        />
        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="section-subtitle text-brand-400 mb-4">Our Story</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
              Building Chennai for 18+ Years
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionHeader
                subtitle="Who We Are"
                title="A Legacy of Excellence in Construction"
              />
              <p className="mt-5 text-gray-600 leading-relaxed">
                Founded in 2005, Pillar Square Properties has grown from a small Chennai-based
                construction firm into one of the most trusted names in the industry. We've
                built over 200 homes, commercial spaces, and landmark structures across the city.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Our approach combines traditional craftsmanship with modern technology —
                ensuring every structure stands the test of time. We believe a building is more
                than concrete and steel; it's where memories are made.
              </p>
              <Link to="/contact" className="btn-primary mt-8 inline-flex">
                Work With Us
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl overflow-hidden aspect-[4/3]"
            >
              <img
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80"
                alt="Pillar Square Team"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <SectionHeader
            subtitle="Our Values"
            title="What Sets Us Apart"
            center
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-5 p-6 bg-white rounded-2xl shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--bg-elevated)", color: "var(--accent-gold)" }}>
                  {v.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{v.title}</h3>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

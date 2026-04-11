import { motion } from "framer-motion";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  center?: boolean;
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  center = false,
  className = "",
}: SectionHeadingProps) {
  const align = center ? "items-center text-center" : "items-start";

  return (
    <div className={`flex flex-col gap-3 ${align} ${className}`}>
      {eyebrow && (
        <motion.span
          initial={{ opacity: 0, x: center ? 0 : -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-xs font-medium uppercase tracking-[0.2em]"
          style={{ color: "var(--accent-gold)" }}
        >
          {eyebrow}
        </motion.span>
      )}

      {/* Gold accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className={`h-px w-12 origin-left`}
        style={{ background: "var(--accent-gold)", opacity: 0.6 }}
      />

      <motion.h2
        initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
        whileInView={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="text-4xl md:text-5xl font-display font-semibold leading-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </motion.h2>

      {description && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-base leading-relaxed max-w-xl"
          style={{ color: "var(--text-secondary)" }}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}

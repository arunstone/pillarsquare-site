import { motion } from "framer-motion";

interface Props {
  subtitle?: string;
  title: string;
  description?: string;
  center?: boolean;
}

export default function SectionHeader({ subtitle, title, description, center = false }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={center ? "text-center" : ""}
    >
      {subtitle && (
        <p className="section-subtitle mb-2">{subtitle}</p>
      )}
      <h2 className="section-title">{title}</h2>
      {description && (
        <p className="mt-4 text-gray-500 max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  );
}

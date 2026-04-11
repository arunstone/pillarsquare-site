import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Projects" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About Us" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

const services = [
  "End-to-End Construction",
  "Labour Contract",
  "Financial Planning",
  "Renovation & Maintenance",
];

export default function Footer() {
  const { data: settings } = useSettings();

  const phone = settings?.phone || "9841621326";
  const email = settings?.email || "contact@example.com";
  const address = settings?.address || "No 4D, Annora Flats, LIC Nagar, 2nd Main Rd, Madipakkam, Chennai 600091";

  return (
    <footer
      style={{
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Col 1 — Brand */}
          <div>
            <span
              className="text-2xl font-display font-semibold"
              style={{ color: "var(--accent-gold)" }}
            >
              Pillar Square
            </span>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Building trust, one project at a time. Premium residential and commercial construction in Chennai.
            </p>
            <div className="flex gap-4 mt-6">
              {settings?.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded transition-colors duration-200 hover:text-[var(--accent-gold)]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Facebook size={18} />
                </a>
              )}
              {settings?.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded transition-colors duration-200 hover:text-[var(--accent-gold)]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Instagram size={18} />
                </a>
              )}
              {settings?.youtube && (
                <a
                  href={settings.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded transition-colors duration-200 hover:text-[var(--accent-gold)]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Youtube size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Col 2 — Quick Links */}
          <div>
            <h4
              className="text-xs font-medium uppercase tracking-widest mb-6"
              style={{ color: "var(--accent-gold)" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm transition-colors duration-200 hover:text-[var(--accent-gold)]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Services */}
          <div>
            <h4
              className="text-xs font-medium uppercase tracking-widest mb-6"
              style={{ color: "var(--accent-gold)" }}
            >
              Services
            </h4>
            <ul className="space-y-3">
              {services.map((s) => (
                <li
                  key={s}
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact + Map */}
          <div>
            <h4
              className="text-xs font-medium uppercase tracking-widest mb-6"
              style={{ color: "var(--accent-gold)" }}
            >
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone size={15} className="mt-0.5 shrink-0" style={{ color: "var(--accent-gold)" }} />
                <a
                  href={`tel:${phone}`}
                  className="text-sm transition-colors duration-200 hover:text-[var(--accent-gold)]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={15} className="mt-0.5 shrink-0" style={{ color: "var(--accent-gold)" }} />
                <a
                  href={`mailto:${email}`}
                  className="text-sm transition-colors duration-200 hover:text-[var(--accent-gold)]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={15} className="mt-0.5 shrink-0" style={{ color: "var(--accent-gold)" }} />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {address}
                </span>
              </li>
            </ul>

            {/* Map embed */}
            <div className="mt-6 rounded overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <iframe
                title="Office location"
                src="https://maps.google.com/maps?q=12.9543216,80.2018134&z=17&output=embed"
                width="100%"
                height="120"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid var(--border)" }}>
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            © {new Date().getFullYear()} Pillar Square Properties. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            example.com
          </p>
        </div>
      </div>
    </footer>
  );
}

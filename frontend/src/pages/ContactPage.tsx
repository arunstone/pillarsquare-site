import { Helmet } from "react-helmet-async";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeader from "@/components/SectionHeader";
import ContactForm from "@/components/ContactForm";
import { useSettings } from "@/hooks/useSettings";

const FALLBACK = {
  phone: "9841621326",
  email: "contact@example.com",
  address: "No 4D, Annora Flats, LIC Nagar, 2nd Main Rd, Madipakkam, Chennai 600091",
};

const MAP_SRC =
  "https://maps.google.com/maps?q=12.9543216,80.2018134&z=17&output=embed";

export default function ContactPage() {
  const { data: settings } = useSettings();

  const phone = settings?.phone || FALLBACK.phone;
  const email = settings?.email || FALLBACK.email;
  const address = settings?.address || FALLBACK.address;

  const contactInfo = [
    {
      icon: <Phone size={22} />,
      label: "Phone",
      value: phone,
      href: `tel:+91${phone.replace(/\D/g, "")}`,
    },
    {
      icon: <Mail size={22} />,
      label: "Email",
      value: email,
      href: `mailto:${email}`,
    },
    {
      icon: <MapPin size={22} />,
      label: "Address",
      value: address,
      href: "https://maps.app.goo.gl/gcjxyN6GDJApmAnt8",
    },
    {
      icon: <Clock size={22} />,
      label: "Working Hours",
      value: "Mon – Sat: 9:00 AM – 6:00 PM",
      href: null,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Contact Us | Pillar Square Properties</title>
      </Helmet>

      <div className="pt-24 pb-20">
        <div className="container-custom">
          <SectionHeader
            subtitle="Get In Touch"
            title="We'd Love to Hear From You"
            description="Reach out to discuss your project, get a quote, or just say hello."
          />

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                background: "rgba(18,18,26,0.8)",
                border: "1px solid rgba(200,169,81,0.15)",
                borderRadius: "12px",
                padding: "2rem",
              }}
            >
              <h2
                className="text-xl mb-6"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "#f0ece4",
                }}
              >
                Send Us a Message
              </h2>
              <ContactForm />
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {contactInfo.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-5"
                  style={{
                    background: "rgba(18,18,26,0.7)",
                    border: "1px solid rgba(200,169,81,0.12)",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    className="w-10 h-10 flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(200,169,81,0.1)",
                      border: "1px solid rgba(200,169,81,0.3)",
                      color: "var(--accent-gold)",
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p
                      className="text-xs mb-1 uppercase tracking-widest"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="text-sm font-medium transition-colors"
                        style={{ color: "#f0ece4" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "var(--accent-gold)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#f0ece4")
                        }
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium" style={{ color: "#f0ece4" }}>
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Map */}
              <div
                className="overflow-hidden h-56"
                style={{ border: "1px solid rgba(200,169,81,0.12)", borderRadius: "8px" }}
              >
                <iframe
                  title="Office Location"
                  src={MAP_SRC}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

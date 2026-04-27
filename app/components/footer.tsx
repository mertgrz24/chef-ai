"use client";

import { motion } from "framer-motion";

const linkGroups = [
  {
    title: "Ürün",
    links: ["Özellikler", "Fiyatlar", "Blog"],
  },
  {
    title: "Şirket",
    links: ["Hakkında", "İletişim"],
  },
  {
    title: "Yasal",
    links: ["Gizlilik", "Kullanım Şartları"],
  },
];

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{ backgroundColor: "#1a1a1a" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Top row */}
        <div className="flex flex-col md:flex-row md:justify-between gap-10 md:gap-0 pb-10">
          {/* Logo + tagline */}
          <div className="flex flex-col gap-2">
            <span className="text-lg font-semibold tracking-tight">
              <span className="text-white">Chef</span>
              <span style={{ color: "#ffa51f" }}>AI</span>
            </span>
            <p className="text-sm" style={{ color: "#888" }}>
              Kişisel AI şefin, cebinde.
            </p>
          </div>

          {/* Link groups */}
          <div className="flex gap-12">
            {linkGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-3">
                <p className="text-xs font-semibold text-white">
                  {group.title}
                </p>
                {group.links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "#888" }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div
          className="flex flex-col md:flex-row md:justify-between gap-2 md:gap-0 pt-6"
          style={{ borderTop: "1px solid #333" }}
        >
          <p className="text-xs" style={{ color: "#555" }}>
            © 2025 Chef-AI. Tüm hakları saklıdır.
          </p>
          <p className="text-xs" style={{ color: "#555" }}>
            🤖 Claude + Gemini ile güçlendirildi
          </p>
        </div>
      </div>
    </motion.footer>
  );
}

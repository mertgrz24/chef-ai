"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const freeItems = ["Manuel malzeme girişi", "Günlük 3 tarif hakkı", "Temel özellikler"];

const premiumItems = [
  "Sınırsız fotoğraf analizi",
  "Kalori takibi",
  "Haftalık öğün planlama",
  "Reklamsız deneyim",
];

export function Pricing() {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: "#ffffff" }}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#888" }}
          >
            Fiyatlandırma
          </p>
          <h2
            className="text-3xl md:text-4xl font-medium"
            style={{ color: "#1a1a1a", letterSpacing: "-0.3px" }}
          >
            Başlamak ücretsiz.
          </h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto"
        >
          {/* Free plan */}
          <motion.div
            variants={cardVariant}
            className="rounded-2xl p-8 flex flex-col gap-6"
            style={{ backgroundColor: "#ffffff", border: "1px solid #ebebeb" }}
          >
            <div>
              <h3
                className="text-base font-semibold mb-4"
                style={{ color: "#1a1a1a" }}
              >
                Ücretsiz
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold" style={{ color: "#1a1a1a" }}>
                  $0
                </span>
                <span className="text-sm" style={{ color: "#888" }}>
                  / ay
                </span>
              </div>
            </div>
            <ul className="flex flex-col gap-3 flex-1">
              {freeItems.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "#888" }}
                >
                  <span style={{ color: "#ffa51f" }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="text-center py-3 rounded-full text-sm font-medium transition-colors hover:bg-[#f5f5f0]"
              style={{ border: "1.5px solid #1a1a1a", color: "#1a1a1a" }}
            >
              Hemen Başla
            </Link>
          </motion.div>

          {/* Premium plan */}
          <motion.div
            variants={cardVariant}
            className="rounded-2xl p-8 flex flex-col gap-6 relative"
            style={{ backgroundColor: "#1a1a1a" }}
          >
            {/* EN POPÜLER badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span
                className="text-[11px] font-bold tracking-wider px-4 py-1 rounded-full whitespace-nowrap"
                style={{ backgroundColor: "#ffa51f", color: "#1a1a1a" }}
              >
                EN POPÜLER
              </span>
            </div>

            <div>
              <h3 className="text-base font-semibold mb-4 text-white">
                Premium
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">$9.99</span>
                <span className="text-sm" style={{ color: "#888" }}>
                  / ay
                </span>
              </div>
            </div>
            <ul className="flex flex-col gap-3 flex-1">
              {premiumItems.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "#888" }}
                >
                  <span style={{ color: "#ffa51f" }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="text-center py-3 rounded-full text-sm font-medium transition-opacity hover:opacity-85"
              style={{ backgroundColor: "#ffa51f", color: "#1a1a1a" }}
            >
              Premium{"'"}a Geç →
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

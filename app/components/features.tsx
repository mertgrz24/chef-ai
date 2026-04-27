"use client";

import { motion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const cards = [
  {
    icon: "📷",
    title: "Görsel Kiler",
    description: "Buzdolabının fotoğrafını çek, malzemeler otomatik tanınsın.",
    featured: false,
  },
  {
    icon: "✨",
    title: "Akıllı Tarif",
    description: "Elindekilerle en lezzetli tarifi saniyeler içinde üret.",
    featured: true,
  },
  {
    icon: "⏰",
    title: "İsraf Uyarısı",
    description: "Son kullanma tarihi yaklaşan ürünler için akıllı bildirimler.",
    featured: false,
  },
];

export function Features() {
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
            Neden Chef-AI?
          </p>
          <h2
            className="text-3xl md:text-4xl font-medium"
            style={{ color: "#1a1a1a", letterSpacing: "-0.3px" }}
          >
            Mutfağını zekice yönet.
          </h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-5"
        >
          {cards.map((card) => (
            <motion.div
              key={card.title}
              variants={cardVariant}
              className="rounded-2xl p-7 flex flex-col gap-5"
              style={
                card.featured
                  ? { backgroundColor: "#1a1a1a" }
                  : { backgroundColor: "#ffffff", border: "1px solid #ebebeb" }
              }
            >
              {/* Icon box */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                style={{
                  backgroundColor: card.featured ? "#ffa51f33" : "#ffa51f15",
                }}
              >
                {card.icon}
              </div>

              {/* Title + description */}
              <div className="flex flex-col gap-2 flex-1">
                <h3
                  className="text-base font-semibold"
                  style={{ color: card.featured ? "#ffffff" : "#1a1a1a" }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: card.featured ? "#888" : "#888" }}
                >
                  {card.description}
                </p>
              </div>

              {/* "En popüler" badge — only on featured card */}
              {card.featured && (
                <div>
                  <span
                    className="text-[11px] font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: "#ffa51f20", color: "#ffa51f" }}
                  >
                    En popüler
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

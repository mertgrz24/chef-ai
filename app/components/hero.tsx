"use client";

import { motion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const phoneVariant: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stats = [
  { value: "12K+", label: "Aktif kullanıcı" },
  { value: "%94", label: "İsraf azalması" },
  { value: "50K+", label: "Tarif üretildi" },
];

function PhoneMockup() {
  return (
    <div
      className="w-[255px] rounded-[36px] overflow-hidden shadow-2xl"
      style={{ border: "7px solid #1a1a1a", backgroundColor: "#1a1a1a" }}
    >
      {/* Dark header */}
      <div className="bg-[#1a1a1a] px-4 pt-5 pb-4">
        <p className="text-xs mb-1" style={{ color: "#666" }}>
          Merhaba 👋
        </p>
        <div className="flex items-center justify-between">
          <h3 className="text-white text-sm font-semibold">Ne pişirelim?</h3>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: "#ffa51f" }}
          >
            M
          </div>
        </div>
      </div>

      {/* Recipe card */}
      <div className="bg-white mx-2.5 rounded-2xl p-3.5 mb-2.5">
        <span
          className="text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "#ffa51f20", color: "#ffa51f" }}
        >
          BUGÜNÜN ÖNERİSİ
        </span>
        <h4 className="text-sm font-semibold mt-2 mb-0.5" style={{ color: "#1a1a1a" }}>
          Tavuk Sote
        </h4>
        <p className="text-[10px] mb-2" style={{ color: "#aaa" }}>
          tavuk, biber, soğan, sarımsak
        </p>
        <div className="flex gap-1.5 mb-3">
          <span
            className="text-[9px] px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#f5f5f0", color: "#888" }}
          >
            ⏱ 35 dk
          </span>
          <span
            className="text-[9px] px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#f5f5f0", color: "#888" }}
          >
            ✓ Kolay
          </span>
        </div>
        <button
          className="w-full text-[10px] py-1.5 rounded-full font-semibold"
          style={{ backgroundColor: "#ffa51f", color: "#fff" }}
        >
          Tarife Bak →
        </button>
      </div>

      {/* Cream section — mini cards */}
      <div className="mx-2.5 rounded-2xl p-2.5 mb-2.5" style={{ backgroundColor: "#f5f5f0" }}>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: "🥦", label: "Kiler" },
            { icon: "📖", label: "Tarifler" },
            { icon: "⚠️", label: "İsraf Uyarısı" },
            { icon: "➕", label: "Ekle" },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl py-2 flex flex-col items-center gap-0.5"
            >
              <span className="text-sm">{card.icon}</span>
              <span className="text-[8px]" style={{ color: "#888" }}>
                {card.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="bg-white px-3 py-2 flex justify-around items-center"
        style={{ borderTop: "1px solid #ebebeb" }}
      >
        {[
          { icon: "🏠", label: "Ana" },
          { icon: "📦", label: "Kiler" },
          { icon: "📋", label: "Tarifler" },
          { icon: "👤", label: "Profil" },
        ].map((tab) => (
          <div key={tab.label} className="flex flex-col items-center gap-0.5">
            <span className="text-xs">{tab.icon}</span>
            <span className="text-[7px]" style={{ color: "#aaa" }}>
              {tab.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="bg-[#1a1a1a] md:bg-transparent">
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-28 grid md:grid-cols-2 md:gap-16 items-center">
        {/* Left: text content */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          {/* Badge */}
          <motion.div variants={item}>
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs rounded-full"
              style={{
                backgroundColor: "#ffa51f18",
                border: "1px solid #ffa51f40",
                color: "#ffa51f",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "#ffa51f" }}
              />
              AI Destekli Mutfak Asistanı
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={item}
            className="text-4xl md:text-5xl lg:text-[56px] font-medium leading-tight"
            style={{ letterSpacing: "-0.5px" }}
          >
            <span className="text-white md:text-[#1a1a1a]">
              Bugün ne<br />pişirsem?
            </span>
            <br />
            <span style={{ color: "#ffa51f" }}>Şefin biliyor.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={item}
            className="text-sm md:text-base max-w-[380px]"
            style={{ color: "#888", lineHeight: 1.8 }}
          >
            Buzdolabındaki malzemeleri tara, yapay zeka saniyeler içinde
            kişiselleştirilmiş tarifler oluştursun. Gıda israfını azalt,
            mutfakta ilham bul.
          </motion.p>

          {/* Buttons */}
          <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
            <a
              href="#"
              className="text-center px-7 py-3 rounded-full text-sm font-medium transition-opacity hover:opacity-85"
              style={{ backgroundColor: "#ffa51f", color: "#ffffff" }}
            >
              Ücretsiz Başla →
            </a>
            <a
              href="#nasil-calisir"
              className="text-center px-7 py-3 rounded-full text-sm font-medium transition-colors text-white md:text-[#1a1a1a] hover:bg-white/5 md:hover:bg-black/5"
              style={{ border: "1.5px solid #ddd" }}
            >
              Nasıl çalışır?
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div variants={item} className="flex items-center mt-2">
            {stats.map((stat, i) => (
              <div key={stat.value} className="flex items-center">
                {i > 0 && (
                  <div
                    className="w-px h-8 mx-4 md:mx-6 bg-white/20 md:bg-[#ebebeb]"
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-base font-bold text-white md:text-[#1a1a1a]">
                    {stat.value}
                  </span>
                  <span className="text-[11px]" style={{ color: "#aaa" }}>
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: phone mockup — hidden on mobile */}
        <motion.div
          variants={phoneVariant}
          initial="hidden"
          animate="visible"
          className="hidden md:flex justify-center items-center"
        >
          <PhoneMockup />
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full"
      style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #ebebeb" }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <span className="text-lg font-semibold tracking-tight">
          <span style={{ color: "#1a1a1a" }}>Chef</span>
          <span style={{ color: "#ffa51f" }}>AI</span>
        </span>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#ozellikler"
            className="text-sm transition-colors hover:text-[#1a1a1a]"
            style={{ color: "#888888" }}
          >
            Özellikler
          </a>
          <a
            href="#fiyatlar"
            className="text-sm transition-colors hover:text-[#1a1a1a]"
            style={{ color: "#888888" }}
          >
            Fiyatlar
          </a>
          <Link
            href="/login"
            className="text-sm transition-colors hover:text-[#1a1a1a]"
            style={{ color: "#888888" }}
          >
            Giriş Yap
          </Link>
          <Link
            href="/signup"
            className="text-sm px-5 py-2 rounded-full transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#1a1a1a", color: "#ffffff" }}
          >
            Ücretsiz Başla
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center gap-1.5 p-2"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Menüyü aç/kapat"
        >
          <span className="block w-6 h-0.5" style={{ backgroundColor: "#1a1a1a" }} />
          <span className="block w-6 h-0.5" style={{ backgroundColor: "#1a1a1a" }} />
          <span className="block w-6 h-0.5" style={{ backgroundColor: "#1a1a1a" }} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="md:hidden flex flex-col gap-2 px-6 py-4"
          style={{ backgroundColor: "#ffffff", borderTop: "1px solid #ebebeb" }}
        >
          <a
            href="#ozellikler"
            className="text-sm py-2 transition-colors hover:text-[#1a1a1a]"
            style={{ color: "#888888" }}
          >
            Özellikler
          </a>
          <a
            href="#fiyatlar"
            className="text-sm py-2 transition-colors hover:text-[#1a1a1a]"
            style={{ color: "#888888" }}
          >
            Fiyatlar
          </a>
          <Link
            href="/login"
            className="text-sm py-2 transition-colors hover:text-[#1a1a1a]"
            style={{ color: "#888888" }}
          >
            Giriş Yap
          </Link>
          <Link
            href="/signup"
            className="text-sm mt-1 px-5 py-2.5 rounded-full text-center transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#1a1a1a", color: "#ffffff" }}
          >
            Ücretsiz Başla
          </Link>
        </motion.div>
      )}
    </motion.header>
  );
}

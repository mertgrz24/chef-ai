import { Navbar } from "./components/navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-20">
        <p style={{ color: "#888888" }}>Landing page — yakında.</p>
      </main>
    </div>
  );
}

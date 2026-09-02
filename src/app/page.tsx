import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Console } from "@/components/Console";
import { geminiConfigured } from "@/lib/gemini";

export default function Home() {
  return (
    <>
      <Nav modelStatus={geminiConfigured() ? "gemini" : "fallback"} />
      <main className="grid-bg">
        <Console />
      </main>
      <Footer />
    </>
  );
}

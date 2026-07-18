import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CompareTool } from "@/components/CompareTool";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 sm:px-8">
      <Header />
      <CompareTool />
      <Footer />
    </main>
  );
}

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CompareTool } from "@/components/CompareTool";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5">
      <Header />
      <CompareTool />
      <Footer />
    </main>
  );
}

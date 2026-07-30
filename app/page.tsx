import Hero from "@/components/Hero";
import HowToJoin from "@/components/HowToJoin";
import ProductShowcase from "@/components/ProductShowcase";
import PrizeSection from "@/components/PrizeSection";
import WinnersSection from "@/components/WinnersSection";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowToJoin />
      <ProductShowcase />
      <PrizeSection />
      <WinnersSection />
    </>
  );
}

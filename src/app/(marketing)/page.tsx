import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { WhySagaSection } from "@/components/landing/why-saga-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { TechStackSection } from "@/components/landing/tech-stack-section";
import { CtaFooterSection } from "@/components/landing/cta-footer-section";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <WhySagaSection />
        <FeaturesSection />
        <TechStackSection />
      </main>
      <CtaFooterSection />
    </div>
  );
}

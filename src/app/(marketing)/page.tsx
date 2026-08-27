import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { BentoGridSection } from "@/components/landing/bento-grid-section";
import { RoleShowcaseSection } from "@/components/landing/role-showcase-section";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaFooterSection } from "@/components/landing/cta-footer-section";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <BentoGridSection />
        <RoleShowcaseSection />
        <WorkflowSection />
        <FaqSection />
      </main>
      <CtaFooterSection />
    </div>
  );
}

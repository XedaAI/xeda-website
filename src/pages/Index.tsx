import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TrustStrip from "@/components/TrustStrip";
import WhatWeDoSection from "@/components/WhatWeDoSection";
import UseCasesSection from "@/components/UseCasesSection";
import HowWeWorkSection from "@/components/HowWeWorkSection";
import VisionSection from "@/components/VisionSection";
import ForBusinessesSection from "@/components/ForBusinessesSection";
// ForDevelopersSection (recruiting) moved off the buyer flow to the /careers page.
import WhyUsSection from "@/components/WhyUsSection";
import TeamSection from "@/components/TeamSection";
import CaseStudiesSection from "@/components/CaseStudiesSection";
import AuditSection from "@/components/AuditSection";
import PricingSection from "@/components/PricingSection";
import BlogSection from "@/components/BlogSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
import { AnimatedSection } from "@/components/AnimatedSection";
import SEOHead from "@/components/SEOHead";
import { lazy, Suspense } from "react";

// Chatbot is a heavy floating widget (voice, markdown, date-fns) that isn't needed
// for first paint — load it lazily so it stays out of the initial bundle.
const Chatbot = lazy(() => import("@/components/Chatbot"));

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead />
      <Header />
      <main>
        <HeroSection />
        <AnimatedSection>
          <TrustStrip />
        </AnimatedSection>
        <AnimatedSection>
          <WhatWeDoSection />
        </AnimatedSection>
        <AnimatedSection>
          <UseCasesSection />
        </AnimatedSection>
        <AnimatedSection>
          <HowWeWorkSection />
        </AnimatedSection>
        <AnimatedSection>
          <VisionSection />
        </AnimatedSection>
        <AnimatedSection>
          <ForBusinessesSection />
        </AnimatedSection>
        <AnimatedSection>
          <WhyUsSection />
        </AnimatedSection>
        <AnimatedSection>
          <TeamSection />
        </AnimatedSection>
        <AnimatedSection>
          <CaseStudiesSection />
        </AnimatedSection>
        <AnimatedSection>
          <AuditSection />
        </AnimatedSection>
        <AnimatedSection>
          <PricingSection />
        </AnimatedSection>
        <AnimatedSection>
          <BlogSection />
        </AnimatedSection>
        <AnimatedSection>
          <FAQSection />
        </AnimatedSection>
        <AnimatedSection>
          <ContactSection />
        </AnimatedSection>
      </main>
      <Footer />
      <BackToTop />
      <CookieConsent />
      <Suspense fallback={null}>
        <Chatbot />
      </Suspense>
    </div>
  );
};

export default Index;

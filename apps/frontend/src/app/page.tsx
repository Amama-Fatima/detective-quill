import type { Metadata } from "next";
import Navbar from "@/components/landing/navbar";
import HeroSection from "@/components/landing/hero-section";
import FeaturesSection from "@/components/landing/features-section";
import TestimonialsSection from "@/components/landing/testimonials-section";
import CtaSection from "@/components/landing/cta-section";
import Footer from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Detective's Quill — The Writing Studio for Crime Fiction",
  description:
    "Draft, plot, and investigate. A writing platform built for detective fiction authors.",
};

export default function Home() {
  return (
    <div className="bg-background font-serif">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CtaSection />
      <Footer />
    </div>
  );
}

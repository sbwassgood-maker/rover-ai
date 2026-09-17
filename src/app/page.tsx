import { DemoProvider } from "@/components/marketing/DemoProvider";
import { Nav } from "@/components/marketing/Nav";
import { Hero } from "@/components/marketing/Hero";
import { SocialProof } from "@/components/marketing/SocialProof";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { AIUnderstands } from "@/components/marketing/AIUnderstands";
import { AIAssistant } from "@/components/marketing/AIAssistant";
import { SearchDemo } from "@/components/marketing/SearchDemo";
import { DocsShowcase } from "@/components/marketing/DocsShowcase";
import { DatabaseShowcase } from "@/components/marketing/DatabaseShowcase";
import { AgentsShowcase } from "@/components/marketing/AgentsShowcase";
import { AutomationShowcase } from "@/components/marketing/AutomationShowcase";
import { MeetingsShowcase } from "@/components/marketing/MeetingsShowcase";
import { Integrations } from "@/components/marketing/Integrations";
import { Collaboration } from "@/components/marketing/Collaboration";
import { HumanControl } from "@/components/marketing/HumanControl";
import { Security } from "@/components/marketing/Security";
import { UseCases } from "@/components/marketing/UseCases";
import { Testimonials } from "@/components/marketing/Testimonials";
import { Pricing } from "@/components/marketing/Pricing";
import { FAQ } from "@/components/marketing/FAQ";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { Footer } from "@/components/marketing/Footer";

export default function HomePage() {
  return (
    <DemoProvider>
    <main className="bg-canvas">
      <Nav />
      <Hero />
      <SocialProof />
      <FeatureGrid />
      <AIUnderstands />
      <AIAssistant />
      <SearchDemo />
      <DocsShowcase />
      <DatabaseShowcase />
      <AgentsShowcase />
      <AutomationShowcase />
      <MeetingsShowcase />
      <Integrations />
      <Collaboration />
      <HumanControl />
      <Security />
      <UseCases />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
    </DemoProvider>
  );
}

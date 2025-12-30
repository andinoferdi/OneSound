"use client";

import { getHomePageData } from "@/services/hero";
import { HeroSection } from "./hero-section";
import { ProjectsSection } from "./projects-section";
import { ExperienceSection } from "./journey-section";
import { TechStackCertificateSection } from "./techstack-&-certificate-section";
import { ChatbotSection } from "./chatbot-section";
import { ContactSection } from "./contact-section";
import { PageTitle } from "@/components/page-title";
import { ErrorBoundary } from "@/components/error-boundary";
import { useAOS } from "@/hooks/useAOS";

const Home = () => {
  const data = getHomePageData();
  useAOS();

  return (
    <>
      <PageTitle title="Andino Ferdiansah | Developer" />
      <ErrorBoundary
        fallback={
          <div className="py-20 px-4">
            <div className="max-w-7xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Hero section temporarily unavailable
              </h2>
              <p className="text-muted-foreground">
                We&apos;re having trouble loading the hero section. Please
                refresh the page.
              </p>
            </div>
          </div>
        }
      >
        <HeroSection data={data.hero} />
      </ErrorBoundary>
      <ErrorBoundary
        fallback={
          <div className="py-20 px-4">
            <div className="max-w-7xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Projects section temporarily unavailable
              </h2>
              <p className="text-muted-foreground">
                We&apos;re having trouble loading the projects. Please refresh
                the page.
              </p>
            </div>
          </div>
        }
      >
        <ProjectsSection />
      </ErrorBoundary>
      <ErrorBoundary
        fallback={
          <div className="py-20 px-4">
            <div className="max-w-7xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Experience section temporarily unavailable
              </h2>
              <p className="text-muted-foreground">
                We&apos;re having trouble loading the experience timeline.
                Please refresh the page.
              </p>
            </div>
          </div>
        }
      >
        <ExperienceSection />
      </ErrorBoundary>
      <ErrorBoundary
        fallback={
          <div className="py-20 px-4">
            <div className="max-w-7xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Tech Stack & Certificates section temporarily unavailable
              </h2>
              <p className="text-muted-foreground">
                We&apos;re having trouble loading the tech stack and
                certificates. Please refresh the page.
              </p>
            </div>
          </div>
        }
      >
        <TechStackCertificateSection />
      </ErrorBoundary>
      <ErrorBoundary
        fallback={
          <div className="py-20 px-4">
            <div className="max-w-7xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Chatbot temporarily unavailable
              </h2>
              <p className="text-muted-foreground">
                We&apos;re having trouble loading the chatbot. Please refresh
                the page.
              </p>
            </div>
          </div>
        }
      >
        <ChatbotSection />
      </ErrorBoundary>
      <ErrorBoundary
        fallback={
          <div className="py-20 px-4">
            <div className="max-w-7xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Contact section temporarily unavailable
              </h2>
              <p className="text-muted-foreground">
                We&apos;re having trouble loading the contact form. Please
                refresh the page.
              </p>
            </div>
          </div>
        }
      >
        <ContactSection />
      </ErrorBoundary>
    </>
  );
};

export default Home;

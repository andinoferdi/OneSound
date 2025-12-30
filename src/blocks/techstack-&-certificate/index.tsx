"use client";

import { TechStackCard } from "@/components/tech-stack-card";
import { CertificateCard } from "@/components/certificate-card";
import { PageTitle } from "@/components/page-title";
import { ErrorBoundary } from "@/components/error-boundary";
import { Tab, type TabItem } from "@/components/ui/tab";
import { getTechStackData } from "@/services/techstack";
import { getCertificateData } from "@/services/certificate";
import { useAOS } from "@/hooks/useAOS";

export const TechStackCertificatePage = () => {
  const techStackData = getTechStackData();
  const certificateData = getCertificateData();
  useAOS();

  const tabItems: TabItem[] = [
    {
      id: "techstack",
      label: "Tech Stack",
      content: (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {techStackData.categories.map((category, index) => (
            <TechStackCard
              key={category.id}
              category={category}
              index={index}
            />
          ))}
        </div>
      ),
    },
    {
      id: "certificate",
      label: "Certificates",
      content: (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {certificateData.certificates.map((certificate) => (
            <div key={certificate.id} data-aos="fade-up">
              <CertificateCard certificate={certificate} />
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageTitle title="Tech Stack & Certificates - AndinoFerdi" />
      <ErrorBoundary
        fallback={
          <div className="px-4 py-20">
            <div className="mx-auto max-w-7xl text-center">
              <h2 className="mb-2 text-2xl font-bold text-foreground">
                Content temporarily unavailable
              </h2>
              <p className="text-muted-foreground">
                We&apos;re having trouble loading the content. Please refresh
                the page.
              </p>
            </div>
          </div>
        }
      >
        <section className="px-4 py-20">
          <div className="mx-auto max-w-7xl">
            <header className="mb-16 text-center" data-aos="fade-up">
              <h1 className="mb-4 text-4xl font-bold text-foreground md:text-6xl">
                Tech Stack & Certificates
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Technologies, tools, and professional certifications that
                showcase my expertise and commitment to continuous learning.
              </p>
            </header>

            {/* Tab Component */}
            <div className="mb-12" data-aos="fade-up">
              <Tab
                items={tabItems}
                defaultValue="techstack"
                className="w-full"
              />
            </div>
          </div>
        </section>
      </ErrorBoundary>
    </>
  );
};

export default TechStackCertificatePage;

"use client";

import { getProjectsData } from "@/services/projects";
import { ProjectCard } from "@/components/project-card";
import { PageTitle } from "@/components/page-title";
import { ErrorBoundary } from "@/components/error-boundary";
import { useAOS } from "@/hooks/useAOS";

const ProjectsPage = () => {
  const projectsData = getProjectsData();
  useAOS();

  return (
    <>
      <PageTitle title="Projects - AndinoFerdi" />
      <ErrorBoundary
        fallback={
          <div className="py-20 px-4">
            <div className="max-w-7xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Projects temporarily unavailable
              </h2>
              <p className="text-muted-foreground">
                We&apos;re having trouble loading the projects. Please refresh
                the page.
              </p>
            </div>
          </div>
        }
      >
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16" data-aos="fade-up">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
                All Projects
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Complete portfolio of my innovative projects and cutting-edge
                solutions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projectsData.projects.map((project) => (
                <div key={project.id} data-aos="fade-up">
                  <ProjectCard project={project} showCodeButton={true} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </ErrorBoundary>
    </>
  );
};

export { ProjectsPage };
export default ProjectsPage;

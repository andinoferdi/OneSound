"use client";

import Link from "next/link";
import { getProjectsData } from "@/services/projects";
import { ProjectCard } from "@/components/project-card";
import { HoverBorderGradient } from "@/components/ui/hover-border-button";
import { ExternalLink } from "lucide-react";

export const ProjectsSection = () => {
  const projectsData = getProjectsData();

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <header 
          className="text-center mb-16"
          data-aos="fade-up"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            My Projects
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore my portfolio of innovative projects and cutting-edge
            solutions.
          </p>
        </header>

        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {projectsData.projects.slice(0, 3).map((project) => (
            <div
              key={project.id}
              data-aos="fade-up"
            >
              <ProjectCard
                project={project}
                showCodeButton={false}
              />
            </div>
          ))}
        </div>

        <div 
          className="flex justify-center mt-12"
          data-aos="fade-up"
        >
          <HoverBorderGradient
            as={Link}
            href="/projects"
            containerClassName="rounded-full"
            className="flex items-center gap-2 px-6 py-2.5 text-base font-medium sm:px-8 sm:py-3 sm:text-lg"
            {...({} as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          >
            View All Projects
            <ExternalLink className="h-5 w-5" />
          </HoverBorderGradient>
        </div>
      </div>
    </section>
  );
};

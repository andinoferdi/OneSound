"use client";

import { TechnologyIcon } from "@/components/ui/technology-icon";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import { type Project } from "@/types/projects";

interface ProjectCardProps {
  project: Project;
  showCodeButton?: boolean;
}

export const ProjectCard = ({
  project,
  showCodeButton = true,
}: ProjectCardProps) => {
  const handleKeyDown = (e: React.KeyboardEvent, url?: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    }
  };

  return (
    <article
      className="group"
      role="article"
      aria-label={`Project: ${project.title}`}
    >
      <CardContainer className="group">
        <CardBody className="bg-card border border-border rounded-xl p-6 h-full flex flex-col">
          <CardItem translateZ="50" className="mb-4 w-full">
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
              <Image
                src={project.image}
                alt={`Screenshot of ${project.title} project`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain"
                loading="eager"
                priority={
                  project.id === "freshko" ||
                  project.id === "portfolio-v2" ||
                  project.id === "anro-studio" ||
                  project.id === "gokandara"
                }
              />
            </div>
          </CardItem>

          <CardItem translateZ="60" className="flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-foreground mb-2">
              {project.title}
            </h3>
            <p className="text-muted-foreground text-sm mb-4 flex-1">
              {project.description}
            </p>

            <div
              className="flex flex-wrap gap-2 mb-4"
              role="list"
              aria-label="Technologies used"
            >
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  role="listitem"
                  className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs text-foreground"
                  aria-label={`Technology: ${tech}`}
                >
                  <TechnologyIcon
                    technology={tech}
                    className="h-3 w-3"
                    aria-hidden="true"
                  />
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex gap-2 mt-auto">
              {project.liveUrl && (
                <CardItem translateZ="100" className="flex-1">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label={`Visit ${project.title} website`}
                    onKeyDown={(e) => handleKeyDown(e, project.liveUrl)}
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    Visit Site
                  </a>
                </CardItem>
              )}

              {showCodeButton && project.githubUrl && (
                <CardItem translateZ="100">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label={`View source code of ${project.title} on GitHub`}
                    onKeyDown={(e) =>
                      project.githubUrl && handleKeyDown(e, project.githubUrl)
                    }
                  >
                    <Github className="h-4 w-4" aria-hidden="true" />
                    Code
                  </a>
                </CardItem>
              )}
            </div>
          </CardItem>
        </CardBody>
      </CardContainer>
    </article>
  );
};

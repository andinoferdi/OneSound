"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Timeline } from "@/components/ui/timeline";
import { getExperienceData } from "@/services/journey";
import { type Experience } from "@/types/journey";
import { TechnologyIcon } from "@/components/ui/technology-icon";
import { Calendar, MapPin, Building2, Award, ExternalLink } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ExperienceCardProps {
  experience: Experience;
}

const ExperienceCard = React.memo(({ experience }: ExperienceCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <article
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      className={cn(
        "space-y-4 rounded-xl p-6 border transition-all duration-300 cursor-pointer",
        "bg-background/90 border-border/60 shadow-lg md:backdrop-blur-md",
        isHovered &&
          !isMobile &&
          "scale-[1.02] shadow-2xl shadow-black/10 ring-2 ring-black/15 dark:shadow-primary/30 dark:ring-primary/30"
      )}
    >
      <ExperienceHeader experience={experience} />
      <ExperienceDescription description={experience.description} />
      <ExperienceAchievements achievements={experience.achievements} />
      <ExperienceTechnologies technologies={experience.technologies} />
    </article>
  );
});
ExperienceCard.displayName = "ExperienceCard";

interface ExperienceHeaderProps {
  experience: Experience;
}

const ExperienceHeader = React.memo(({ experience }: ExperienceHeaderProps) => (
  <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
    <div className="flex items-start gap-3">
      <CompanyLogo logo={experience.logo} company={experience.company} />
      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-bold text-foreground mb-1">
          {experience.title}
        </h3>
        <div className="flex items-center gap-2">
          <p className="text-lg text-muted-foreground">{experience.company}</p>
          {experience.website && (
            <a
              href={experience.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
              title={`Visit ${experience.company} website`}
              aria-label={`Visit ${experience.company} website`}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>

    <ExperienceMeta
      period={experience.period}
      current={experience.current}
      location={experience.location}
    />
  </header>
));
ExperienceHeader.displayName = "ExperienceHeader";

interface CompanyLogoProps {
  logo?: string;
  company: string;
}

const CompanyLogo = React.memo(({ logo, company }: CompanyLogoProps) => (
  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-background/90 border border-border/60 flex items-center justify-center shrink-0 md:backdrop-blur-md">
    {logo ? (
      <Image
        src={logo}
        alt={`${company} logo`}
        width={40}
        height={40}
        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-screen"
        loading="lazy"
      />
    ) : (
      <Building2 className="h-5 w-5 text-primary" />
    )}
  </div>
));
CompanyLogo.displayName = "CompanyLogo";

interface ExperienceMetaProps {
  period: { start: string; end: string };
  current?: boolean;
  location: string;
}

const ExperienceMeta = React.memo(
  ({ period, current, location }: ExperienceMetaProps) => (
    <div className="flex flex-col md:items-end gap-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>
          {period.start} - {period.end}
        </span>
        {current && (
          <span className="inline-flex items-center rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary px-2 py-1 text-xs font-semibold">
            Current
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>{location}</span>
      </div>
    </div>
  )
);
ExperienceMeta.displayName = "ExperienceMeta";

interface ExperienceDescriptionProps {
  description: string;
}

const ExperienceDescription = React.memo(
  ({ description }: ExperienceDescriptionProps) => (
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  )
);
ExperienceDescription.displayName = "ExperienceDescription";

interface ExperienceAchievementsProps {
  achievements: string[];
}

const ExperienceAchievements = React.memo(
  ({ achievements }: ExperienceAchievementsProps) => {
    if (achievements.length === 0) return null;

    return (
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-foreground">Key Achievements</h4>
        </div>
        <ul className="space-y-1 ml-6" role="list">
          {achievements.map((achievement, index) => (
            <li
              key={index}
              className="text-sm text-muted-foreground flex items-start gap-2"
            >
              <span className="text-primary" aria-hidden="true">
                •
              </span>
              <span>{achievement}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  }
);
ExperienceAchievements.displayName = "ExperienceAchievements";

interface ExperienceTechnologiesProps {
  technologies: string[];
}

const ExperienceTechnologies = React.memo(
  ({ technologies }: ExperienceTechnologiesProps) => {
    if (technologies.length === 0) return null;

    return (
      <section
        className="flex flex-wrap gap-2"
        role="list"
        aria-label="Technologies used"
      >
        {technologies.map((tech) => (
          <span
            key={tech}
            role="listitem"
            className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/60 px-2 py-1 text-xs font-medium text-foreground hover:bg-background/80 transition-colors md:backdrop-blur-sm"
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
      </section>
    );
  }
);
ExperienceTechnologies.displayName = "ExperienceTechnologies";

export const ExperienceSection = () => {
  const experienceData = getExperienceData();

  const timelineData = useMemo(
    () =>
      experienceData.experiences.map((experience) => ({
        title: `${experience.period.start} - ${experience.period.end}`,
        content: (
          <div data-aos="fade-up">
            <ExperienceCard experience={experience} />
          </div>
        ),
      })),
    [experienceData.experiences]
  );

  return (
    <section
      className="py-20 px-4"
      aria-label="Professional experience timeline"
    >
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            My Journey
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A timeline of my professional experience, projects, and growth as a
            developer.
          </p>
        </header>

        <div>
          <Timeline data={timelineData} />
        </div>
      </div>
    </section>
  );
};

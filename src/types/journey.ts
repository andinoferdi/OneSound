export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  logo?: string;
  website?: string;
  period: {
    start: string;
    end: string;
    duration: string;
  };
  description: string;
  achievements: string[];
  technologies: string[];
  type: "work" | "education" | "freelance" | "internship";
  current?: boolean;
}

export interface ExperienceData {
  experiences: Experience[];
}

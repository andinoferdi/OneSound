export interface Technology {
  id: string;
  name: string;
  icon: string;
  description: string;
  brandColor?: string;
}

export interface TechCategory {
  id: string;
  name: string;
  description: string;
  color: number[];
  technologies: Technology[];
}

export interface TechStackData {
  categories: TechCategory[];
}


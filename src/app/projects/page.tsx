import type { Metadata } from "next";
import { ProjectsPage } from "@/blocks/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore my complete portfolio of innovative projects and cutting-edge solutions built with modern web technologies.",
};

const Projects = () => {
  return <ProjectsPage />;
};

export default Projects;

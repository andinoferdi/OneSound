import { type ProjectsData } from "@/types/projects";

export const getProjectsData = (): ProjectsData => {
  return {
    projects: [
      {
        id: "gokandara",
        title: "Gokandara",
        description:
          "A property management website built as part of a front-end development team, featuring property listings, booking management, and a clean modern interface.",
        image: "/images/projects/gokandara.png",
        technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
      },
      {
        id: "mylisttrip",
        title: "My List Trip",
        description:
          "A travel agent website built as a full-stack developer, handling POS system and property management features with a focus on seamless booking experience.",
        image: "/images/projects/mylisttrip.png",
        technologies: ["Laravel", "Vue.js", "Bootstrap"],
        liveUrl: "https://mylisttrip.com/",
      },
      {
        id: "freshko",
        title: "FreshKo",
        description:
          "My workshop course assignment: a modern food delivery platform with real-time inventory management and a seamless user experience.",
        image: "/images/projects/FreshKo.png",
        technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
        liveUrl: "https://freshko.vercel.app",
      },
      {
        id: "Portfolio-V3",
        title: "Portfolio V3",
        description:
          "The portfolio template I initially wanted to use, but ended up not using because it had too many effects. You can use it if you want. ",
        image: "/images/projects/portfolio-v3.png",
        technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
        liveUrl: "https://andinoferdi-portfolio-v3.vercel.app/",
      },
      {
        id: "portfolio-v2",
        title: "Portfolio V2",
        description:
          "An unfinished personal portfolio website showcasing projects, skills, and professional experience with a modern design.",
        image: "/images/projects/portfolio-v2.png",
        technologies: ["React.js", "JavaScript", "Tailwind CSS"],
        liveUrl: "https://andinoferdi-portfolio-v2.netlify.app/",
      },
      {
        id: "anro-studio",
        title: "Anro Studio",
        description:
          "My workshop course assignment: a creative design studio website that showcases digital solutions, services, and portfolio with a modern UI/UX design and responsive layout.",
        image: "/images/projects/anro.png",
        technologies: ["HTML", "CSS", "JavaScript"],
        liveUrl: "https://anrostudio.netlify.app/",
      },
      {
        id: "pet-finder",
        title: "Pet Finder",
        description:
          "My Machine Learning course assignment: AI-powered expert system using forward chaining method to help users find the perfect pet based on their personality and lifestyle through interactive questions with 99% accuracy.",
        image: "/images/projects/pet-finder.png",
        technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
        liveUrl: "https://sistem-pakar-hewan-peliharaan.vercel.app/",
      },
      {
        id: "portfolio",
        title: "Portfolio",
        description:
          "My First Portfolio Website And i made it in 2023, it's not finished yet because i'm still learning and improving my skills.",
        image: "/images/projects/portfolio.jpg",
        technologies: ["HTML", "JavaScript", "CSS"],
        liveUrl: "https://andinoferdi-portfolio.netlify.app//",
      },
    ],
  };
};

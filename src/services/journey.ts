import { type ExperienceData } from "@/types/journey";

export const getExperienceData = (): ExperienceData => {
  return {
    experiences: [
      {
        id: "unair-d4-informatika",
        title: "D4 Teknik Informatika Student",
        company: "Universitas Airlangga",
        location: "Surabaya, Indonesia",
        logo: "/images/journey/logo-unair.png",
        website: "https://unair.ac.id",
        period: {
          start: "2023 August",
          end: "Present",
          duration: "1+ year",
        },
        description:
          "Currently pursuing D4 (Diploma 4) degree in Computer Engineering at Universitas Airlangga, focusing on software development, system analysis, and modern programming technologies.",
        achievements: [
          "Studying comprehensive computer science curriculum",
          "Learning modern software development practices",
          "Developing projects using various technologies",
          "Gaining practical programming experience",
        ],
        technologies: [
          "Next.js",
          "React.js",
          "TypeScript",
          "Node.js",
          "Golang",
          "PostgreSQL",
          "Tailwind CSS",
        ],
        type: "education",
        current: true,
      },
      {
        id: "ukk-laravel-project",
        title: "UKK Laravel Project",
        company: "SMKN 2 Surabaya",
        location: "Surabaya, Indonesia",
        logo: "/images/journey/smkn2sby.png",
        website: "https://smkn2sby.sch.id",
        period: {
          start: "2023",
          end: "2023 May",
          duration: "1 year",
        },
        description:
          "Completed final project (UKK) as part of software engineering curriculum, developing a comprehensive web application using Laravel framework with modern development practices.",
        achievements: [
          "Successfully completed UKK project requirements",
          "Developed full-stack web application with Laravel",
          "Implemented MVC architecture and database design",
          "Demonstrated proficiency in PHP and Laravel ecosystem",
        ],
        technologies: ["Laravel", "PHP", "MySQL", "Bootstrap"],
        type: "education",
        current: false,
      },
      {
        id: "mcflyon-internship",
        title: "Software Development Intern",
        company: "CV.MCFLYON TEKNOLOGI INDONESIA",
        location: "Gresik, Indonesia",
        logo: "/images/journey/mti.png",
        website: "https://www.mcflyon.co.id/",
        period: {
          start: "2022",
          end: "2022 June",
          duration: "1.5 years",
        },
        description:
          "Completed internship program focusing on practical software development experience. Worked on real-world projects and gained hands-on experience in professional development environment.",
        achievements: [
          "Completed comprehensive internship program",
          "Worked on live software projects",
          "Gained professional development experience",
          "Learned industry best practices",
        ],
        technologies: ["Laravel", "Vue.js", "MySQL", "PHP"],
        type: "internship",
        current: false,
      },
      {
        id: "smkn-2-surabaya",
        title: "Rekayasa Perangkat Lunak Student",
        company: "SMKN 2 Surabaya",
        location: "Surabaya, Indonesia",
        logo: "/images/journey/smkn2sby.png",
        website: "https://smkn2sby.sch.id",
        period: {
          start: "2021",
          end: "2022",
          duration: "1.5 years",
        },
        description:
          "Studied software engineering fundamentals including programming languages, database management, and software development methodologies. Completed grade 10 through grade 11 semester 1.",
        achievements: [
          "Learned fundamental programming concepts",
          "Completed software engineering curriculum",
          "Developed basic web applications",
          "Gained understanding of database systems",
        ],
        technologies: ["HTML", "CSS", "JavaScript", "PHP", "Bootstrap"],
        type: "education",
        current: false,
      },
    ],
  };
};

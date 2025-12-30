import { type ProfileData } from "@/types/profile";

export const getProfileData = (): ProfileData => {
  return {
    profiles: [
      {
        quote:
          "I build modern, responsive web apps using Vue.js, React.js, Nuxt.js, and Next.js with focus on excellent user experience.",
        name: "Front End Developer",
        designation: "Modern Web Development",
        src: "/images/self/1.jpg",
      },
      {
        quote:
          "Experienced in Laravel, Golang, and Python, specializing in backend architecture, API services, and database optimization.",
        name: "Back End Developer",
        designation: "Server & Database Expert",
        src: "/images/gallery/34.jpg",
      },
      {
        quote:
          "Skilled in Flutter and React Native, delivering high-performance cross-platform mobile apps with near-native experience.",
        name: "Mobile Developer",
        designation: "Cross-Platform Apps",
        src: "/images/self/3.jpg",
      },
      {
        quote:
          "Proficient in Figma, designing clean, intuitive, and engaging UI/UX that balances aesthetics with functionality.",
        name: "UI/UX Designer",
        designation: "Design & User Experience",
        src: "/images/self/4.jpg",
      },
    ],
    cvDownload: {
      url: "/cv/ANDINO FERDIANSAH.pdf",
      filename: "ANDINO FERDIANSAH.pdf",
      label: "Download CV",
    },
  };
};

import { type HomePageData } from "@/types/hero";

export const getHomePageData = (): HomePageData => {
  return {
    hero: {
      greeting: "Hi, my name is",
      flipWords: ["Andino", "Ferdiansah", "Ferdi", "Bahro"],
    },
  };
};

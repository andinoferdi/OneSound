import type { Metadata } from "next";
import HomePage from "@/blocks/home";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Welcome to Andino Ferdiansah's portfolio - Full Stack Developer specializing in React, Next.js, Vue.js, and Laravel.",
};

const Page = () => {
  return <HomePage />;
};

export default Page;

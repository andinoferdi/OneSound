import type { Metadata } from "next";
import { TechStackCertificatePage } from "@/blocks/techstack-&-certificate";

export const metadata: Metadata = {
  title: "Tech Stack & Certificates",
  description:
    "Discover my technical expertise, tech stack proficiency, and professional certifications in web development.",
};

const TechStackCertificate = () => {
  return <TechStackCertificatePage />;
};

export default TechStackCertificate;

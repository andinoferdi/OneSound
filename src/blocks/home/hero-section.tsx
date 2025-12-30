"use client";

import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import { ProfileCarousel } from "@/components/ui/profile-carousel";
import { HoverBorderGradient } from "@/components/ui/hover-border-button";
import { type HeroData } from "@/types/hero";
import { getProfileData } from "@/services/profile";
import { Download } from "lucide-react";
import Link from "next/link";

interface HeroSectionProps {
  data: HeroData;
}

export const HeroSection = ({ data }: HeroSectionProps) => {
  const profileData = getProfileData();

  return (
    <section className="min-h-screen flex items-start justify-center text-foreground px-4 pt-26">
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        <div className="space-y-4">
          <h1 
            className="text-4xl md:text-7xl font-bold font-sans"
            data-aos="fade-down"
          >
            {data.greeting}
          </h1>
          <div 
            className="flex flex-col items-center space-y-4"
            data-aos="fade-up"
          >
            <ContainerTextFlip
              words={data.flipWords}
              interval={2000}
              className="mt-4"
            />
          </div>
        </div>
        <div 
          className="mt-16"
          data-aos="fade-left"
        >
          <ProfileCarousel 
            profiles={profileData.profiles}
          />
        </div>
        <div 
          className="mt-12 flex justify-center"
          data-aos="fade-up"
        >
          <Link href={profileData.cvDownload.url} download={profileData.cvDownload.filename}>
            <HoverBorderGradient
              containerClassName="rounded-full"
              className="flex items-center gap-2 px-6 py-3 text-white font-medium"
            >
              <Download className="h-4 w-4" />
              {profileData.cvDownload.label}
            </HoverBorderGradient>
          </Link>
        </div>
      </div>
    </section>
  );
};

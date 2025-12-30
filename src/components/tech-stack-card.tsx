"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { TechnologyIcon } from "@/components/ui/technology-icon";
import { type TechCategory } from "@/types/techstack";

interface TechStackCardProps {
  category: TechCategory;
  index: number;
}

export const TechStackCard = ({ category, index }: TechStackCardProps) => {
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <div
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
      className="group/canvas-card relative mx-auto flex w-full max-w-sm items-start justify-start rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg"
      data-aos="fade-up"
      data-aos-delay={index * 100}
    >
      {!isMobile && (
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 h-full w-full"
            >
              <CanvasRevealEffect
                animationSpeed={3}
                containerClassName="bg-transparent"
                colors={[category.color]}
                opacities={[0.6, 0.6, 0.6, 0.8, 0.8, 1, 1, 1, 1, 1]}
                dotSize={2}
                showGradient={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <div className="relative z-10 w-full">
        <div className="mb-4 flex items-center justify-between">
          <h3
            className="text-xl font-bold transition-colors duration-300"
            style={{
              color: `rgb(${category.color[0]}, ${category.color[1]}, ${category.color[2]})`,
            }}
          >
            {category.name}
          </h3>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300"
            style={{
              backgroundColor: hovered
                ? `rgba(${category.color[0]}, ${category.color[1]}, ${category.color[2]}, 0.2)`
                : "transparent",
            }}
          >
            <span
              className="text-2xl font-bold transition-colors duration-300"
              style={{
                color: `rgb(${category.color[0]}, ${category.color[1]}, ${category.color[2]})`,
              }}
            >
              {category.technologies.length}
            </span>
          </div>
        </div>

        <p className="mb-6 text-sm text-muted-foreground">
          {category.description}
        </p>

        <div className="space-y-3">
          {category.technologies.map((tech) => (
            <div
              key={tech.id}
              className="group/tech flex items-center gap-3 rounded-lg border border-border bg-background/50 p-3 backdrop-blur-sm transition-all duration-200 hover:border-primary/50 hover:bg-background/80"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <TechnologyIcon technology={tech.icon} className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className="text-sm font-semibold truncate transition-colors duration-300"
                    style={{
                      color:
                        tech.brandColor === "#000000"
                          ? "var(--foreground)"
                          : tech.brandColor === "#FFFFFF" ||
                            tech.brandColor === "#ffffff"
                          ? "var(--foreground)"
                          : tech.brandColor ||
                            `rgb(${category.color[0]}, ${category.color[1]}, ${category.color[2]})`,
                    }}
                  >
                    {tech.name}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

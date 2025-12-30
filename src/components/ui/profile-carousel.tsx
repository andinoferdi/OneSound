"use client";

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type Profile = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

const TRANSITION_DURATION = 300;

export const ProfileCarousel = ({ profiles }: { profiles: Profile[] }) => {
  const [active, setActive] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTransitionTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const setTransitioning = useCallback(
    (value: boolean) => {
      setIsTransitioning(value);
      if (value) {
        clearTransitionTimeout();
        timeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
          timeoutRef.current = null;
        }, TRANSITION_DURATION);
      }
    },
    [clearTransitionTimeout]
  );

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    setTransitioning(true);
    setActive((prev) => (prev + 1) % profiles.length);
  }, [profiles.length, isTransitioning, setTransitioning]);

  const handlePrev = useCallback(() => {
    if (isTransitioning) return;
    setTransitioning(true);
    setActive((prev) => (prev - 1 + profiles.length) % profiles.length);
  }, [profiles.length, isTransitioning, setTransitioning]);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    return () => {
      clearTransitionTimeout();
    };
  }, [clearTransitionTimeout]);

  const currentProfile = profiles[active];

  return (
    <div className="mx-auto max-w-sm px-4 py-20 font-sans antialiased md:max-w-4xl md:px-8 lg:px-12">
      <div className="relative grid grid-cols-1 gap-20 md:grid-cols-2">
        <div>
          <div
            className={cn(
              "relative h-80 w-full overflow-hidden image-container rounded-3xl transition-all duration-300",
              isHovered &&
                !isMobile &&
                "shadow-2xl shadow-black/10 ring-2 ring-black/20 dark:shadow-primary/30 dark:ring-primary/40"
            )}
          >
            <AnimatePresence mode="popLayout">
              <motion.div
                key={active}
                initial={{
                  opacity: 0,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  scale: isHovered && !isMobile ? 1.05 : 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                }}
                whileHover={!isMobile ? { scale: 1.05 } : undefined}
                transition={{
                  duration: TRANSITION_DURATION / 1000,
                  ease: [0.4, 0, 0.2, 1],
                }}
                onMouseEnter={() => !isMobile && setIsHovered(true)}
                onMouseLeave={() => !isMobile && setIsHovered(false)}
                className="absolute inset-0 fix-mobile-flicker gpu-accelerated"
              >
                <Image
                  src={currentProfile.src}
                  alt={currentProfile.name}
                  width={500}
                  height={500}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={true}
                  loading="eager"
                  draggable={false}
                  className="h-full w-full rounded-3xl object-cover object-center fix-mobile-flicker"
                  onError={() => {
                    // Silently handle image loading errors
                  }}
                />
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {isHovered && !isMobile && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-linear-to-t from-black/15 via-black/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent rounded-3xl pointer-events-none z-10"
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col py-4 h-full">
          <motion.div
            key={active}
            initial={{
              y: 15,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            transition={{
              duration: TRANSITION_DURATION / 1000,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="flex-1 fix-mobile-flicker"
          >
            <h3 className="text-2xl font-bold text-black dark:text-white">
              {currentProfile.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-neutral-500">
              {currentProfile.designation}
            </p>
            <p className="mt-8 text-lg text-gray-500 dark:text-neutral-300">
              {currentProfile.quote}
            </p>
          </motion.div>

          <div className="flex gap-4 justify-center mt-8 md:mt-12">
            <button
              onClick={handlePrev}
              disabled={isTransitioning}
              className="group/button flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous profile"
            >
              <IconArrowLeft className="h-4 w-4 md:h-5 md:w-5 text-black transition-transform duration-200 group-hover/button:rotate-12 dark:text-neutral-400 cursor-pointer" />
            </button>
            <button
              onClick={handleNext}
              disabled={isTransitioning}
              className="group/button flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next profile"
            >
              <IconArrowRight className="h-4 w-4 md:h-5 md:w-5 text-black transition-transform duration-200 group-hover/button:-rotate-12 dark:text-neutral-400 cursor-pointer" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

const GRADIENT_CONFIG = {
  light: {
    moving: {
      TOP: "radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 0%) 0%, rgba(0, 0, 0, 0) 100%)",
      LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, hsl(0, 0%, 0%) 0%, rgba(0, 0, 0, 0) 100%)",
      BOTTOM:
        "radial-gradient(20.7% 50% at 50% 100%, hsl(0, 0%, 0%) 0%, rgba(0, 0, 0, 0) 100%)",
      RIGHT:
        "radial-gradient(16.2% 41.2% at 100% 50%, hsl(0, 0%, 0%) 0%, rgba(0, 0, 0, 0) 100%)",
    },
    highlight:
      "radial-gradient(75% 181.16% at 50% 50%, #3275F8 0%, rgba(0, 0, 0, 0) 100%)",
  },
  dark: {
    moving: {
      TOP: "radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
      LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
      BOTTOM:
        "radial-gradient(20.7% 50% at 50% 100%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
      RIGHT:
        "radial-gradient(16.2% 41.2% at 100% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
    },
    highlight:
      "radial-gradient(75% 181.16% at 50% 50%, #3275F8 0%, rgba(255, 255, 255, 0) 100%)",
  },
};

export const HoverBorderGradient = <T extends React.ElementType = "button">({
  children,
  containerClassName,
  className,
  as,
  duration = 1,
  clockwise = true,
  ...props
}: {
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
  as?: T;
  duration?: number;
  clockwise?: boolean;
} & Omit<
  React.ComponentPropsWithoutRef<T>,
  "as" | "children" | "className"
>) => {
  const Tag = as || "button";
  const [hovered, setHovered] = useState<boolean>(false);
  const [direction, setDirection] = useState<Direction>("TOP");
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const rotateDirection = useCallback(
    (currentDirection: Direction): Direction => {
      const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
      const currentIndex = directions.indexOf(currentDirection);
      const nextIndex = clockwise
        ? (currentIndex - 1 + directions.length) % directions.length
        : (currentIndex + 1) % directions.length;
      return directions[nextIndex];
    },
    [clockwise]
  );

  useEffect(() => {
    if (!hovered && !isMobile) {
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered, duration, rotateDirection, isMobile]);

  if (isMobile) {
    return React.createElement(
      Tag,
      {
        className: cn(
          "relative flex rounded-full border bg-black dark:bg-white items-center px-4 py-2 cursor-pointer",
          containerClassName
        ),
        ...props,
      },
      <div className={cn("text-white dark:text-black", className)}>
        {children}
      </div>
    );
  }

  return React.createElement(
    Tag,
    {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      className: cn(
        "relative flex rounded-full border content-center bg-black/20 transition-all duration-300 dark:bg-white/20 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-px box-decoration-clone w-fit cursor-pointer",
        "hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/10 hover:ring-2 hover:ring-black/15",
        "dark:hover:shadow-primary/30 dark:hover:ring-primary/30",
        containerClassName
      ),
      ...props,
    },
    <div
      className={cn(
        "w-auto text-white dark:text-black z-10 bg-black dark:bg-white px-4 py-2 rounded-[inherit] transition-all duration-300",
        className
      )}
    >
      {children}
    </div>,
    <motion.div
      key="light-gradient"
      className="flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit] dark:hidden"
      style={{
        filter: "blur(2px)",
        position: "absolute",
        width: "100%",
        height: "100%",
      }}
      initial={{ background: GRADIENT_CONFIG.light.moving[direction] }}
      animate={{
        background: hovered
          ? [
              GRADIENT_CONFIG.light.moving[direction],
              GRADIENT_CONFIG.light.highlight,
            ]
          : GRADIENT_CONFIG.light.moving[direction],
      }}
      transition={{ ease: "linear", duration: duration ?? 1 }}
    />,
    <motion.div
      key="dark-gradient"
      className="flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit] hidden dark:block"
      style={{
        filter: "blur(2px)",
        position: "absolute",
        width: "100%",
        height: "100%",
      }}
      initial={{ background: GRADIENT_CONFIG.dark.moving[direction] }}
      animate={{
        background: hovered
          ? [
              GRADIENT_CONFIG.dark.moving[direction],
              GRADIENT_CONFIG.dark.highlight,
            ]
          : GRADIENT_CONFIG.dark.moving[direction],
      }}
      transition={{ ease: "linear", duration: duration ?? 1 }}
    />,
    <div
      key="bg-overlay"
      className="bg-black dark:bg-white absolute z-1 flex-none inset-[2px] rounded-[100px]"
    />
  );
};

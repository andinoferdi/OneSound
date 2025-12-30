"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CardData {
  id: string;
  title: string;
  src: string;
  "data-aos"?: string;
}

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
    canHover,
    tapped,
    setTapped,
    isMobile,
  }: {
    card: CardData;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
    canHover: boolean;
    tapped: number | null;
    setTapped: React.Dispatch<React.SetStateAction<number | null>>;
    isMobile: boolean;
  }) => {
    const handleClick = () => {
      if (!canHover) {
        if (tapped === index) {
          setTapped(null);
        } else {
          setTapped(index);
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    };

    const isTitleVisible = canHover ? hovered === index : tapped === index;

    return (
      <div data-aos={card["data-aos"]} className="w-full">
        <div
          onMouseEnter={canHover ? () => setHovered(index) : undefined}
          onMouseLeave={canHover ? () => setHovered(null) : undefined}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-label={`View details for ${card.title}`}
          className={cn(
            "rounded-lg relative bg-muted overflow-hidden aspect-square w-full transition-all duration-300 ease-out cursor-pointer border border-border/60 focus:outline-none",
            canHover &&
              hovered !== null &&
              hovered !== index &&
              !isMobile &&
              "blur-sm scale-[0.98]",
            tapped === index && "ring-0"
          )}
          style={{ willChange: isMobile ? "auto" : "transform, opacity" }}
        >
          <Image
            src={card.src || "/placeholder.svg"}
            alt={card.title}
            width={400}
            height={400}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover absolute inset-0"
            draggable={false}
            decoding="async"
            loading={index < 9 ? "eager" : "lazy"}
            priority={index < 3}
          />
          <div
            className={cn(
              "absolute inset-0 bg-black/50 dark:bg-black/60 flex items-end py-8 px-4 transition-opacity duration-300",
              isTitleVisible ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-linear-to-b from-white to-neutral-200 dark:from-neutral-50 dark:to-neutral-300">
              {card.title}
            </div>
          </div>

          {/* Mobile tap indicator */}
          {!canHover && (
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              Tap to {tapped === index ? "hide" : "show"}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Card.displayName = "Card";

export const FocusCards = ({ cards }: { cards: CardData[] }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [tapped, setTapped] = useState<number | null>(null);
  const [canHover, setCanHover] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto md:px-8 w-full"
      role="grid"
      aria-label="Gallery of images"
    >
      {cards.map((card, index) => (
        <Card
          key={card.id}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
          canHover={canHover}
          tapped={tapped}
          setTapped={setTapped}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
};

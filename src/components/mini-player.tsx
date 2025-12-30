"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatTime } from "@/services/music";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

function SmartImage({
  src,
  alt,
  imgClass,
  blurDataURL,
}: {
  src: string;
  alt: string;
  imgClass?: string;
  blurDataURL?: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <Image
        src={hasError ? "/placeholder.svg" : src || "/placeholder.svg"}
        alt={alt}
        fill
        sizes="224px"
        priority
        loading="eager"
        className={imgClass}
        placeholder={blurDataURL ? "blur" : undefined}
        blurDataURL={blurDataURL}
        fetchPriority="high"
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
}

export const MiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isExpanded,
    isTrackLoading,
    progressPercent,
    volumePercent,
    handlePlayPause,
    handleNext,
    handlePrevious,
    handleSeek,
    handleVolumeChange,
    toggleExpanded,
  } = useAudioPlayer();

  const [hasAnimated, setHasAnimated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (currentTrack && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [currentTrack, hasAnimated]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const checkReducedMotion = () => {
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    };

    checkMobile();
    checkReducedMotion();

    window.addEventListener("resize", checkMobile);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    mediaQuery.addEventListener("change", checkReducedMotion);

    return () => {
      window.removeEventListener("resize", checkMobile);
      mediaQuery.removeEventListener("change", checkReducedMotion);
    };
  }, []);

  if (!hasMounted || !currentTrack) return null;

  return (
    <motion.div
      initial={
        hasAnimated
          ? { x: 0, opacity: 1 }
          : isMobile
          ? { opacity: 0 }
          : { x: 400, opacity: 0 }
      }
      animate={{ x: 0, opacity: 1 }}
      transition={{
        duration: prefersReducedMotion ? 0 : isMobile ? 0.15 : 0.3,
        ease: "easeOut",
      }}
      style={{
        willChange: "transform, opacity",
        transform: "translateZ(0)",
      }}
      className="fixed right-2 sm:right-4 top-24 sm:top-20 z-40"
    >
      {isTrackLoading && (
        <div
          className={cn(
            "absolute inset-0 rounded-xl flex items-center justify-center z-50",
            isMobile ? "bg-background/90" : "bg-background/80 backdrop-blur-sm"
          )}
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Loading track...
          </div>
        </div>
      )}
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <MiniPlayerCollapsed
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onExpand={toggleExpanded}
            isMobile={isMobile}
            prefersReducedMotion={prefersReducedMotion}
          />
        ) : (
          <MiniPlayerExpanded
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            progressPercent={progressPercent}
            volumePercent={volumePercent}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChange}
            onCollapse={toggleExpanded}
            isMobile={isMobile}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface MiniPlayerCollapsedProps {
  currentTrack: NonNullable<ReturnType<typeof useAudioPlayer>["currentTrack"]>;
  isPlaying: boolean;
  onPlayPause: () => void;
  onExpand: () => void;
  isMobile: boolean;
  prefersReducedMotion: boolean;
}

const MiniPlayerCollapsed: React.FC<MiniPlayerCollapsedProps> = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onExpand,
  isMobile,
  prefersReducedMotion,
}) => (
  <motion.div
    key="mini"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{
      duration: prefersReducedMotion ? 0 : isMobile ? 0.2 : 0.5,
      ease: "easeOut",
    }}
    style={{
      willChange: "transform, opacity",
      transform: "translateZ(0)",
    }}
    className="bg-background rounded-xl shadow-2xl border border-border p-2 w-48 sm:w-56 md:w-64 cursor-pointer"
    onClick={onExpand}
    role="button"
    tabIndex={0}
    aria-label={`Now playing: ${currentTrack.title} by ${currentTrack.artist}`}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onExpand();
      }
    }}
  >
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden">
        <SmartImage
          key={currentTrack.id}
          src={currentTrack.coverImage || "/placeholder.svg"}
          alt={currentTrack.title}
          imgClass="object-cover"
        />
        {isPlaying && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="flex items-center gap-0.5">
              <div
                className="w-0.5 h-2 bg-white rounded-full animate-pulse"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-0.5 h-3 bg-white rounded-full animate-pulse"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-0.5 h-1.5 bg-white rounded-full animate-pulse"
                style={{ animationDelay: "300ms" }}
              />
              <div
                className="w-0.5 h-2.5 bg-white rounded-full animate-pulse"
                style={{ animationDelay: "450ms" }}
              />
              <div
                className="w-0.5 h-1 bg-white rounded-full animate-pulse"
                style={{ animationDelay: "600ms" }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-xs text-foreground truncate">
          {currentTrack.title}
        </h4>
        <p className="text-xs text-muted-foreground truncate">
          {currentTrack.artist}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlayPause();
          }}
          className="p-2 rounded-full bg-foreground text-background hover:bg-foreground/80 transition-colors cursor-pointer"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-background" />
          ) : (
            <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-background" />
          )}
        </button>

        <ChevronUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground" />
      </div>
    </div>
  </motion.div>
);

interface MiniPlayerExpandedProps {
  currentTrack: NonNullable<ReturnType<typeof useAudioPlayer>["currentTrack"]>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  progressPercent: number;
  volumePercent: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onCollapse: () => void;
  isMobile: boolean;
  prefersReducedMotion: boolean;
}

const MiniPlayerExpanded: React.FC<MiniPlayerExpandedProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  progressPercent,
  volumePercent,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onCollapse,
  isMobile,
  prefersReducedMotion,
}) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(currentTime);

  const seekKeys = new Set([
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
    "PageUp",
    "PageDown",
  ]);

  useEffect(() => {
    if (!isSeeking) {
      setSeekValue(currentTime);
    }
  }, [currentTime, isSeeking]);

  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const rawDisplayTime = isSeeking ? seekValue : currentTime;
  const safeDisplayTime =
    safeDuration > 0
      ? Math.min(Math.max(0, rawDisplayTime), safeDuration)
      : Math.max(0, rawDisplayTime);
  const displayProgress =
    safeDuration > 0
      ? Math.min(100, Math.max(0, (safeDisplayTime / safeDuration) * 100))
      : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeekValue(parseFloat(e.target.value));
  };

  const commitSeek = () => {
    onSeek(seekValue);
    setIsSeeking(false);
  };

  return (
    <motion.div
      key="expanded"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: prefersReducedMotion ? 0 : isMobile ? 0.2 : 0.5,
        ease: "easeOut",
      }}
      style={{
        willChange: "transform, opacity",
        transform: "translateZ(0)",
      }}
      className="bg-background rounded-2xl shadow-2xl border border-border p-3 w-48 sm:w-52 md:w-56"
      role="dialog"
      aria-label="Music player controls"
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="font-bold text-sm sm:text-base text-foreground">
          Now Playing
        </h3>
        <button
          onClick={onCollapse}
          className="p-0.5 sm:p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Collapse player"
        >
          <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="relative w-full h-36 sm:h-40 md:h-48 rounded-xl overflow-hidden mb-2 sm:mb-3">
        <SmartImage
          key={currentTrack.id}
          src={currentTrack.coverImage || "/placeholder.svg"}
          alt={currentTrack.title}
          imgClass="object-contain"
        />
      </div>

      <div className="text-center mb-2 sm:mb-3">
        <h4 className="font-bold text-sm sm:text-base text-foreground">
          {currentTrack.title}
        </h4>
        <p className="text-xs text-muted-foreground">{currentTrack.artist}</p>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatTime(safeDisplayTime)}</span>
          <span>{formatTime(safeDuration)}</span>
        </div>

        <input
          type="range"
          min="0"
          max={safeDuration}
          value={safeDisplayTime}
          onChange={handleSeekChange}
          onPointerDown={() => setIsSeeking(true)}
          onPointerUp={commitSeek}
          onPointerCancel={commitSeek}
          onBlur={() => {
            if (!isSeeking) return;
            commitSeek();
          }}
          onKeyDown={(e) => {
            if (!seekKeys.has(e.key)) return;
            setIsSeeking(true);
          }}
          onKeyUp={(e) => {
            if (!seekKeys.has(e.key)) return;
            commitSeek();
          }}
          className="w-full h-1.5 sm:h-2 bg-muted rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${displayProgress}%, rgba(150, 150, 150, 0.3) ${displayProgress}%, rgba(150, 150, 150, 0.3) 100%)`,
          }}
          aria-label="Seek track"
        />

        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          <button
            onClick={onPrevious}
            className="p-0.5 sm:p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Previous track"
          >
            <SkipBack className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-foreground" />
          </button>

          <button
            onClick={onPlayPause}
            className="p-1.5 sm:p-2 rounded-full bg-foreground hover:bg-foreground/90 transition-colors cursor-pointer"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-background" />
            ) : (
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-background ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-0.5 sm:p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Next track"
          >
            <SkipForward className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-foreground" />
          </button>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-1.5 sm:h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volumePercent}%, rgba(150, 150, 150, 0.3) ${volumePercent}%, rgba(150, 150, 150, 0.3) 100%)`,
            }}
            aria-label="Volume control"
          />
          <span className="text-xs text-muted-foreground w-6 sm:w-8">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
};

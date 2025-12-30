declare module '@splidejs/react-splide' {
  import { ComponentType, ReactNode } from 'react';

  export interface SplideProps {
    children?: ReactNode;
    hasTrack?: boolean;
    options?: {
      type?: 'slide' | 'loop' | 'fade';
      rewind?: boolean;
      speed?: number;
      rewindSpeed?: number;
      pagination?: boolean;
      arrows?: boolean;
      drag?: boolean;
      autoplay?: boolean;
      [key: string]: unknown;
    };
    className?: string;
    [key: string]: unknown;
  }

  export interface SplideSlideProps {
    children?: ReactNode;
    className?: string;
    [key: string]: unknown;
  }

  export interface SplideTrackProps {
    children?: ReactNode;
    className?: string;
    [key: string]: unknown;
  }

  export const Splide: ComponentType<SplideProps>;
  export const SplideSlide: ComponentType<SplideSlideProps>;
  export const SplideTrack: ComponentType<SplideTrackProps>;
}

declare module '@splidejs/react-splide/css' {}

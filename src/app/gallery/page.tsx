import type { Metadata } from "next";
import { GalleryPage } from "@/blocks/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Browse through my visual portfolio showcasing photography, design work, and creative projects.",
};

const Gallery = () => {
  return <GalleryPage />;
};

export default Gallery;

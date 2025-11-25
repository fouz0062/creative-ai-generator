// app/page.tsx
"use client"; // This page needs client-side state now

import { useState } from "react";
import Layout from "@/components/Layout";
import MainGeneratorPanel from "@/components/MainGeneratorPanel";
import GallerySidebar from "@/components/GallerySidebar";

interface ImageMetadata {
  id: string;
  prompt: string;
  s3_url: string;
  timestamp: string;
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(
    null
  );

  // Function passed to sidebar to update main panel
  const handleSelectImage = (image: ImageMetadata) => {
    setSelectedImage(image);
  };

  return (
    <Layout
      sidebarContent={<GallerySidebar onSelectImage={handleSelectImage} />}
      mainContent={<MainGeneratorPanel selectedImage={selectedImage} />} // Pass selected image to main panel
    />
  );
}

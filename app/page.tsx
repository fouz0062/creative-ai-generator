"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import MainGeneratorPanel from "@/components/MainGeneratorPanel";
import GallerySidebar from "@/components/GallerySidebar";

interface SelectedImage {
  imageId: string;
  prompt: string;
  imageUrl: string;
  timestamp: string;
  s3Key: string;
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectImage = (image: SelectedImage) => {
    setSelectedImage(image);
  };

  const handleImageGenerated = () => {
    // Refresh gallery when new image is generated
    setRefreshKey((prev) => prev + 1);
    // Trigger gallery refresh
    if ((window as any).refreshGallery) {
      (window as any).refreshGallery();
    }
  };

  return (
    <Layout
      sidebarContent={
        <GallerySidebar
          key={refreshKey}
          onSelectImage={handleSelectImage}
          onRefresh={handleImageGenerated}
        />
      }
      mainContent={
        <MainGeneratorPanel
          selectedImage={selectedImage}
          onImageGenerated={handleImageGenerated}
        />
      }
    />
  );
}

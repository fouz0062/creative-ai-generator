"use client";

import React from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

interface ImageMetadata {
  id: string;
  prompt: string;
  s3_url: string;
  timestamp: string;
}

// --- MOCK DATA ---
const mockImages: ImageMetadata[] = [
  {
    id: "1",
    prompt: "A futuristic city at sunset",
    s3_url: "https://picsum.photos/100/100?random=1",
    timestamp: "2023-10-26T10:00:00Z",
  },
  {
    id: "2",
    prompt: "A cat wearing a wizard hat",
    s3_url: "https://picsum.photos/100/100?random=2",
    timestamp: "2023-10-26T10:05:00Z",
  },
  {
    id: "3",
    prompt: "Underwater alien landscape",
    s3_url: "https://picsum.photos/100/100?random=3",
    timestamp: "2023-10-26T10:10:00Z",
  },
  {
    id: "4",
    prompt: "Abstract art of sound waves",
    s3_url: "https://picsum.photos/100/100?random=4",
    timestamp: "2023-10-26T10:15:00Z",
  },
  {
    id: "5",
    prompt: "Cyberpunk ramen shop",
    s3_url: "https://picsum.photos/100/100?random=5",
    timestamp: "2023-10-26T10:20:00Z",
  },
];
// --- END MOCK DATA ---

interface GallerySidebarProps {
  onSelectImage: (image: ImageMetadata) => void;
}

export default function GallerySidebar({ onSelectImage }: GallerySidebarProps) {
  const { user } = useAuth(); // To potentially show user-specific history

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xl font-semibold text-gray-100 mb-4">
        History & Gallery
      </h3>
      <div className="grid grid-cols-2 gap-4 overflow-y-auto">
        {mockImages.map((image) => (
          <div
            key={image.id}
            className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-200"
            onClick={() => onSelectImage(image)}
          >
            <Image
              src={image.s3_url}
              alt={image.prompt}
              width={100}
              height={100}
              className="object-cover w-full h-full"
            />

            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-xs p-2 text-center">
              {image.prompt.substring(0, 30)}...
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-4 border-t border-gray-700 text-gray-400 text-sm">
        Logged in as: {user?.email}
      </div>
    </div>
  );
}

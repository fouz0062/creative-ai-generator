/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface ImageMetadata {
  imageId: string;
  prompt: string;
  imageUrl: string;
  timestamp: string;
  s3Key: string;
}

interface GallerySidebarProps {
  onSelectImage: (image: ImageMetadata) => void;
  onRefresh?: () => void;
}

export default function GallerySidebar({
  onSelectImage,
  onRefresh,
}: GallerySidebarProps) {
  const { user, isAuthenticated, signOutUser } = useAuth();
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch images when component mounts or when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      fetchImages();
    }
  }, [isAuthenticated]);

  const fetchImages = async () => {
    setIsLoading(true);
    setError("");

    try {
      console.log("🔍 Fetching user images from S3...");

      // Fetch from the new list-images API route
      const response = await fetch("/api/list-images", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Fetched ${data.images.length} images from S3`);
      setImages(data.images || []);
    } catch (err: unknown) {
      console.error("❌ Error fetching images:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load images";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteImage = async (image: ImageMetadata, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onSelectImage

    if (
      !confirm(`Delete this image?\n\n"${image.prompt.substring(0, 50)}..."`)
    ) {
      return;
    }

    try {
      console.log(`🗑️ Deleting image ${image.imageId} from S3...`);

      const response = await fetch(
        `/api/delete-image?s3Key=${encodeURIComponent(image.s3Key)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete image: ${response.status}`);
      }

      console.log("✅ Image deleted successfully from S3");

      // Remove from local state
      setImages((prev) => prev.filter((img) => img.imageId !== image.imageId));
    } catch (err: unknown) {
      console.error("❌ Error deleting image:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to delete image: ${errorMessage}`);
    }
  };

  const downloadImage = async (image: ImageMetadata, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onSelectImage

    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ziagen-${image.prompt
        .substring(0, 30)
        .replace(/[^a-z0-9]/gi, "-")}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error("❌ Error downloading image:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to download image: ${errorMessage}`);
    }
  };

  // Expose refresh function to parent
  useEffect(() => {
    if (onRefresh) {
      (window as Window & { refreshGallery?: () => void }).refreshGallery =
        fetchImages;
    }
  }, [onRefresh]);

  return (
    <div className="flex flex-col h-full">
      <div className="items-center space-x-2 p-4 mb-2.5 text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-center">
        <span
          className="inline-block text-white"
          style={{
            textShadow:
              "0 0 10px rgba(67, 56, 202, 0.8), 0 0 20px rgba(67, 56, 202, 0.6), 0 0 30px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.4)",
          }}
        >
          ZiaGen
        </span>
      </div>

      <div className="flex items-center justify-between px-4 mb-2">
        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold">
          Gallery
        </h3>
        <button
          onClick={fetchImages}
          disabled={isLoading}
          className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <p className="w-full h-[0.2] mb-4 bg-indigo-700"></p>

      {error && (
        <div className="mx-2 sm:mx-4 mb-4 p-2 bg-red-900/50 border border-red-500 rounded text-red-400 text-xs sm:text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 overflow-y-auto px-2 sm:px-4">
        {isLoading && images.length === 0 ? (
          <div className="col-span-1 sm:col-span-2 text-center text-gray-400 py-8 text-sm sm:text-base">
            Loading images...
          </div>
        ) : images.length === 0 ? (
          <div className="col-span-1 sm:col-span-2 text-center text-gray-400 py-8">
            <p className="mb-2 text-sm sm:text-base">No images yet</p>
            <p className="text-xs sm:text-sm">Generate your first image!</p>
          </div>
        ) : (
          images.map((image) => (
            <div
              key={image.imageId}
              className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-200"
              onClick={() => onSelectImage(image)}
            >
              <img
                src={image.imageUrl}
                alt={image.prompt}
                className="object-cover w-full h-full aspect-square"
              />

              {/* Download Button */}
              <button
                onClick={(e) => downloadImage(image, e)}
                className="absolute top-2 left-2 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 cursor-pointer"
                title="Download image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>

              {/* Delete Button */}
              <button
                onClick={(e) => deleteImage(image, e)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 cursor-pointer"
                title="Delete image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>

              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-xs p-2 text-center pointer-events-none">
                {image.prompt.substring(0, 30)}
                {image.prompt.length > 30 ? "..." : ""}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 px-2 sm:px-4 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-2">
          <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm w-full sm:w-auto transition-colors">
            <p className="truncate">
              {user?.signInDetails?.loginId || user?.userId}
            </p>
            <p className="text-xs mt-1">{images.length} images</p>
          </div>
          <button
            onClick={async () => {
              try {
                await signOutUser();
              } catch (err) {
                console.error("Logout error:", err);
              }
            }}
            className="w-full sm:w-auto px-3 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs sm:text-sm rounded cursor-pointer transition-colors font-medium"
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

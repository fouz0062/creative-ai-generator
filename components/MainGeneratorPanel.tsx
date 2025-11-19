// components/MainGeneratorPanel.tsx
"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";

interface ImageMetadata {
  id: string;
  prompt: string;
  s3_url: string;
  timestamp: string;
}

interface MainGeneratorPanelProps {
  selectedImage: ImageMetadata | null;
}

export default function MainGeneratorPanel({
  selectedImage,
}: MainGeneratorPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Effect to update panel when a new image is selected from sidebar
  useEffect(() => {
    if (selectedImage) {
      setPrompt(selectedImage.prompt);
      setGeneratedImageUrl(selectedImage.s3_url);
    } else {
      // Clear prompt and image when no image is selected
      setPrompt("");
      setGeneratedImageUrl(null);
    }
  }, [selectedImage]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedImageUrl(null); // Clear previous image

    try {
      // --- MOCK API CALL ---
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate network delay
      const mockImageUrl =
        "https://picsum.photos/800/600?random=" + Math.random(); // Placeholder image
      setGeneratedImageUrl(mockImageUrl);
      // --- END MOCK API CALL ---
    } catch (error) {
      console.error("Error generating image:", error);
      // Optionally, set an error message state here to display to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 p-6 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-gray-100 mb-2">
        Enter your prompt here...
      </h2>
      {/* Visually hidden label for accessibility */}
      <label htmlFor="prompt-textarea" className="sr-only">
        Image generation prompt
      </label>

      <textarea
        id="prompt-textarea"
        className="w-full p-4 mb-4 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y min-h-[100px]"
        placeholder="Describe the image you want to generate (e.g., 'A vibrant futuristic city at sunset with flying cars')."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
      />

      <button
        onClick={handleGenerate}
        disabled={isLoading || prompt.trim() === ""}
        className={`px-6 py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-6 ${
          isLoading
            ? "animate-pulse"
            : "hover:from-purple-700 hover:to-indigo-700"
        }`}
      >
        {isLoading
          ? "Generating..."
          : selectedImage
          ? "Regenerate Image"
          : "Generate Image"}
      </button>

      {isLoading ? (
        <div className="mt-6 flex-1 flex items-center justify-center text-purple-400 text-xl border-2 border-dashed border-purple-700 rounded-lg animate-pulse">
          Generating image... Please wait.
        </div>
      ) : generatedImageUrl ? (
        <div className="relative mt-6 flex-1 flex items-center justify-center bg-gray-700 rounded-lg overflow-hidden">
          {/*
            Key changes:
            1. Removed w-full h-full from Image component, `fill` prop handles this.
            2. Changed `object-fill` to `object-contain`.
            3. Ensured the parent div has `relative` positioning (already there).
            4. Ensured the parent div has explicit dimensions or is flexible (h-full flex-1 is good here).
          */}
          <Image
            src={generatedImageUrl}
            alt={`AI generated art for the prompt: "${prompt}"`}
            fill // This makes the image fill its parent's dimensions
            className="object-contain" // This ensures the image fits within its container without cropping or stretching
            // For a production app, you might also want to add `sizes` prop for optimization
            // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="mt-6 flex-1 flex items-center justify-center text-gray-400 text-lg border-2 border-dashed border-gray-700 rounded-lg">
          Your generated image will appear here.
        </div>
      )}
    </div>
  );
}

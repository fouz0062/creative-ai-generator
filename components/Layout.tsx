"use client";

import React, { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthPlaceholder from "./AuthPlaceholder";

interface LayoutProps {
  sidebarContent: ReactNode;
  mainContent: ReactNode;
}

export default function Layout({ sidebarContent, mainContent }: LayoutProps) {
  const { isAuthenticated } = useAuth();

  // For now, if not logged in, show a simple message or AuthPlaceholder
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-gray-100">
        <AuthPlaceholder />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-64 lg:w-72 bg-gray-800 p-2 sm:p-4 border-b md:border-b-0 md:border-r border-gray-700 max-h-[40vh] md:max-h-none overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col bg-gray-900">
        {mainContent}
      </main>
    </div>
  );
}

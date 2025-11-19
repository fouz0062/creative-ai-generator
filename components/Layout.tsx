"use client";

import React, { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthPlaceholder from "./AuthPlaceholder"; // Or your proper Auth UI

interface LayoutProps {
  sidebarContent: ReactNode;
  mainContent: ReactNode;
}

export default function Layout({ sidebarContent, mainContent }: LayoutProps) {
  const { isLoggedIn } = useAuth();

  // For now, if not logged in, show a simple message or AuthPlaceholder
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <AuthPlaceholder />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-4 border-r border-gray-700">
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">{mainContent}</main>
    </div>
  );
}

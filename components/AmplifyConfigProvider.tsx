"use client";

import { useEffect } from "react";
import { configureAmplify } from "@/lib/amplify-config";

export default function AmplifyConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Configure Amplify when component mounts (client-side only)
    configureAmplify();
  }, []);

  return <>{children}</>;
}

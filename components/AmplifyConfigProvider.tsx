"use client";

import { useEffect } from "react";
import "@/lib/amplify-config";

export default function AmplifyConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

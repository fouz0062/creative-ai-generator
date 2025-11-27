// app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext"; // Import your AuthProvider
import { Amplify } from "aws-amplify";

const inter = Inter({ subsets: ["latin"] });
Amplify.configure(exports);
export const metadata = {
  title: "Creative AI Generator",
  description: "Generate images with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {" "}
          {/* Wrap your app with AuthProvider */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

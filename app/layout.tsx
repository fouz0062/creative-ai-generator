import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import AmplifyConfigProvider from "@/components/AmplifyConfigProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Creative AI Generator",
  description: "Generate images with AI",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AmplifyConfigProvider>
          <AuthProvider>{children}</AuthProvider>
        </AmplifyConfigProvider>
      </body>
    </html>
  );
}

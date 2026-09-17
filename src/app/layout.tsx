import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#F7F7F5",
  width: "device-width",
  initialScale: 1,
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rover AI — Your intelligent workspace",
  description:
    "Rover AI brings your docs, projects, knowledge, and workflows together—so you can find answers, create content, and get work done faster.",
  metadataBase: new URL("https://rover.ai"),
  openGraph: {
    title: "Rover AI — Your intelligent workspace",
    description:
      "Everything your team knows. One intelligent workspace.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

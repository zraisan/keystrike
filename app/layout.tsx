import type { Metadata } from "next";
import { DM_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "KeyFlow",
  description: "A typing test application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmMono.className} antialiased`}>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Edu-Learn - Modern Learning Management System",
  description: "Connects teachers and students for interactive learning, automated grading, and personalized analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}

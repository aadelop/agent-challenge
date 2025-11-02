import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AgentSelector } from "./components/AgentSelector";
import "./globals.css";
import "@copilotkit/react-ui/styles.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nosana Mastra Agent Kit",
  description: "An example of using CopilotKit with Mastra agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AgentSelector>
          {children}
        </AgentSelector>
      </body>
    </html>
  );
}

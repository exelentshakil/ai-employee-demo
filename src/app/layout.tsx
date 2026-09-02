import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TrafficTracker } from "@/components/TrafficTracker";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Employee — Grounded Console",
  description:
    "An AI employee that answers only from your documents and never acts without your approval.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <TrafficTracker />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

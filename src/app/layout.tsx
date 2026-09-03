import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

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
          {/* traffic hub pixel -- see exelentshakil/demo-traffic */}
          <img
            src="https://demo-traffic.vercel.app/api/px?p=ai-employee-demo"
            alt=""
            width={1}
            height={1}
            style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

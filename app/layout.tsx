import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ScrollDetector } from "@/components/scroll-detector";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthDebug from "@/components/AuthDebug";
import { Analytics } from "@vercel/analytics/next"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Invista – Integrated Inventory & Supply Chain System",
  description:
    "Invista is a modern web-based dashboard for real-time inventory tracking, supplier and product management, and supply chain optimization.",
  authors: [{ name: "Team Invista", url: "https://github.com/sushanshetty1" }],
  keywords: [
    "Inventory Management",
    "Supply Chain",
    "Order Processing",
    "Logistics",
    "Invista",
    "Warehouse",
    "Automation",
    "Procurement",
    "Reporting",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.className} bg-background text-foreground antialiased`}      >        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange        >
          <AuthProvider>
            <Analytics />
            <Navbar />
            <ScrollDetector />
            {children}
            <Footer />
            <AuthDebug />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
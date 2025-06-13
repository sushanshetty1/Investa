import type { Metadata } from "next";
import "./globals.css";
import { Space_Grotesk } from "next/font/google";

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
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.className} bg-gray-50 text-gray-900 antialiased dark:bg-gray-900 dark:text-gray-100`}
      >
        {children}
      </body>
    </html>
  );
}
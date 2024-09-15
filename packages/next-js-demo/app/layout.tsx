import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Menu } from "@/components/menu";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Inngest blog CMS",
  description: "Leverage AI Automation to optimize your blog posts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex h-screen bg-gray-100">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-md">
            <div className="p-4">
              <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
              <Menu />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8 overflow-auto">{children}</div>
        </div>
      </body>
    </html>
  );
}

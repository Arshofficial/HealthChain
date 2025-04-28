import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner"; // ✅ Import Toaster

export const metadata: Metadata = {
  title: "HealthChain",
  description: "Secure Patient Data Sharing Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-center" richColors /> {/* 🛠 Place Toaster here */}
      </body>
    </html>
  );
}

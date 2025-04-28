import type { Metadata } from "next";
import "../globals.css";
import LayoutClient from "./layout-client";

export const metadata: Metadata = {
  title: "HealthChain App",
  description: "Patient and Provider Dashboard",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <LayoutClient>{children}</LayoutClient>
    </>
  );
}

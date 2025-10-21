import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import WelcomeProvider from "@/components/WelcomeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Dashboard DYS - Ticketing Qualité",
  description: "Tableau de bord pour la gestion des issues du projet DYS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <SessionProvider>
          <WelcomeProvider>
            {children}
          </WelcomeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

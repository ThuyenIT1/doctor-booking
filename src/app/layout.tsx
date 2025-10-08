import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import AuthButton from "@/components/AuthButton";
import { cn } from "@/lib/utils";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "DoctorBook - Professional Doctor Booking",
  description: "Easily book appointments with the best doctors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          playfairDisplay.variable
        )}
      >
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
            <Link
              href="/"
              className="font-serif text-2xl font-bold text-primary transition-colors hover:text-primary/80"
            >
              DoctorBook
            </Link>
            <AuthButton />
          </div>
        </header>
        <main className="container mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}

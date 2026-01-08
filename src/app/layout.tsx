import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/context/auth-context";

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
  title: {
    default: "Naokomik | Baca Komik Gratis",
    template: "%s | Naokomik",
  },
  description:
    "Baca manga, manhwa, dan manhua online gratis dengan kualitas terbaik. Update terbaru setiap hari!",
  keywords: [
    "manga",
    "manhwa",
    "manhua",
    "baca manga",
    "komik online",
    "manga indonesia",
    "naokomik",
  ],
  authors: [{ name: "Naokomik" }],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Naokomik | Baca Komik Gratis",
    description:
      "Baca manga, manhwa, dan manhua online gratis dengan kualitas terbaik.",
    type: "website",
    locale: "id_ID",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Naokomik | Baca Komik Gratis",
    description:
      "Baca manga, manhwa, dan manhua online gratis dengan kualitas terbaik.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

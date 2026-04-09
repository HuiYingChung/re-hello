import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Noto_Sans_TC } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const notoSansTc = Noto_Sans_TC({
  variable: "--font-sans",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://re-hello.vercel.app"),
  title: {
    default: "Rehello | A gentle place for the people you meet",
    template: "%s | Rehello",
  },
  description:
    "A warm social memory app for remembering people, refreshing recall before you see them again, and staying in touch without the pressure.",
  applicationName: "Rehello",
  keywords: [
    "social memory app",
    "remember people",
    "follow up reminders",
    "relationship memory",
    "networking app",
    "personal CRM alternative",
  ],
  authors: [{ name: "Rehello" }],
  creator: "Rehello",
  publisher: "Rehello",
  category: "productivity",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Rehello",
    title: "Rehello | A gentle place for the people you meet",
    description:
      "Remember people, refresh recall before you see them again, and stay in touch without the pressure.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Rehello social preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rehello | A gentle place for the people you meet",
    description:
      "Remember people, refresh recall before you see them again, and stay in touch without the pressure.",
    images: ["/twitter-image"],
  },
  appleWebApp: {
    capable: true,
    title: "Rehello",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#b16e46",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${notoSansTc.variable} ${instrumentSerif.variable}`}
    >
      <body suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

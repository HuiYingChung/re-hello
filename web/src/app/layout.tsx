import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Noto_Sans_TC } from "next/font/google";
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
  metadataBase: new URL("https://helloagain.vercel.app"),
  title: {
    default: "Helloagain | Private Beziehungserinnerungen",
    template: "%s | Helloagain",
  },
  description:
    "Eine private App für Menschen, gemeinsame Momente und sanfte Erinnerungen.",
  applicationName: "Helloagain",
  keywords: [
    "social memory app",
    "remember people",
    "follow up reminders",
    "relationship memory",
    "networking app",
    "personal CRM alternative",
  ],
  authors: [{ name: "Helloagain" }],
  creator: "Helloagain",
  publisher: "Helloagain",
  category: "productivity",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Helloagain",
    title: "Helloagain | Private Beziehungserinnerungen",
    description:
      "Eine private App für Menschen, gemeinsame Momente und sanfte Erinnerungen.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Helloagain hält persönliche Erinnerungen übersichtlich fest",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Helloagain | Private Beziehungserinnerungen",
    description:
      "Eine private App für Menschen, gemeinsame Momente und sanfte Erinnerungen.",
    images: ["/twitter-image"],
  },
  appleWebApp: {
    capable: true,
    title: "Helloagain",
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
      lang="de"
      data-scroll-behavior="smooth"
      className={`${notoSansTc.variable} ${instrumentSerif.variable}`}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

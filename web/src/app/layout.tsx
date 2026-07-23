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
  metadataBase: new URL("https://re-hello.vercel.app"),
  title: {
    default: "Rehello | GPT-5.6 for easier next conversations",
    template: "%s | Rehello",
  },
  description:
    "GPT-5.6 turns a messy memory into a thoughtful recall card so the next conversation feels easier.",
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
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Rehello",
    title: "Rehello | GPT-5.6 for easier next conversations",
    description:
      "Turn a messy memory into a thoughtful recall card: who they are, what mattered, and what to ask next.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Rehello uses GPT-5.6 to turn messy memories into recall cards",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rehello | GPT-5.6 for easier next conversations",
    description:
      "Turn a messy memory into a thoughtful recall card: who they are, what mattered, and what to ask next.",
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
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

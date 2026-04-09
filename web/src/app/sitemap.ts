import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://re-hello.vercel.app";
  const lastModified = new Date();

  return [
    { url: `${base}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/welcome`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/remember`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/people`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/prep`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/settings`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}

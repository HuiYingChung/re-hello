import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rehello | A gentle place for the people you meet",
    short_name: "Rehello",
    description:
      "A warm social memory app for remembering people, refreshing recall before you see them again, and staying in touch without the pressure.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6efe6",
    theme_color: "#b16e46",
    categories: ["lifestyle", "productivity", "social"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

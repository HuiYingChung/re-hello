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
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Demonlist Eldenigas",
    short_name: "Demonlist",
    description: "Private demonlist inspired by Pointercrate",
    start_url: "/",
    display: "standalone",
    background_color: "#1f2430",
    theme_color: "#1f2430",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}

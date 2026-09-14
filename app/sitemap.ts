import type { MetadataRoute } from "next";
import spotsData from "@/data/spots.json";

const SITE_URL = "https://surfwikikorea.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const homepage: MetadataRoute.Sitemap[number] = {
    url: SITE_URL,
    lastModified,
    changeFrequency: "daily",
    priority: 1,
  };

  const spotPages: MetadataRoute.Sitemap = spotsData.map((spot) => ({
    url: `${SITE_URL}/spot/${spot.id}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [homepage, ...spotPages];
}

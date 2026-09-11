import type { MetadataRoute } from "next";
import { archiveCategories } from "@/data/documentary";
import { people } from "@/data/site";
import { getArtItems } from "@/sanity/lib/art";
import { getCatalogItems } from "@/sanity/lib/catalog";
import { getPosts } from "@/sanity/lib/posts";
import { absoluteUrl } from "@/lib/siteUrl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [items, artItems, posts] = await Promise.all([getCatalogItems(), getArtItems(), getPosts()]);
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/carta"), lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/productos-de-origen"), lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/galeria-de-arte"), lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/publicaciones"), lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/comunidad"), lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/links"), lastModified, changeFrequency: "monthly", priority: 0.5 },
  ];

  const productRoutes: MetadataRoute.Sitemap = items.map((item) => ({
    url: absoluteUrl(`/productos-de-origen/${item.slug}`), lastModified, changeFrequency: "weekly", priority: 0.7,
  }));

  const artRoutes: MetadataRoute.Sitemap = artItems.map((item) => ({
    url: absoluteUrl(`/galeria-de-arte/${item.slug}`), lastModified, changeFrequency: "weekly", priority: 0.6,
  }));

  const peopleRoutes: MetadataRoute.Sitemap = people.map((person) => ({
    url: absoluteUrl(`/personas/${person.slug}`), lastModified, changeFrequency: "monthly", priority: 0.5,
  }));

  const archiveRoutes: MetadataRoute.Sitemap = archiveCategories.map((category) => ({
    url: absoluteUrl(`/archivo/${category.id}`), lastModified, changeFrequency: "monthly", priority: 0.4,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/publicaciones/${post.slug}`), lastModified: new Date(post.publishedAt), changeFrequency: "monthly", priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...artRoutes, ...postRoutes, ...peopleRoutes, ...archiveRoutes];
}

import type { CatalogImage, PortableTextBlock } from "./catalogTypes";

// El cuerpo de una publicación mezcla bloques de texto con fotografías
// intercaladas, así que su tipo es más amplio que el Portable Text del catálogo.
export type PostImageBlock = {
  _key?: string;
  _type: "image";
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
};

export type PostBodyBlock = PortableTextBlock | PostImageBlock;

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: PostBodyBlock[];
  coverImage: CatalogImage;
  publishedAt: string;
  author?: string;
  seo?: { title?: string; description?: string };
};

export type PostSummary = Omit<Post, "body">;

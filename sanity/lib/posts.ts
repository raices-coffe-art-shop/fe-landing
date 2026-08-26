import "server-only";

import { cache } from "react";
import type { SanityImageSource } from "@sanity/image-url";
import type { PortableTextBlock } from "./catalogTypes";
import type { Post, PostBodyBlock, PostSummary } from "./postTypes";
import { sanityClient } from "./client";
import { urlForImage } from "./image";
import { postBySlugQuery, postsQuery } from "./queries";

export const POSTS_TAG = "posts";
export const postTag = (slug: string) => `post:${slug}`;

const COVER_WIDTH = 1600;
const COVER_HEIGHT = 900;
const BODY_IMAGE_WIDTH = 1400;
const BODY_IMAGE_HEIGHT = 1000;

type SanityPost = {
  _id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  body?: unknown[];
  coverImage?: SanityImageSource;
  coverImageAlt?: string;
  publishedAt?: string;
  author?: string;
  seo?: Post["seo"];
};

function fetchOptions(tags: string[]) {
  if (process.env.NODE_ENV === "development") {
    return { cache: "no-store" as const };
  }
  return { next: { revalidate: 300, tags } };
}

function reportPostError(scope: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[Sanity publicaciones] Falló ${scope}:`, error);
  }
}

function normalizeImage(
  source: SanityImageSource | null | undefined,
  alt: string,
  width: number,
  height: number,
) {
  const src = urlForImage(source)?.width(width).height(height).fit("crop").auto("format").url();
  return src ? { src, alt: alt.trim() || "Fotografía de Raíces", width, height } : null;
}

// El cuerpo llega como Portable Text crudo: los bloques de texto pasan tal cual
// y las imágenes se resuelven a una URL del CDN para que el cliente no tenga que
// conocer el formato de Sanity.
function normalizeBody(blocks: unknown[] | undefined): PostBodyBlock[] {
  if (!Array.isArray(blocks)) return [];

  return blocks.flatMap((raw): PostBodyBlock[] => {
    const block = raw as { _type?: string; _key?: string; alt?: string; caption?: string };
    if (block?._type === "image") {
      const image = normalizeImage(
        raw as SanityImageSource,
        block.alt || "",
        BODY_IMAGE_WIDTH,
        BODY_IMAGE_HEIGHT,
      );
      if (!image) return [];
      return [
        {
          _key: block._key,
          _type: "image",
          src: image.src,
          alt: image.alt,
          caption: block.caption?.trim() || undefined,
          width: image.width,
          height: image.height,
        },
      ];
    }
    if (block?._type === "block") return [raw as PortableTextBlock];
    return [];
  });
}

function normalizeSummary(post: SanityPost): PostSummary | null {
  if (!post._id || !post.title?.trim() || !post.slug?.trim()) return null;

  const cover = normalizeImage(
    post.coverImage,
    post.coverImageAlt || post.title,
    COVER_WIDTH,
    COVER_HEIGHT,
  );
  if (!cover) return null;

  return {
    id: post._id,
    title: post.title.trim(),
    slug: post.slug.trim(),
    excerpt: post.excerpt?.trim() || "",
    coverImage: cover,
    publishedAt: post.publishedAt || new Date(0).toISOString(),
    author: post.author?.trim() || undefined,
    seo: post.seo,
  };
}

export const getPosts = cache(async (): Promise<PostSummary[]> => {
  if (!sanityClient) return [];
  try {
    const posts = await sanityClient.fetch<SanityPost[]>(postsQuery, {}, fetchOptions([POSTS_TAG]));
    return (posts || [])
      .map(normalizeSummary)
      .filter((post): post is PostSummary => post !== null);
  } catch (error) {
    reportPostError("getPosts", error);
    return [];
  }
});

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  if (!slug || !sanityClient) return null;
  try {
    const post = await sanityClient.fetch<SanityPost | null>(
      postBySlugQuery,
      { slug },
      fetchOptions([POSTS_TAG, postTag(slug)]),
    );
    if (!post) return null;
    const summary = normalizeSummary(post);
    if (!summary) return null;
    return { ...summary, body: normalizeBody(post.body) };
  } catch (error) {
    reportPostError(`getPostBySlug(${slug})`, error);
    return null;
  }
});

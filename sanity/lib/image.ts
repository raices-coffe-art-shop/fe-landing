import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { sanityClient } from "./client";

const builder = sanityClient ? createImageUrlBuilder(sanityClient) : null;

export function urlForImage(source: SanityImageSource | null | undefined) {
  return source && builder ? builder.image(source) : null;
}

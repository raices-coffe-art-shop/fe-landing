import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { sanityClient } from "./client";

const builder = sanityClient ? createImageUrlBuilder(sanityClient) : null;

function hasResolvableAsset(source: SanityImageSource | null | undefined): source is SanityImageSource {
  if (!source || typeof source !== "object") return false;
  if ("asset" in source) {
    const asset = source.asset;
    return Boolean(
      asset &&
      typeof asset === "object" &&
      (("_ref" in asset && typeof asset._ref === "string") || ("_id" in asset && typeof asset._id === "string"))
    );
  }
  return "_ref" in source || "_id" in source;
}

export function urlForImage(source: SanityImageSource | null | undefined) {
  return hasResolvableAsset(source) && builder ? builder.image(source) : null;
}

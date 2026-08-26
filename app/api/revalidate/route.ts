import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { SITE_SETTINGS_TAG } from "@/sanity/lib/siteSettings";
import { CATALOG_CATEGORIES_TAG, CATALOG_TAG, catalogItemTag } from "@/sanity/lib/catalog";
import { POSTS_TAG, postTag } from "@/sanity/lib/posts";

type SanityWebhookBody = {
  _id?: string;
  _type?: "siteSettings" | "catalogCategory" | "catalogItem" | "post" | string;
  slug?: string | null;
  previousSlug?: string | null;
};

const siteSettingsPaths = ["/", "/links", "/arte", "/catalogo", "/catalogo/imprimir", "/catalogo/carta", "/catalogo/tv", "/comunidad"];
const siteSettingsDynamicPaths = ["/archivo/[slug]", "/arte/[slug]", "/catalogo/[slug]", "/personas/[slug]"] as const;

function revalidateSiteSettings() {
  revalidateTag(SITE_SETTINGS_TAG, { expire: 0 });
  for (const path of siteSettingsPaths) revalidatePath(path);
  for (const path of siteSettingsDynamicPaths) revalidatePath(path, "page");
}

function revalidateCatalogCategory() {
  revalidateTag(CATALOG_CATEGORIES_TAG, { expire: 0 });
  revalidateTag(CATALOG_TAG, { expire: 0 });
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/catalogo/imprimir");
  revalidatePath("/catalogo/carta");
  revalidatePath("/catalogo/tv");
  revalidatePath("/catalogo/[slug]", "page");
}

function revalidateCatalogItem(slug?: string | null, previousSlug?: string | null) {
  revalidateTag(CATALOG_TAG, { expire: 0 });
  revalidateTag(CATALOG_CATEGORIES_TAG, { expire: 0 });

  const slugs = new Set([slug, previousSlug].filter((value): value is string => Boolean(value)));
  for (const itemSlug of slugs) {
    revalidateTag(catalogItemTag(itemSlug), { expire: 0 });
    revalidatePath(`/catalogo/${itemSlug}`);
  }

  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/catalogo/imprimir");
  revalidatePath("/catalogo/carta");
  revalidatePath("/catalogo/tv");
  revalidatePath("/catalogo/[slug]", "page");
}

function revalidatePost(slug?: string | null, previousSlug?: string | null) {
  revalidateTag(POSTS_TAG, { expire: 0 });

  const slugs = new Set([slug, previousSlug].filter((value): value is string => Boolean(value)));
  for (const postSlug of slugs) {
    revalidateTag(postTag(postSlug), { expire: 0 });
    revalidatePath(`/publicaciones/${postSlug}`);
  }

  revalidatePath("/publicaciones");
  revalidatePath("/publicaciones/[slug]", "page");
}

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json({ ok: false, message: "Missing SANITY_REVALIDATE_SECRET" }, { status: 500 });
  }

  let parsed: Awaited<ReturnType<typeof parseBody<SanityWebhookBody>>>;

  try {
    parsed = await parseBody<SanityWebhookBody>(request, secret);
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid webhook payload" }, { status: 400 });
  }

  if (parsed.isValidSignature !== true) {
    return NextResponse.json({ ok: false, message: "Invalid signature" }, { status: 401 });
  }

  const body = parsed.body;
  if (!body?._type) {
    return NextResponse.json({ ok: false, message: "Missing document type" }, { status: 400 });
  }

  if (body._type === "siteSettings") {
    revalidateSiteSettings();
  } else if (body._type === "catalogCategory") {
    revalidateCatalogCategory();
  } else if (body._type === "catalogItem") {
    revalidateCatalogItem(body.slug, body.previousSlug);
  } else if (body._type === "post") {
    revalidatePost(body.slug, body.previousSlug);
  } else {
    return NextResponse.json({
      ok: true,
      revalidated: false,
      message: "Ignored document type",
      type: body._type,
    });
  }

  return NextResponse.json({
    ok: true,
    revalidated: true,
    type: body._type,
    slug: body.slug ?? null,
    previousSlug: body.previousSlug ?? null,
  });
}

export function GET() {
  return NextResponse.json({ ok: false, message: "Method not allowed" }, { status: 405 });
}

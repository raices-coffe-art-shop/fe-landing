import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { ART_CATEGORIES_TAG, ART_TAG, artItemTag } from "@/sanity/lib/art";
import { CATALOG_CATEGORIES_TAG, CATALOG_TAG, catalogItemTag } from "@/sanity/lib/catalog";
import { MENU_CATEGORIES_TAG, MENU_TAG } from "@/sanity/lib/menu";
import { POSTS_TAG, postTag } from "@/sanity/lib/posts";
import { SITE_SETTINGS_TAG } from "@/sanity/lib/siteSettings";

type SanityWebhookBody = {
  _id?: string;
  _type?: "siteSettings" | "menuCategory" | "menuItem" | "catalogCategory" | "catalogItem" | "artCategory" | "artItem" | "post" | string;
  slug?: string | null;
  previousSlug?: string | null;
};

const siteSettingsPaths = [
  "/", "/links", "/carta", "/carta/imprimir", "/carta/tv", "/productos-de-origen", "/galeria-de-arte", "/publicaciones", "/comunidad",
];
const siteSettingsDynamicPaths = [
  "/archivo/[slug]", "/productos-de-origen/[slug]", "/galeria-de-arte/[slug]", "/personas/[slug]", "/publicaciones/[slug]",
] as const;

function revalidateSiteSettings() {
  revalidateTag(SITE_SETTINGS_TAG, { expire: 0 });
  for (const path of siteSettingsPaths) revalidatePath(path);
  for (const path of siteSettingsDynamicPaths) revalidatePath(path, "page");
}

function revalidateMenu() {
  revalidateTag(MENU_TAG, { expire: 0 });
  revalidateTag(MENU_CATEGORIES_TAG, { expire: 0 });
  revalidatePath("/carta");
  revalidatePath("/carta/imprimir");
  revalidatePath("/carta/tv");
  revalidatePath("/catalogo/carta");
  revalidatePath("/catalogo/imprimir");
  revalidatePath("/catalogo/tv");
}

function revalidateCatalogCategory() {
  revalidateTag(CATALOG_CATEGORIES_TAG, { expire: 0 });
  revalidateTag(CATALOG_TAG, { expire: 0 });
  revalidatePath("/");
  revalidatePath("/productos-de-origen");
  revalidatePath("/productos-de-origen/[slug]", "page");
}

function revalidateCatalogItem(slug?: string | null, previousSlug?: string | null) {
  revalidateTag(CATALOG_TAG, { expire: 0 });
  revalidateTag(CATALOG_CATEGORIES_TAG, { expire: 0 });
  for (const itemSlug of new Set([slug, previousSlug].filter((value): value is string => Boolean(value)))) {
    revalidateTag(catalogItemTag(itemSlug), { expire: 0 });
    revalidatePath(`/productos-de-origen/${itemSlug}`);
  }
  revalidatePath("/");
  revalidatePath("/productos-de-origen");
  revalidatePath("/productos-de-origen/[slug]", "page");
}

function revalidateArt(slug?: string | null, previousSlug?: string | null) {
  revalidateTag(ART_TAG, { expire: 0 });
  revalidateTag(ART_CATEGORIES_TAG, { expire: 0 });
  for (const itemSlug of new Set([slug, previousSlug].filter((value): value is string => Boolean(value)))) {
    revalidateTag(artItemTag(itemSlug), { expire: 0 });
    revalidatePath(`/galeria-de-arte/${itemSlug}`);
  }
  revalidatePath("/");
  revalidatePath("/galeria-de-arte");
  revalidatePath("/galeria-de-arte/[slug]", "page");
}

function revalidatePost(slug?: string | null, previousSlug?: string | null) {
  revalidateTag(POSTS_TAG, { expire: 0 });
  for (const postSlug of new Set([slug, previousSlug].filter((value): value is string => Boolean(value)))) {
    revalidateTag(postTag(postSlug), { expire: 0 });
    revalidatePath(`/publicaciones/${postSlug}`);
  }
  revalidatePath("/publicaciones");
  revalidatePath("/publicaciones/[slug]", "page");
}

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ ok: false, message: "Missing SANITY_REVALIDATE_SECRET" }, { status: 500 });

  let parsed: Awaited<ReturnType<typeof parseBody<SanityWebhookBody>>>;
  try {
    // Espera brevemente a que el cambio publicado se propague antes de invalidar.
    parsed = await parseBody<SanityWebhookBody>(request, secret, true);
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid webhook payload" }, { status: 400 });
  }

  if (parsed.isValidSignature !== true) return NextResponse.json({ ok: false, message: "Invalid signature" }, { status: 401 });
  const body = parsed.body;
  if (!body?._type) return NextResponse.json({ ok: false, message: "Missing document type" }, { status: 400 });

  if (body._type === "siteSettings") revalidateSiteSettings();
  else if (body._type === "menuCategory" || body._type === "menuItem") revalidateMenu();
  else if (body._type === "catalogCategory") revalidateCatalogCategory();
  else if (body._type === "catalogItem") revalidateCatalogItem(body.slug, body.previousSlug);
  else if (body._type === "artCategory") revalidateArt();
  else if (body._type === "artItem") revalidateArt(body.slug, body.previousSlug);
  else if (body._type === "post") revalidatePost(body.slug, body.previousSlug);
  else return NextResponse.json({ ok: true, revalidated: false, message: "Ignored document type", type: body._type });

  return NextResponse.json({ ok: true, revalidated: true, type: body._type, slug: body.slug ?? null, previousSlug: body.previousSlug ?? null });
}

export function GET() {
  return NextResponse.json({ ok: false, message: "Method not allowed" }, { status: 405 });
}

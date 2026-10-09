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
  _type?: "siteSettings" | "screenSettings" | "menuCategory" | "menuItem" | "catalogCategory" | "catalogItem" | "artCategory" | "artItem" | "post" | string;
  slug?: string | null;
  previousSlug?: string | null;
};

type RevalidationPath = {
  path: string;
  type?: "page" | "layout";
};

type RevalidationPlan = {
  tags: string[];
  paths: RevalidationPath[];
};

const siteSettingsPaths = [
  "/", "/links", "/carta", "/carta/imprimir", "/carta/tv", "/productos-de-origen", "/galeria-de-arte", "/publicaciones", "/comunidad",
];
const siteSettingsDynamicPaths = [
  "/archivo/[slug]", "/productos-de-origen/[slug]", "/galeria-de-arte/[slug]", "/personas/[slug]", "/publicaciones/[slug]",
] as const;

function applyRevalidation(plan: RevalidationPlan) {
  for (const tag of plan.tags) revalidateTag(tag, { expire: 0 });
  for (const { path, type } of plan.paths) revalidatePath(path, type);
}

function revalidateSiteSettings(): RevalidationPlan {
  return {
    tags: [SITE_SETTINGS_TAG],
    paths: [
      ...siteSettingsPaths.map((path) => ({ path })),
      ...siteSettingsDynamicPaths.map((path) => ({ path, type: "page" as const })),
    ],
  };
}

function revalidateMenu(): RevalidationPlan {
  return {
    tags: [MENU_TAG, MENU_CATEGORIES_TAG],
    paths: [
      { path: "/carta" },
      { path: "/carta/imprimir" },
      { path: "/carta/tv" },
      { path: "/catalogo/carta" },
      { path: "/catalogo/imprimir" },
      { path: "/catalogo/tv" },
    ],
  };
}

function revalidateCatalogCategory(): RevalidationPlan {
  return {
    tags: [CATALOG_CATEGORIES_TAG, CATALOG_TAG],
    paths: [
      { path: "/" },
      { path: "/productos-de-origen" },
      { path: "/productos-de-origen/[slug]", type: "page" },
    ],
  };
}

function revalidateCatalogItem(slug?: string | null, previousSlug?: string | null): RevalidationPlan {
  const itemSlugs = [...new Set([slug, previousSlug].filter((value): value is string => Boolean(value)))];
  return {
    tags: [CATALOG_TAG, CATALOG_CATEGORIES_TAG, ...itemSlugs.map(catalogItemTag)],
    paths: [
      ...itemSlugs.map((itemSlug) => ({ path: `/productos-de-origen/${itemSlug}` })),
      { path: "/" },
      { path: "/productos-de-origen" },
      { path: "/productos-de-origen/[slug]", type: "page" },
    ],
  };
}

function revalidateArt(slug?: string | null, previousSlug?: string | null): RevalidationPlan {
  const itemSlugs = [...new Set([slug, previousSlug].filter((value): value is string => Boolean(value)))];
  return {
    tags: [ART_TAG, ART_CATEGORIES_TAG, ...itemSlugs.map(artItemTag)],
    paths: [
      ...itemSlugs.map((itemSlug) => ({ path: `/galeria-de-arte/${itemSlug}` })),
      { path: "/" },
      { path: "/galeria-de-arte" },
      { path: "/galeria-de-arte/[slug]", type: "page" },
    ],
  };
}

function revalidatePost(slug?: string | null, previousSlug?: string | null): RevalidationPlan {
  const postSlugs = [...new Set([slug, previousSlug].filter((value): value is string => Boolean(value)))];
  return {
    tags: [POSTS_TAG, ...postSlugs.map(postTag)],
    paths: [
      ...postSlugs.map((postSlug) => ({ path: `/publicaciones/${postSlug}` })),
      { path: "/publicaciones" },
      { path: "/publicaciones/[slug]", type: "page" },
    ],
  };
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

  let plan: RevalidationPlan;
  if (body._type === "siteSettings" || body._type === "screenSettings") plan = revalidateSiteSettings();
  else if (body._type === "menuCategory" || body._type === "menuItem") plan = revalidateMenu();
  else if (body._type === "catalogCategory") plan = revalidateCatalogCategory();
  else if (body._type === "catalogItem") plan = revalidateCatalogItem(body.slug, body.previousSlug);
  else if (body._type === "artCategory") plan = revalidateArt();
  else if (body._type === "artItem") plan = revalidateArt(body.slug, body.previousSlug);
  else if (body._type === "post") plan = revalidatePost(body.slug, body.previousSlug);
  else return NextResponse.json({ ok: true, revalidated: false, message: "Ignored document type", type: body._type });

  console.info("[revalidate] received", { type: body._type, slug: body.slug ?? null, previousSlug: body.previousSlug ?? null });
  console.info("[revalidate] invalidating", { tags: plan.tags, paths: plan.paths });
  applyRevalidation(plan);
  console.info("[revalidate] finished", { type: body._type });

  return NextResponse.json({
    ok: true,
    revalidated: true,
    type: body._type,
    slug: body.slug ?? null,
    previousSlug: body.previousSlug ?? null,
    tags: plan.tags,
    paths: plan.paths,
  });
}

export function GET() {
  return NextResponse.json({ ok: false, message: "Method not allowed" }, { status: 405 });
}

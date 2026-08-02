import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { SITE_SETTINGS_TAG } from "@/sanity/lib/siteSettings";

type SanityWebhookBody = {
  _id?: string;
  _type?: string;
};

const staticSiteSettingsPaths = ["/", "/links", "/arte", "/catalogo", "/comunidad"];

const dynamicSiteSettingsPaths = [
  "/archivo/[slug]",
  "/arte/[slug]",
  "/catalogo/[slug]",
  "/personas/[slug]",
] as const;

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

  const documentType = parsed.body?._type;

  if (documentType !== SITE_SETTINGS_TAG) {
    return NextResponse.json({
      ok: true,
      revalidated: false,
      message: "Ignored document type",
      type: documentType ?? null,
    });
  }

  revalidateTag(SITE_SETTINGS_TAG, { expire: 0 });

  for (const path of staticSiteSettingsPaths) {
    revalidatePath(path);
  }

  for (const path of dynamicSiteSettingsPaths) {
    revalidatePath(path, "page");
  }

  return NextResponse.json({
    ok: true,
    revalidated: true,
    tag: SITE_SETTINGS_TAG,
    paths: [...staticSiteSettingsPaths, ...dynamicSiteSettingsPaths],
  });
}

export function GET() {
  return NextResponse.json({ ok: false, message: "Method not allowed" }, { status: 405 });
}

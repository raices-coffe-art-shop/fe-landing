import { redirect } from "next/navigation";

type LegacyTvPageProps = {
  searchParams: Promise<{
    s?: string | string[];
    animation?: string | string[];
  }>;
};

export default async function LegacyTvPage({
  searchParams,
}: LegacyTvPageProps) {
  const params = await searchParams;

  const query = new URLSearchParams();

  const seconds = Array.isArray(params.s) ? params.s[0] : params.s;
  const animation = Array.isArray(params.animation)
    ? params.animation[0]
    : params.animation;

  if (seconds) query.set("s", seconds);
  if (animation) query.set("animation", animation);

  redirect(query.size ? `/carta/tv?${query.toString()}` : "/carta/tv");
}
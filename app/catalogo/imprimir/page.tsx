import { redirect } from "next/navigation";

type LegacyPrintPageProps = { searchParams: Promise<{ fotos?: string | string[] }> };

export default async function LegacyPrintPage({ searchParams }: LegacyPrintPageProps) {
  const params = await searchParams;
  const fotos = Array.isArray(params.fotos) ? params.fotos[0] : params.fotos;
  redirect(fotos ? `/carta/imprimir?fotos=${encodeURIComponent(fotos)}` : "/carta/imprimir");
}

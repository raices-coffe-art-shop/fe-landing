type SlugValue = {
  current?: string;
};

type SlugDocument = {
  _id?: string;
  _type?: string;
};

type SlugClient = {
  fetch<T>(
    query: string,
    params?: Record<string, unknown>,
    options?: { perspective?: "raw" | "published" | "previewDrafts" },
  ): Promise<T>;
};

type SlugUniquenessContext = {
  document?: SlugDocument;
  getClient: (options: { apiVersion: string }) => SlugClient;
};

/**
 * Comprueba que un slug no lo use OTRO documento del mismo tipo.
 *
 * Sanity mantiene el documento publicado y su borrador como versiones del
 * mismo contenido. La comprobación nativa puede llegar a comparar el borrador
 * contra su propia versión publicada y marcar un falso duplicado. Esta consulta
 * excluye todas las versiones del documento que se está editando, pero sigue
 * bloqueando un slug usado por un producto/categoría realmente distinto.
 */
export async function isUniqueSlugWithinType(
  slug: SlugValue | string | undefined,
  context: SlugUniquenessContext,
): Promise<boolean> {
  const currentSlug = (typeof slug === "string" ? slug : slug?.current)?.trim();
  const documentId = context.document?._id;
  const documentType = context.document?._type;

  // Si todavía no hay suficiente información, la validación required() se
  // ocupa del campo vacío. No generamos un falso error de unicidad.
  if (!currentSlug || !documentId || !documentType) return true;

  // Un borrador se identifica como drafts.<id-publicado>. Para versiones de
  // Content Releases también quitamos el prefijo habitual versions.<release>.
  // En el uso normal del Studio será simplemente el primer replace.
  const publishedId = documentId
    .replace(/^drafts\./, "")
    .replace(/^versions\.[^.]+\./, "");

  const client = context.getClient({ apiVersion: "2025-02-19" });
  const params = {
    type: documentType,
    slug: currentSlug,
    publishedId,
  };

  // perspective: raw es importante: queremos detectar también borradores de
  // OTROS documentos. sanity::versionOf() excluye el publicado, borrador y
  // versiones del documento actual para que editarlo no choque consigo mismo.
  const query = `!defined(*[
    _type == $type &&
    slug.current == $slug &&
    !sanity::versionOf($publishedId)
  ][0]._id)`;

  const result = await client.fetch<boolean>(query, params, { perspective: "raw" });
  return result === true;
}

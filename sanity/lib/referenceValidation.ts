type ReferenceValue = {
  _ref?: string;
};

type ReferenceClient = {
  fetch<T>(
    query: string,
    params?: Record<string, unknown>,
    options?: { perspective?: "raw" | "published" | "previewDrafts" },
  ): Promise<T>;
};

type ReferenceValidationContext = {
  getClient: (options: { apiVersion: string }) => ReferenceClient;
};

export async function isExistingReference(
  value: ReferenceValue | undefined,
  context: ReferenceValidationContext,
  expectedType: string,
  fieldLabel: string,
): Promise<true | string> {
  const referenceId = value?._ref;

  if (!referenceId) return `Selecciona ${fieldLabel}.`;

  const client = context.getClient({ apiVersion: "2025-02-19" });
  const exists = await client.fetch<boolean>(
    "defined(*[_id == $id && _type == $type][0]._id)",
    { id: referenceId, type: expectedType },
    { perspective: "raw" },
  );

  return exists === true
    ? true
    : `La ${fieldLabel} seleccionada ya no existe. Elige una opción vigente antes de publicar.`;
}

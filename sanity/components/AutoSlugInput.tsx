"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { InputProps } from "sanity";
import { set, useClient, useFormValue } from "sanity";

const API_VERSION = "2025-02-19";
const MAX_SLUG_LENGTH = 96;

type SlugValue = {
  current?: string;
};

function stripVersionPrefix(documentId: string) {
  return documentId
    .replace(/^drafts\./, "")
    .replace(/^versions\.[^.]+\./, "");
}

/**
 * Convierte texto humano a un slug limpio y predecible.
 * Ej.: "Café de Ayacucho" -> "cafe-de-ayacucho"
 */
function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/&/g, " y ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");
}

function isCleanSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= MAX_SLUG_LENGTH;
}

export function AutoSlugInput(props: InputProps) {
  const { onChange, readOnly } = props;
  const client = useClient({ apiVersion: API_VERSION });
  const documentValue = useFormValue([]) as
    | { _id?: string; _type?: string; title?: string }
    | null;

  const title = typeof documentValue?.title === "string" ? documentValue.title.trim() : "";
  const documentId = typeof documentValue?._id === "string" ? documentValue._id : "";
  const documentType = typeof documentValue?._type === "string" ? documentValue._type : "";
  const currentSlug = ((props.value as SlugValue | undefined)?.current || "").trim();

  const [publishedExists, setPublishedExists] = useState<boolean | null>(null);
  const [status, setStatus] = useState<"idle" | "generating" | "ready" | "error">("idle");
  const [message, setMessage] = useState("");
  const requestRef = useRef(0);

  const publishedId = useMemo(
    () => (documentId ? stripVersionPrefix(documentId) : ""),
    [documentId],
  );

  // Saber si el documento ya fue publicado nos permite mantener URLs estables:
  // - antes de publicar: el slug sigue automáticamente al título;
  // - después de publicar: se conserva, salvo que sea un valor antiguo inválido.
  useEffect(() => {
    let cancelled = false;

    if (!publishedId) {
      setPublishedExists(false);
      return;
    }

    setPublishedExists(null);
    client
      .fetch<boolean>("defined(*[_id == $id][0]._id)", { id: publishedId }, { perspective: "raw" })
      .then((exists) => {
        if (!cancelled) setPublishedExists(Boolean(exists));
      })
      .catch(() => {
        if (!cancelled) setPublishedExists(null);
      });

    return () => {
      cancelled = true;
    };
  }, [client, publishedId]);

  useEffect(() => {
    if (readOnly || !documentId || !documentType || publishedExists === null) return;

    const titleSlug = slugify(title);
    const normalizedCurrent = slugify(currentSlug);

    // En documentos ya publicados, no cambiamos una URL válida solo porque cambie el título.
    // Sí corregimos automáticamente slugs heredados inválidos como "/test" o "hola mundo".
    if (publishedExists && currentSlug && isCleanSlug(currentSlug)) {
      setStatus("ready");
      setMessage("Dirección estable. Se conserva aunque cambie el título.");
      return;
    }

    const base = publishedExists
      ? normalizedCurrent || titleSlug
      : titleSlug;

    if (!base) {
      setStatus("idle");
      setMessage("Escribe primero el título. La dirección se creará sola.");
      return;
    }

    const requestId = ++requestRef.current;
    setStatus("generating");
    setMessage("Generando una dirección web disponible…");

    const chooseUniqueSlug = async () => {
      const query = `*[
        _type == $type &&
        defined(slug.current) &&
        !sanity::versionOf($publishedId)
      ].slug.current`;

      const used = await client.fetch<string[]>(
        query,
        { type: documentType, publishedId },
        { perspective: "raw" },
      );

      const usedSet = new Set((used || []).map((slug) => slug.trim()).filter(Boolean));
      let candidate = base;
      let suffix = 2;

      while (usedSet.has(candidate)) {
        const suffixText = `-${suffix}`;
        const trimmedBase = base
          .slice(0, Math.max(1, MAX_SLUG_LENGTH - suffixText.length))
          .replace(/-+$/g, "");
        candidate = `${trimmedBase}${suffixText}`;
        suffix += 1;
      }

      return candidate;
    };

    chooseUniqueSlug()
      .then((nextSlug) => {
        if (requestRef.current !== requestId) return;

        if (currentSlug !== nextSlug) {
          onChange(set({ current: nextSlug }));
        }

        setStatus("ready");
        setMessage("Generada automáticamente. No necesitas editarla.");
      })
      .catch(() => {
        if (requestRef.current !== requestId) return;
        setStatus("error");
        setMessage("No se pudo comprobar la dirección. Revisa tu conexión e inténtalo de nuevo.");
      });
  }, [
    client,
    currentSlug,
    documentId,
    documentType,
    publishedExists,
    publishedId,
    onChange,
    readOnly,
    title,
  ]);

  const routePrefixByType: Record<string, string> = {
    catalogItem: "/catalogo",
    post: "/publicaciones",
  };
  const routePrefix = documentType ? routePrefixByType[documentType] : undefined;
  const displayPath = currentSlug
    ? `${routePrefix ?? ""}/${currentSlug}`
    : "Se generará automáticamente";

  return (
    <div
      aria-live="polite"
      style={{
        border: "1px solid rgba(127, 127, 127, 0.28)",
        borderRadius: 8,
        padding: "11px 12px",
        background: "rgba(127, 127, 127, 0.06)",
      }}
    >
      <div
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          fontSize: 13,
          lineHeight: 1.45,
          overflowWrap: "anywhere",
        }}
      >
        {displayPath}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 12,
          lineHeight: 1.45,
          opacity: status === "error" ? 1 : 0.72,
          color: status === "error" ? "#c94a4a" : "inherit",
        }}
      >
        {message || "La dirección se crea sola a partir del título."}
      </div>
    </div>
  );
}

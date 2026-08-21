"use client";

import { useId, useState } from "react";
import type { FieldProps } from "sanity";

/**
 * Campo global de ayuda para Sanity Studio.
 *
 * - Mantiene el input nativo de Sanity (validaciones, referencias, imágenes, etc.).
 * - Sustituye la descripción siempre visible por un botón de información.
 * - Funciona en documentos y objetos anidados (por ejemplo SEO y redes sociales).
 */
export function StudioHelpField(props: FieldProps) {
  const [open, setOpen] = useState(false);
  const helpId = useId();
  const { description, title, ...defaultProps } = props;
  const helpText = typeof description === "string" ? description.trim() : "";

  // Los campos internos que Sanity crea sin título legible se dejan intactos.
  if (!title) return props.renderDefault(props);

  return (
    <div style={{ marginBottom: 2 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 8,
        }}
      >
        <label
          htmlFor={props.inputId}
          style={{
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1.35,
            color: "inherit",
          }}
        >
          {title}
        </label>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={helpId}
          aria-label={`Ver ayuda de ${title}`}
          title={`¿Qué significa “${title}”?`}
          style={{
            width: 26,
            height: 26,
            minWidth: 26,
            borderRadius: 999,
            border: "1px solid rgba(196, 148, 73, 0.7)",
            background: open ? "#C49449" : "transparent",
            color: open ? "#2B211C" : "#C49449",
            fontSize: 14,
            fontWeight: 800,
            lineHeight: "24px",
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          i
        </button>
      </div>

      {open && (
        <div
          id={helpId}
          role="note"
          style={{
            marginBottom: 10,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid rgba(196, 148, 73, 0.35)",
            background: "rgba(196, 148, 73, 0.10)",
            fontSize: 12,
            lineHeight: 1.55,
          }}
        >
          {helpText || `Aquí se completa “${title}”. Usa información clara y real del negocio.`}
        </div>
      )}

      {props.renderDefault({
        ...defaultProps,
        title: undefined,
        description: undefined,
      } as FieldProps)}
    </div>
  );
}

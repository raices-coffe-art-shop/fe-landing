"use client";

import type { CSSProperties } from "react";
import type { BooleanInputProps } from "sanity";
import { PatchEvent, set } from "sanity";

/**
 * Selector Sí / No para booleanos del Studio.
 *
 * Sanity bloquea correctamente la publicación cuando un booleano requerido
 * está vacío, pero un input personalizado no recibe automáticamente el borde
 * rojo visual del input nativo. Por eso señalamos aquí el estado indefinido
 * de forma explícita y accesible.
 */
export function YesNoBooleanInput(props: BooleanInputProps) {
  const { value, onChange, readOnly } = props;
  const missing = value !== true && value !== false;

  const choose = (nextValue: boolean) => {
    if (readOnly) return;
    onChange(PatchEvent.from(set(nextValue)));
  };

  const optionStyle = (selected: boolean): CSSProperties => ({
    flex: 1,
    minHeight: 38,
    borderRadius: 7,
    border: selected
      ? "1px solid #C49449"
      : missing
        ? "1px solid rgba(240, 82, 82, 0.72)"
        : "1px solid rgba(127, 127, 127, 0.35)",
    background: selected ? "rgba(196, 148, 73, 0.16)" : "transparent",
    color: "inherit",
    fontWeight: selected ? 700 : 500,
    cursor: readOnly ? "not-allowed" : "pointer",
    opacity: readOnly ? 0.6 : 1,
  });

  return (
    <div>
      <div
        role="radiogroup"
        aria-label={props.schemaType.title || "Seleccionar sí o no"}
        aria-invalid={missing || undefined}
        style={{
          display: "flex",
          gap: 8,
          borderRadius: 9,
          outline: missing ? "2px solid rgba(240, 82, 82, 0.8)" : "none",
          outlineOffset: missing ? 2 : 0,
        }}
      >
        <button
          type="button"
          role="radio"
          aria-checked={value === true}
          id={props.id}
          disabled={readOnly}
          onFocus={props.elementProps.onFocus}
          onBlur={props.elementProps.onBlur}
          onClick={() => choose(true)}
          style={optionStyle(value === true)}
        >
          Sí
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={value === false}
          disabled={readOnly}
          onFocus={props.elementProps.onFocus}
          onBlur={props.elementProps.onBlur}
          onClick={() => choose(false)}
          style={optionStyle(value === false)}
        >
          No
        </button>
      </div>

      {missing && (
        <div
          role="alert"
          style={{
            marginTop: 8,
            color: "#f05252",
            fontSize: 12,
            fontWeight: 600,
            lineHeight: 1.45,
          }}
        >
          Debes seleccionar Sí o No antes de publicar.
        </div>
      )}
    </div>
  );
}

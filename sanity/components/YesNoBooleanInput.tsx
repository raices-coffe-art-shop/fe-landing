"use client";

import type { CSSProperties } from "react";
import type { BooleanInputProps } from "sanity";
import { PatchEvent, set } from "sanity";

export function YesNoBooleanInput(props: BooleanInputProps) {
  const { value, onChange, readOnly } = props;

  const choose = (nextValue: boolean) => {
    if (readOnly) return;
    onChange(PatchEvent.from(set(nextValue)));
  };

  const optionStyle = (selected: boolean): CSSProperties => ({
    flex: 1,
    minHeight: 38,
    borderRadius: 7,
    border: selected ? "1px solid #C49449" : "1px solid rgba(127, 127, 127, 0.35)",
    background: selected ? "rgba(196, 148, 73, 0.16)" : "transparent",
    color: "inherit",
    fontWeight: selected ? 700 : 500,
    cursor: readOnly ? "not-allowed" : "pointer",
    opacity: readOnly ? 0.6 : 1,
  });

  return (
    <div
      role="radiogroup"
      aria-label={props.schemaType.title || "Seleccionar sí o no"}
      style={{ display: "flex", gap: 8 }}
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
  );
}

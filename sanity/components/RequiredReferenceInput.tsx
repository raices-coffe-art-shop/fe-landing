"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { InputProps } from "sanity";
import { useClient } from "sanity";

type ReferenceValue = {
  _ref?: string;
};

type RequiredReferenceInputProps = InputProps & {
  value?: ReferenceValue;
  renderDefault: (props: InputProps) => ReactNode;
};

const API_VERSION = "2025-02-19";

export function RequiredReferenceInput(props: RequiredReferenceInputProps) {
  const client = useClient({ apiVersion: API_VERSION });
  const referenceId = props.value?._ref;
  const [referenceExists, setReferenceExists] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!referenceId) {
      setReferenceExists(false);
      return;
    }

    setReferenceExists(null);
    client
      .fetch<boolean>("defined(*[_id == $id][0]._id)", { id: referenceId }, { perspective: "raw" })
      .then((exists) => {
        if (!cancelled) setReferenceExists(Boolean(exists));
      })
      .catch(() => {
        if (!cancelled) setReferenceExists(null);
      });

    return () => {
      cancelled = true;
    };
  }, [client, referenceId]);

  const hasProblem = referenceExists === false;

  return (
    <div>
      {props.renderDefault(props)}

      {hasProblem && (
        <div
          role="alert"
          style={{
            marginTop: 8,
            border: "1px solid rgba(240, 82, 82, 0.72)",
            borderRadius: 7,
            padding: "9px 10px",
            background: "rgba(240, 82, 82, 0.1)",
            color: "#f05252",
            fontSize: 12,
            fontWeight: 700,
            lineHeight: 1.45,
          }}
        >
          Esta referencia no esta guardada o apunta a una categoria eliminada. Elige una categoria vigente antes de publicar.
        </div>
      )}
    </div>
  );
}

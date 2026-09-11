"use client";

import { useState } from "react";
import styles from "./carta.module.css";

type PrintActionsProps = {
  withPhotos: boolean;
};

// Las fotos llegan del CDN de Sanity: si el diálogo de impresión se abre antes
// de que terminen de decodificarse, la hoja sale con huecos en blanco.
const IMAGE_WAIT_TIMEOUT_MS = 5000;

async function waitForImages() {
  const pending = [...document.images].map((image) => image.decode().catch(() => undefined));
  // Si el CDN no responde, el diálogo se abre igual en lugar de dejar el botón colgado.
  await Promise.race([
    Promise.all(pending),
    new Promise((resolve) => window.setTimeout(resolve, IMAGE_WAIT_TIMEOUT_MS)),
  ]);
}

export function PrintActions({ withPhotos }: PrintActionsProps) {
  const [preparing, setPreparing] = useState(false);

  const handlePrint = async () => {
    setPreparing(true);
    try {
      await waitForImages();
      window.print();
    } finally {
      setPreparing(false);
    }
  };

  return (
    <div className={styles.printActions}>
      <a className={styles.printToggle} href={withPhotos ? "?fotos=no" : "?fotos=si"}>
        {withPhotos ? "Ver sin fotos" : "Ver con fotos"}
      </a>
      <button type="button" className={styles.printButton} onClick={handlePrint} disabled={preparing}>
        {preparing ? "Preparando…" : "Descargar PDF"}
      </button>
    </div>
  );
}

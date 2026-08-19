"use client";

import styles from "./imprimir.module.css";

export function PrintActions() {
  return (
    <button type="button" className={styles.printButton} onClick={() => window.print()}>
      Descargar PDF
    </button>
  );
}

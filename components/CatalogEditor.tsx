"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { products } from "@/data/site";
import { contactChannels } from "@/data/social";
import { EditorialImage } from "./EditorialImage";

const STORAGE_KEY = "raices-catalogo-demo-v1";
const filters = ["Todo", "Café y cacao", "Alimentos", "Arte"];

const defaultPrices: Record<string, string> = {
  "Café preparado": "12.00",
  "Granos de café": "38.00",
  "Café molido": "38.00",
  "Cacao": "32.00",
  "Chocolate con panela": "18.00",
  "Miel": "28.00",
  "Polen": "24.00",
  "Arándanos": "18.00",
  "Mermeladas": "22.00",
  "Pan chapla": "6.00",
  "Postres": "12.00",
  "Queso": "26.00",
  "Cuadros de Lized": "120.00",
  "Retablos": "120.00",
  "Toritos de Ayacucho": "45.00",
  "Manualidades": "35.00"
};

type CatalogItem = {
  id: string;
  name: string;
  category: string;
  region: string;
  note: string;
  procedencia: string;
  subcategory: string;
  tone: string;
  image: string;
  price: string;
};

const seed: CatalogItem[] = products.map((product) => ({
  id: product.name,
  name: product.name,
  category: product.category,
  region: product.region,
  procedencia: product.procedencia,
  subcategory: product.subcategory,
  note: product.note,
  tone: product.tone,
  image: product.image,
  price: defaultPrices[product.name] ?? "0.00"
}));

function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1000;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function CatalogEditor() {
  const [items, setItems] = useState<CatalogItem[]>(seed);
  const [filter, setFilter] = useState("Todo");
  const [editing, setEditing] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: CatalogItem[] = JSON.parse(saved);
        setItems(seed.map((item) => parsed.find((p) => p.id === item.id) ?? item));
      }
    } catch {
      // Si el contenido guardado no es válido, se mantiene el catálogo base.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // El almacenamiento puede llenarse con fotos muy pesadas; la demo sigue funcionando en memoria.
    }
  }, [items, hydrated]);

  const filtered = useMemo(
    () => (filter === "Todo" ? items : items.filter((item) => item.category === filter)),
    [items, filter]
  );

  const update = (id: string, patch: Partial<CatalogItem>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const handlePhoto = async (id: string, file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await readImageAsDataUrl(file);
      update(id, { image: dataUrl });
    } catch {
      // Si la imagen no puede leerse, se conserva la actual.
    }
  };

  const reset = () => {
    setItems(seed);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <>
      <section className="catalogo-hero">
        <div className="catalogo-hero-pattern" aria-hidden="true" />
        <div className="page-shell">
          <p className="eyebrow light">Catálogo</p>
          <h1>Productos con nombre, procedencia y una historia detrás.</h1>
          <p className="catalogo-hero-note">
            Explora cafés, alimentos, postres, pinturas y piezas seleccionadas. Cada ficha indica qué es, de dónde viene, quién está relacionado con su elaboración y cómo puedes conseguirlo.
          </p>
        </div>
      </section>

      <section className="catalogo-editor-section">
        <div className="editor-bar page-shell">
          <div className="editor-bar-copy">
            <span className={`editor-dot ${editing ? "is-on" : ""}`} aria-hidden="true" />
            <p>{editing ? "Edita precio, descripción o fotografía." : "Consulta productos disponibles y sus procedencias."}</p>
          </div>
          <div className="editor-bar-actions">
            {editing && (
              <button className="editor-reset" onClick={reset}>
                Restaurar original
              </button>
            )}
            <button className={`edit-toggle ${editing ? "is-active" : ""}`} onClick={() => setEditing(!editing)} aria-pressed={editing}>
              {editing ? "Terminar edición" : "Editar catálogo"}
            </button>
          </div>
        </div>

        <div className="catalog-filters page-shell" role="group" aria-label="Filtrar productos">
          {filters.map((item) => (
            <button key={item} className={filter === item ? "is-active" : ""} onClick={() => setFilter(item)} aria-pressed={filter === item}>
              {item}
            </button>
          ))}
        </div>

        <div className="catalog-rail page-shell">
          {filtered.map((product, index) => (
            <article key={product.id} className={`product-card tone-${product.tone} ${editing ? "is-editing" : ""}`}>
              <div className="product-image">
                <EditorialImage src={product.image} alt={product.name} position={index === 0 ? "center 62%" : "center"} />
                <span className="product-number">0{index + 1}</span>
                {editing && (
                  <>
                    <button className="photo-edit-button" onClick={() => fileInputs.current[product.id]?.click()}>
                      Cambiar foto
                    </button>
                    <input
                      ref={(node) => {
                        fileInputs.current[product.id] = node;
                      }}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(event) => {
                        handlePhoto(product.id, event.target.files?.[0]);
                        event.target.value = "";
                      }}
                    />
                  </>
                )}
              </div>
              <div className="product-copy">
                <div>
                  <span>{product.category}</span>
                  <span>{product.procedencia}</span>
                </div>
                <p className="product-subcategory">{product.subcategory}</p>
                {editing ? (
                  <input
                    className="edit-field edit-name"
                    value={product.name}
                    onChange={(event) => update(product.id, { name: event.target.value })}
                    aria-label={`Nombre de ${product.name}`}
                  />
                ) : (
                  <h3>{product.name}</h3>
                )}
                {editing ? (
                  <input
                    className="edit-field edit-note"
                    value={product.note}
                    onChange={(event) => update(product.id, { note: event.target.value })}
                    aria-label={`Nota de ${product.name}`}
                  />
                ) : (
                  <p>{product.note}</p>
                )}
                <div className="product-price-row">
                  <span>Precio referencial</span>
                  {editing ? (
                    <span className="price-edit">
                      S/
                      <input
                        className="edit-field edit-price"
                        value={product.price}
                        inputMode="decimal"
                        onChange={(event) => update(product.id, { price: event.target.value })}
                        aria-label={`Precio de ${product.name}`}
                      />
                    </span>
                  ) : (
                    <strong>S/ {product.price}</strong>
                  )}
                </div>
                <a
                  href={`${contactChannels.whatsappHref}?text=${encodeURIComponent(
                    `Hola, quisiera consultar por ${product.name} (S/ ${product.price}).`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Consultar <span>↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

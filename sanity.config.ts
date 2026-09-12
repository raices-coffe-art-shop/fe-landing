"use client";

import { createElement } from "react";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemaTypes";
import { StudioHelpField } from "./sanity/components/StudioHelpField";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const structureApiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-02";

if (!projectId) throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
if (!dataset) throw new Error("Missing NEXT_PUBLIC_SANITY_DATASET");

const hiddenRootTypes = new Set([
  "siteSettings",
  "menuItem",
  "menuCategory",
  "catalogItem",
  "catalogCategory",
  "artItem",
  "artCategory",
  "socialLink",
  "seo",
  "post",
]);

function studioIcon(symbol: string) {
  return function StudioIcon() {
    return createElement("span", { "aria-hidden": true, style: { fontSize: "1.05rem", lineHeight: 1 } }, symbol);
  };
}

const CartaIcon = studioIcon("☕");
const CartaCategoryIcon = studioIcon("▦");
const ProductsIcon = studioIcon("◈");
const ProductsCategoryIcon = studioIcon("◇");
const ArtIcon = studioIcon("✦");
const ArtCategoryIcon = studioIcon("◌");
const PostsIcon = studioIcon("▤");
const SettingsIcon = studioIcon("⚙");

export default defineConfig({
  name: "default",
  title: "Raíces — Café y Cultura",
  basePath: "/studio",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Contenido de Raíces")
          .items([
            S.listItem()
              .id("menu")
              .title("Carta")
              .icon(CartaIcon)
              .child(
                S.list()
                  .title("Carta")
                  .items([
                    S.documentTypeListItem("menuItem").title("Elementos de la Carta").icon(CartaIcon),
                    S.documentTypeListItem("menuCategory").title("Categorías de la Carta").icon(CartaCategoryIcon),
                  ]),
              ),
            S.listItem()
              .id("productsOfOrigin")
              .title("Productos de Origen")
              .icon(ProductsIcon)
              .child(
                S.list()
                  .title("Productos de Origen")
                  .items([
                    S.listItem()
                      .title("Productos")
                      .icon(ProductsIcon)
                      .child(
                        S.documentList()
                          .title("Productos")
                          .schemaType("catalogItem")
                          .apiVersion(structureApiVersion)
                          .filter('_type == "catalogItem" && !defined(migrationDestination) && category->slug.current != "arte"'),
                      ),
                    S.listItem()
                      .title("Categorías")
                      .icon(ProductsCategoryIcon)
                      .child(
                        S.documentList()
                          .title("Categorías")
                          .schemaType("catalogCategory")
                          .apiVersion(structureApiVersion)
                          .filter('_type == "catalogCategory" && slug.current != "arte" && !(slug.current in *[_type == "menuCategory"].slug.current)'),
                      ),
                  ]),
              ),
            S.listItem()
              .id("artGallery")
              .title("Galería de Arte")
              .icon(ArtIcon)
              .child(
                S.list()
                  .title("Galería de Arte")
                  .items([
                    S.documentTypeListItem("artItem").title("Piezas").icon(ArtIcon),
                    S.documentTypeListItem("artCategory").title("Categorías").icon(ArtCategoryIcon),
                  ]),
              ),
            S.divider(),
            S.listItem()
              .id("posts")
              .title("Publicaciones")
              .icon(PostsIcon)
              .schemaType("post")
              .child(S.documentTypeList("post").title("Publicaciones")),
            S.listItem()
              .id("siteSettings")
              .title("Configuración del sitio")
              .icon(SettingsIcon)
              .schemaType("siteSettings")
              .child(
                S.document()
                  .id("siteSettings")
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
                  .title("Configuración del sitio"),
              ),
            ...S.documentTypeListItems().filter((item) => {
              const id = item.getId();
              return id ? !hiddenRootTypes.has(id) : true;
            }),
          ]),
    }),
  ],
  form: {
    components: {
      field: StudioHelpField,
    },
  },
  document: {
    actions: (previous, context) =>
      context.schemaType === "siteSettings"
        ? previous.filter(({ action }) => action !== "delete" && action !== "duplicate")
        : previous,
  },
  schema: {
    types: schemaTypes,
    templates: (previous) => previous.filter((template) => template.id !== "siteSettings"),
  },
});

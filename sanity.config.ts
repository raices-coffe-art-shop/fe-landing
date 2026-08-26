"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemaTypes";
import { StudioHelpField } from "./sanity/components/StudioHelpField";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

if (!projectId) throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
if (!dataset) throw new Error("Missing NEXT_PUBLIC_SANITY_DATASET");

const hiddenRootTypes = new Set(["siteSettings", "catalogItem", "catalogCategory", "socialLink", "seo", "post"]);

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
          .title("Contenido")
          .items([
            S.listItem()
              .id("siteSettings")
              .title("Configuración del sitio")
              .schemaType("siteSettings")
              .child(
                S.document()
                  .id("siteSettings")
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
                  .title("Configuración del sitio"),
              ),
            S.divider(),
            S.listItem()
              .id("catalog")
              .title("Catálogo")
              .child(
                S.list()
                  .title("Catálogo")
                  .items([
                    S.documentTypeListItem("catalogItem").title("Productos"),
                    S.documentTypeListItem("catalogCategory").title("Categorías"),
                  ]),
              ),
            S.listItem()
              .id("posts")
              .title("Publicaciones")
              .schemaType("post")
              .child(S.documentTypeList("post").title("Publicaciones")),
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

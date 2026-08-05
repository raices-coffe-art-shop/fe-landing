import "server-only";

import { createClient } from "next-sanity";

export const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
export const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
export const sanityApiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-08-02";

// El proyecto ya utiliza SANITY_API_WRITE_TOKEN para la migración. Ese mismo
// token también puede leer un dataset privado desde componentes de servidor.
// Nunca debe llevar NEXT_PUBLIC_ ni importarse desde Client Components.
export const sanityServerToken = process.env.SANITY_API_WRITE_TOKEN;

export const hasSanityConfig = Boolean(sanityProjectId && sanityDataset);

export const sanityClient = hasSanityConfig
  ? createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: sanityApiVersion,
      useCdn: false,
      perspective: "published",
      stega: false,
      token: sanityServerToken || undefined,
    })
  : null;

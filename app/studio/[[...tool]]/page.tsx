import type { Metadata } from "next";
import { NextStudio } from "next-sanity/studio";
import { metadata as studioMetadata, viewport } from "next-sanity/studio";
import config from "../../../sanity.config";

export const metadata: Metadata = {
  ...studioMetadata,
  robots: { index: false, follow: false },
};
export { viewport };

export default function StudioPage() {
  return <NextStudio config={config} />;
}

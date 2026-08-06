import process from "node:process";
import { createRequire } from "node:module";
import { createClient } from "next-sanity";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env");
loadEnvConfig(process.cwd());

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-02";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) throw new Error("Falta NEXT_PUBLIC_SANITY_PROJECT_ID.");
if (!token) throw new Error("Falta SANITY_API_WRITE_TOKEN para actualizar las redes oficiales.");

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

const officialLinks = [
  {
    _type: "socialLink",
    _key: "whatsapp",
    platform: "whatsapp",
    label: "WhatsApp",
    url: "https://wa.me/51915123159",
    isVisible: true,
    order: 10,
  },
  {
    _type: "socialLink",
    _key: "instagram",
    platform: "instagram",
    label: "Instagram",
    url: "https://www.instagram.com/raicescoffeeartshop/",
    isVisible: true,
    order: 30,
  },
  {
    _type: "socialLink",
    _key: "facebook",
    platform: "facebook",
    label: "Facebook",
    url: "https://www.facebook.com/profile.php?id=100089073728506&locale=es_LA",
    isVisible: true,
    order: 40,
  },
];

const current = await client.fetch(`*[_type == "siteSettings" && _id == "siteSettings"][0]{socialLinks}`);
const existing = Array.isArray(current?.socialLinks) ? current.socialLinks : [];
const officialByPlatform = new Map(officialLinks.map((link) => [link.platform, link]));
const kept = existing.filter((link) => !officialByPlatform.has(link?.platform));
const nextSocialLinks = [...kept, ...officialLinks].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

await client.patch("siteSettings").set({ socialLinks: nextSocialLinks }).commit();

console.log("Redes oficiales actualizadas en siteSettings:");
for (const link of officialLinks) console.log(`- ${link.label}: ${link.url}`);
console.log("Footer, /links y navbar consumirán estos mismos enlaces al publicarse/revalidarse.");

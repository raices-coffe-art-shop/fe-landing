import { fallbackCatalogItems } from "./catalogFallback";

export const products = fallbackCatalogItems.map((item) => ({
	name: item.title,
	category: item.category.title,
	region: item.region ?? item.origin,
	procedencia: item.origin,
	subcategory: item.subcategory ?? item.category.title,
	note: item.shortDescription,
	image: item.mainImage.src,
}));

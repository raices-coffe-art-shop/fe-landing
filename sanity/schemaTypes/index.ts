import { artCategory } from "./artCategory";
import { artItem } from "./artItem";
import { catalogCategory } from "./catalogCategory";
import { catalogItem } from "./catalogItem";
import { menuCategory } from "./menuCategory";
import { menuItem } from "./menuItem";
import { post } from "./post";
import { seo } from "./seo";
import { siteSettings } from "./siteSettings";
import { socialLink } from "./socialLink";

export const schemaTypes = [
  socialLink,
  seo,
  siteSettings,
  menuCategory,
  menuItem,
  catalogCategory,
  catalogItem,
  artCategory,
  artItem,
  post,
];

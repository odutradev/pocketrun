import type { BrandContext } from "@utils/types/brand";

export type DocGroupId = "general" | "kv" | "pages" | "links" | "admin";

export interface DocGroup {
  id: DocGroupId;
  label: string;
  context: BrandContext;
}

export interface DocSectionEntry {
  id: string;
  label: string;
  group: DocGroupId;
}

export interface NumberedDocSection extends DocSectionEntry {
  number: string;
}

export interface DocTocGroup extends DocGroup {
  sections: NumberedDocSection[];
}

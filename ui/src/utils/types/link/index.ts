import type { linkFormSchema, linkGroupSchema } from "@utils/validations/link";
import type { z } from "zod";

export type LinkMode = "active" | "inactive" | "period" | "clicks";

export type LinkState = "active" | "inactive" | "scheduled" | "expired" | "exhausted";

export type SlugUnavailableReason = "invalid" | "reserved" | "taken";

export interface Link {
  id: string;
  title: string;
  slug: string;
  url: string;
  groupId: string | null;
  mode: LinkMode;
  startsAt: string | null;
  endsAt: string | null;
  maxClicks: number | null;
  clicks: number;
  state: LinkState;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinkGroup {
  id: string;
  kind: "links";
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface SlugAvailability {
  slug: string;
  isAvailable: boolean;
  reason?: SlugUnavailableReason;
}

export interface LinkPayload {
  title: string;
  slug: string;
  url: string;
  groupId: string;
  mode: LinkMode;
  startsAt: string | null;
  endsAt: string | null;
  maxClicks: number | null;
}

export type LinkFormValues = z.infer<typeof linkFormSchema>;
export type LinkGroupValues = z.infer<typeof linkGroupSchema>;

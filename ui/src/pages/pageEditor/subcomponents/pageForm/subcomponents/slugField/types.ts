import type { SlugUnavailableReason } from "@utils/types/sitePage";

export type SlugStatus = "idle" | "checking" | "available" | "unavailable" | "failed";

export interface SlugCheck {
  status: SlugStatus;
  reason?: SlugUnavailableReason;
}

export interface SlugFieldProps {
  value: string;
  pageId?: string;
  error?: string;
  onChange: (value: string) => void;
  onCheckChange: (check: SlugCheck) => void;
}

import type { SlugUnavailableReason } from "@utils/types/link";

export type SlugStatus = "idle" | "checking" | "available" | "unavailable" | "failed";

export interface SlugCheck {
  status: SlugStatus;
  reason?: SlugUnavailableReason;
}

export interface SlugFieldProps {
  value: string;
  linkId?: string;
  error?: string;
  onChange: (value: string) => void;
  onCheckChange: (check: SlugCheck) => void;
}

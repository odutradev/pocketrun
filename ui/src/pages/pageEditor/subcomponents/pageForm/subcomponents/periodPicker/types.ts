import type { PeriodPreset } from "@utils/types/sitePage";

export interface PeriodPickerProps {
  startsAt: string;
  endsAt: string;
  initialPreset: PeriodPreset;
  startsAtError?: string;
  endsAtError?: string;
  onChange: (period: { startsAt: string; endsAt: string }) => void;
}

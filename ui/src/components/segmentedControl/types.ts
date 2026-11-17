import type { ReactNode } from "react";

export interface SegmentedOption<TValue extends string> {
  value: TValue;
  label: string;
  icon?: ReactNode;
}

export interface SegmentedControlProps<TValue extends string> {
  label: string;
  options: SegmentedOption<TValue>[];
  value: TValue;
  onValueChange: (value: TValue) => void;
  isFullWidth?: boolean;
  isIconOnly?: boolean;
  mobileColumns?: number;
}

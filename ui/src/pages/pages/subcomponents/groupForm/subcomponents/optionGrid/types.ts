import type { ReactNode } from "react";

export interface OptionGridItem<TValue extends string> {
  value: TValue;
  label: string;
  content: ReactNode;
}

export interface OptionGridProps<TValue extends string> {
  label: string;
  name: string;
  options: OptionGridItem<TValue>[];
  value: TValue;
  onValueChange: (value: TValue) => void;
}

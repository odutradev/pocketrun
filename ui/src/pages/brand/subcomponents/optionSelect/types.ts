import type { BrandOption } from "@utils/types/brand";

export interface OptionSelectProps<T extends string | number> {
  label: string;
  value: T;
  options: BrandOption<T>[];
  onChange: (value: T) => void;
}

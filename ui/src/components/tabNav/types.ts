export interface TabNavItem<TValue extends string> {
  value: TValue;
  label: string;
  count?: number;
  isDanger?: boolean;
}

export interface TabNavProps<TValue extends string> {
  label: string;
  idPrefix: string;
  items: TabNavItem<TValue>[];
  value: TValue;
  onValueChange: (value: TValue) => void;
}

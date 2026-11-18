import type { InputHTMLAttributes, ReactNode } from "react";

export interface PinInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "size" | "maxLength" | "type" | "prefix"> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  length?: number;
  hint?: ReactNode;
  error?: string;
}

export interface PinBoxStyleProps {
  $isActive: boolean;
  $hasError: boolean;
}

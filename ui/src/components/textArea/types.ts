import type { TextArea } from "@radix-ui/themes";
import type { ComponentProps } from "react";

export interface TextAreaProps extends ComponentProps<typeof TextArea> {
  label: string;
  hint?: React.ReactNode;
  error?: string;
}

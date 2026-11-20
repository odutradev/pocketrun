import type { CodeLanguage } from "@utils/types/code";

export interface CodeBlockProps {
  code: string;
  language?: CodeLanguage;
  title?: string;
  isCopyable?: boolean;
  maxHeight?: string;
}

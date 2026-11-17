export type CodeLanguage = "json" | "text";

export type CodeTokenKind = "key" | "string" | "literal" | "plain";

export interface CodeToken {
  kind: CodeTokenKind;
  text: string;
}

export interface CodeBlockProps {
  code: string;
  language?: CodeLanguage;
  title?: string;
  isCopyable?: boolean;
  maxHeight?: string;
}

export type CodeLanguage = "json" | "text";

export type CodeTokenKind = "key" | "string" | "literal" | "plain";

export interface CodeToken {
  kind: CodeTokenKind;
  text: string;
}

export interface CodeBlockProps {
  code: string;
  // "json" destaca chaves, textos e literais.
  language?: CodeLanguage;
  title?: string;
  isCopyable?: boolean;
  maxHeight?: string;
}

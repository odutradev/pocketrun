export type CodeLanguage = "json" | "javascript" | "text";

export type CodeTokenKind = "key" | "string" | "number" | "literal" | "keyword" | "function" | "comment" | "punctuation" | "plain";

export interface CodeToken {
  kind: CodeTokenKind;
  text: string;
}

export interface CodeLine {
  indent: number;
  tokens: CodeToken[];
}

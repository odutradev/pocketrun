import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";

import Button from "@components/button";
import useClipboard from "@hooks/useClipboard";

import { Container, Header, Pre, Title, Token } from "./styles";
import type { CodeBlockProps, CodeToken } from "./types";

const jsonTokenPattern = /("(?:\\.|[^"\\])*"(?:\s*:)?|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/;

const toJsonTokens = (code: string): CodeToken[] =>
  code
    .split(new RegExp(jsonTokenPattern, "g"))
    .map((text, index): CodeToken => {
      if (index % 2 === 0) return { kind: "plain", text };
      if (!text.startsWith('"')) return { kind: "literal", text };
      return { kind: text.trimEnd().endsWith(":") ? "key" : "string", text };
    })
    .filter((token) => token.text.length > 0);

const CodeBlock = ({ code, language = "text", title, isCopyable = false, maxHeight }: CodeBlockProps) => {
  const { copy, isCopied } = useClipboard();
  const hasHeader = Boolean(title) || isCopyable;

  return (
    <Container>
      {hasHeader && (
        <Header>
          <Title>{title}</Title>
          {isCopyable && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={isCopied() ? <CheckIcon /> : <CopyIcon />}
              onClick={() => copy(code)}
              aria-label={title ? `Copiar ${title}` : "Copiar código"}
            >
              {isCopied() ? "Copiado" : "Copiar"}
            </Button>
          )}
        </Header>
      )}
      <Pre $maxHeight={maxHeight} tabIndex={0}>
        {language === "json"
          ? toJsonTokens(code).map((token, index) => (
              <Token key={`${index}-${token.text}`} $kind={token.kind}>
                {token.text}
              </Token>
            ))
          : code}
      </Pre>
    </Container>
  );
};

export default CodeBlock;

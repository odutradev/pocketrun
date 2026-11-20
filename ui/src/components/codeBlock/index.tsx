import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";

import { Container, Header, Line, Pre, Title, Token } from "./styles";
import useClipboard from "@hooks/useClipboard";
import { toCodeLines } from "@utils/functions";
import Button from "@components/button";

import type { CodeBlockProps } from "./types";

const CodeBlock = ({ code, language = "javascript", title, isCopyable = false, maxHeight }: CodeBlockProps) => {
  const { copy, isCopied } = useClipboard();
  const hasHeader = Boolean(title) || isCopyable;
  const lines = toCodeLines(code, language);

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
        {lines.map((line, lineIndex) => (
          <Line key={lineIndex} $indent={line.indent}>
            {line.tokens.map((token, tokenIndex) => (
              <Token key={tokenIndex} $kind={token.kind}>
                {token.text}
              </Token>
            ))}
          </Line>
        ))}
      </Pre>
    </Container>
  );
};

export default CodeBlock;

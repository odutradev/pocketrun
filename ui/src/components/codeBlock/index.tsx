import { Container, Pre } from "./styles";
import type { CodeBlockProps } from "./types";

const CodeBlock: React.FC<CodeBlockProps> = ({ code, maxHeight }) => (
  <Container $maxHeight={maxHeight}>
    <Pre>{code}</Pre>
  </Container>
);

export default CodeBlock;

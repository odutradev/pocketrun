import { Container, Heading, Number } from "./styles";

import type { DocSectionProps } from "./types";

const DocSection = ({ id, number, title, children }: DocSectionProps) => (
  <Container id={id} aria-labelledby={`${id}-title`}>
    <Heading id={`${id}-title`}>
      <Number>{number}</Number>
      {title}
    </Heading>
    {children}
  </Container>
);

export default DocSection;

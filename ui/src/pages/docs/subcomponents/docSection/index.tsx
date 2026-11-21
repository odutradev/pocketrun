import { Container, Heading, Number } from "./styles";
import useDocsPage from "../../hook";

import type { DocSectionProps } from "./types";

const DocSection = ({ id, children }: DocSectionProps) => {
  const { sections } = useDocsPage();
  const section = sections.find((entry) => entry.id === id);

  return (
    <Container id={id} aria-labelledby={`${id}-title`}>
      <Heading id={`${id}-title`}>
        <Number>{section?.number}</Number>
        {section?.label}
      </Heading>
      {children}
    </Container>
  );
};

export default DocSection;

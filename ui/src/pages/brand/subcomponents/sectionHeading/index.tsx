import { Container, Number, Title } from "./styles";
import { Lead } from "../../styles";

import type { SectionHeadingProps } from "./types";



const SectionHeading = ({ number, title, lead }: SectionHeadingProps) => (
  <Container>
    <Number>{number}</Number>
    <Title>{title}</Title>
    {lead && <Lead>{lead}</Lead>}
  </Container>
);

export default SectionHeading;

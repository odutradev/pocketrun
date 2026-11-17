import { Lead } from "../../styles";
import { Container, Number, Title } from "./styles";
import type { SectionHeadingProps } from "./types";

const SectionHeading: React.FC<SectionHeadingProps> = ({ number, title, lead }) => (
  <Container>
    <Number>{number}</Number>
    <Title>{title}</Title>
    {lead && <Lead>{lead}</Lead>}
  </Container>
);

export default SectionHeading;

import DocSection from "../../subcomponents/docSection";
import { Code, Paragraph } from "../../styles";

const ExpirySection = () => (
  <DocSection id="expiry" number="07" title="Validade">
    <Paragraph>
      Um documento criado com <Code>expiresInDays</Code> ganha um <Code>expiresAt</Code> e é apagado sozinho depois dessa data. A limpeza é
      feita pelo banco e pode levar cerca de um minuto além do horário. Use validade para sessões, códigos temporários, rascunhos e cache. A
      validade é definida só na criação: o <Code>update</Code> não muda nem tira.
    </Paragraph>
  </DocSection>
);

export default ExpirySection;

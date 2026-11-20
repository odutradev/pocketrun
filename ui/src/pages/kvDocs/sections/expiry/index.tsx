import DocSection from "../../subcomponents/docSection";
import { Code, Paragraph } from "../../styles";

const ExpirySection = () => (
  <DocSection id="expiry" number="09" title="Validade">
    <Paragraph>
      Um documento com <Code>expiresInDays</Code> (1 a 3650) ou <Code>expiresAt</Code> (data ISO 8601) é apagado sozinho depois dessa data. A
      limpeza é feita pelo banco e pode levar cerca de um minuto além do horário. Use validade para sessões, códigos temporários, rascunhos e
      cache. O <Code>update</Code> e o <Code>replace</Code> também aceitam os dois campos: mandar <Code>expiresInDays: 0</Code> tira a
      validade, e não mandar nenhum dos dois mantém a atual. Na importação, cada item exportado guarda a validade dele.
    </Paragraph>
  </DocSection>
);

export default ExpirySection;

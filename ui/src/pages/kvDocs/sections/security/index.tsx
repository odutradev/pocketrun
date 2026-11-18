import DocSection from "../../subcomponents/docSection";
import { Bullets, Paragraph } from "../../styles";
import Alert from "@components/alert";

const SecuritySection = () => (
  <DocSection id="security" number="09" title="Segurança">
    <Alert tone="warning" title="Token no navegador é público">
      Um token usado num site, numa página ou num app de navegador aparece no código para quem abrir. Quem copiar consegue ler, gravar e
      apagar todos os dados da aplicação.
    </Alert>
    <Bullets>
      <li>A lista de origens só segura navegadores. Um script fora deles manda a origem que quiser.</li>
      <li>Use o KV no navegador para dados que podem ser públicos ou que você aceita perder: listas de exemplo, contadores, recados.</li>
      <li>Para dados sensíveis, chame a API de um servidor seu, com o token guardado nele, e desligue as chamadas pelo navegador.</li>
      <li>Gere um token por cliente, com validade, e revogue o que vazar. Revogar corta o acesso na hora.</li>
      <li>Mantenha backup do que importa: delete-all e a exclusão da aplicação não têm volta.</li>
    </Bullets>
    <Paragraph>O token é guardado só como hash no servidor e aparece por completo uma única vez, quando é gerado.</Paragraph>
  </DocSection>
);

export default SecuritySection;

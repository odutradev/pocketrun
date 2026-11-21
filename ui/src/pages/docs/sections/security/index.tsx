import DocSection from "../../subcomponents/docSection";
import { Bullets, Paragraph } from "../../styles";
import Alert from "@components/alert";

const SecuritySection = () => (
  <DocSection id="security">
    <Alert tone="warning" title="Token no navegador é público">
      Um token usado num site ou app de navegador aparece no código para quem abrir. Quem copiar consegue tudo o que o cargo dele permite.
      Para páginas do PocketRun, ligue a aplicação na aba Dados da página: nenhum token vai para o HTML.
    </Alert>
    <Bullets>
      <li>A lista de origens só segura navegadores. Um script fora deles manda a origem que quiser.</li>
      <li>Use o KV no navegador para dados que podem ser públicos ou que você aceita perder: listas de exemplo, contadores, recados.</li>
      <li>Para dados sensíveis, chame a API de um servidor seu, com o token guardado nele, e desligue as chamadas pelo navegador.</li>
      <li>Dê a cada token o menor cargo que resolve: só as coleções e operações de que o cliente precisa. Guarde o admin para servidores seus.</li>
      <li>Em formulários públicos, use um cargo que só cria, ou que vê só os próprios documentos, com limite de documentos na coleção.</li>
      <li>Gere um token por cliente, com validade, e revogue o que vazar. Revogar corta o acesso na hora.</li>
      <li>Mantenha backup do que importa: delete-all e a exclusão da aplicação não têm volta.</li>
    </Bullets>
    <Paragraph>O token é guardado só como hash no servidor e aparece por completo uma única vez, quando é gerado.</Paragraph>
  </DocSection>
);

export default SecuritySection;

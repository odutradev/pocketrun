import DocSection from "../../subcomponents/docSection";
import { Bullets, Code, Paragraph } from "../../styles";
import Alert from "@components/alert";

const BackupSection = () => (
  <DocSection id="backup">
    <Paragraph>
      Em <strong>Backup</strong>, no grupo Painel do menu, um superadmin baixa a instância inteira num arquivo e a restaura depois, no mesmo
      servidor ou num novo.
    </Paragraph>
    <Bullets>
      <li>
        O arquivo é um <Code>.jsonl.gz</Code>: JSON por linha, compactado. Ele leva usuários, aplicações e documentos do KV, grupos, links e
        páginas com versões, PINs e dados.
      </li>
      <li>
        Com <strong>Incluir análise e histórico</strong>, leva também aberturas, cliques, uso do KV, pedidos das páginas, visitantes únicos e o
        histórico de alterações. As tentativas de login e de PIN nunca vão.
      </li>
      <li>
        Antes de restaurar, o painel mostra a data, o tipo e as contagens do arquivo e pede que você digite <Code>restaurar</Code>.
      </li>
      <li>
        Só as coleções que estão no arquivo são trocadas, e cada uma só troca no fim. Se o arquivo for inválido, estiver cortado ou não tiver
        nenhum superadmin, nada muda.
      </li>
    </Bullets>
    <Alert tone="warning" title="Guarde o arquivo e os segredos">
      O arquivo tem os hashes das senhas e dos tokens: guarde-o fora do servidor. Para os PINs das páginas e os visitantes únicos continuarem
      valendo, a instância restaurada precisa do mesmo <Code>JWT_SECRET</Code> e do mesmo <Code>PAGE_ACCESS_SECRET</Code>.
    </Alert>
  </DocSection>
);

export default BackupSection;

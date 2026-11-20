import { FileTextIcon } from "@radix-ui/react-icons";

import DocSection from "../../subcomponents/docSection";
import { Actions, Bullets, Code } from "../../styles";
import LinkButton from "@components/linkButton";
import useKvDocsPage from "../../hook";

const ExampleSection = () => {
  const { linksUrl } = useKvDocsPage();

  return (
    <DocSection id="example" number="14" title="Página de exemplo">
      <Bullets>
        <li>
          O serviço de Páginas tem o modelo <strong>CRUD com KV</strong>: uma lista de tarefas que cria, lista, edita, conclui e apaga
          documentos na coleção <Code>tarefas</Code>.
        </li>
        <li>
          Ela usa <Code>pocketrun.kv</Code>, sem token nem URL da API. Depois de criar a página, abra a aba <strong>Dados</strong> do editor e
          ligue uma aplicação.
        </li>
        <li>
          Escolha um cargo com leitura, criação e edição na coleção <Code>tarefas</Code> para quem abre a página. Sem apagar, o botão Apagar
          some sozinho.
        </li>
        <li>
          A página é servida em <Code>{new URL(linksUrl).origin}</Code> e fala só com esse endereço. Na prévia do editor, as chamadas passam pelo
          painel, com o cargo escolhido em Ver como.
        </li>
      </Bullets>
      <Actions>
        <LinkButton to="/pages/new?template=kvCrud" leftIcon={<FileTextIcon />}>
          Criar a página de exemplo
        </LinkButton>
      </Actions>
    </DocSection>
  );
};

export default ExampleSection;

import { FileTextIcon } from "@radix-ui/react-icons";

import DocSection from "../../subcomponents/docSection";
import { Actions, Bullets, Code } from "../../styles";
import LinkButton from "@components/linkButton";
import useDocsPage from "../../hook";

const ExampleSection = () => {
  const { linksUrl } = useDocsPage();

  return (
    <DocSection id="example">
      <Bullets>
        <li>
          O serviço de Páginas tem o modelo <strong>CRUD com KV</strong>: uma lista de tarefas que cria, lista, edita, conclui e apaga
          documentos na coleção <Code>tarefas</Code>.
        </li>
        <li>
          Ela usa <Code>pocketrun.kv</Code>, sem token nem URL da API. Depois de criar a página, abra a aba <strong>Dados</strong> do editor e
          clique em <strong>Ativar dados</strong>.
        </li>
        <li>
          Quem abre sem PIN começa com <Code>leitura</Code>. Para criar e editar tarefas, troque para <Code>escrita</Code>; para apagar, para{" "}
          <Code>gestao</Code>. Sem apagar, o botão Apagar some sozinho.
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

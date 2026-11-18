import { FileTextIcon } from "@radix-ui/react-icons";

import DocSection from "../../subcomponents/docSection";
import { Actions, Bullets, Code } from "../../styles";
import LinkButton from "@components/linkButton";
import useKvDocsPage from "../../hook";

const ExampleSection = () => {
  const { linksUrl } = useKvDocsPage();

  return (
    <DocSection id="example" number="10" title="Página de exemplo">
      <Bullets>
        <li>
          O serviço de Páginas tem o modelo <strong>CRUD com KV</strong>: uma lista de tarefas que cria, lista, edita, conclui e apaga
          documentos na coleção <Code>tarefas</Code>.
        </li>
        <li>
          Depois de criar a página, abra o editor e troque <Code>COLE_O_TOKEN_AQUI</Code> por um token de uma aplicação.
        </li>
        <li>
          Na Configuração da aplicação, libere a origem <Code>{new URL(linksUrl).origin}</Code>, que é de onde as páginas são servidas. A
          prévia do editor roda isolada e só chama a API se a aplicação aceitar qualquer origem.
        </li>
        <li>Use uma aplicação de teste: o token fica visível no código da página.</li>
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

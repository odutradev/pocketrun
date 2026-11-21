import { DownloadIcon } from "@radix-ui/react-icons";

import DocSection from "../../subcomponents/docSection";
import { Actions, Code, Paragraph } from "../../styles";
import CodeBlock from "@components/codeBlock";
import Button from "@components/button";
import useDocsPage from "../../hook";

const LlmsSection = () => {
  const { llmsText, handleDownloadLlms } = useDocsPage();

  return (
    <DocSection id="llms">
      <Paragraph>
        O <Code>llms.txt</Code> é o resumo do projeto inteiro para assistentes de IA, no formato do llmstxt.org: cada rota, guia e arquivo
        importante numa linha, com o caminho de onde ele fica no repositório. Mande para a IA antes de pedir algo novo, para ela achar a rota,
        o arquivo ou a regra envolvida.
      </Paragraph>
      <CodeBlock title="llms.txt" language="text" code={llmsText} isCopyable maxHeight="480px" />
      <Actions>
        <Button variant="secondary" leftIcon={<DownloadIcon />} onClick={handleDownloadLlms}>
          Baixar llms.txt
        </Button>
      </Actions>
    </DocSection>
  );
};

export default LlmsSection;

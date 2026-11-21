import { ExternalLinkIcon } from "@radix-ui/react-icons";

import DocSection from "../../subcomponents/docSection";
import { Actions, Code, Paragraph } from "../../styles";
import LinkButton from "@components/linkButton";
import CopyField from "@components/copyField";
import useDocsPage from "../../hook";

const LlmsSection = () => {
  const { llmsUrl } = useDocsPage();

  return (
    <DocSection id="llms">
      <Paragraph>
        O <Code>llms.txt</Code> é o resumo do projeto inteiro para assistentes de IA, no formato do llmstxt.org: cada rota, guia e arquivo
        importante numa linha, com o caminho de onde ele fica no repositório. Antes de pedir algo novo, mande este link para a IA, para ela
        achar a rota, o arquivo ou a regra envolvida.
      </Paragraph>
      <CopyField value={llmsUrl} label="Link do llms.txt" />
      <Actions>
        <LinkButton href={llmsUrl} variant="secondary" leftIcon={<ExternalLinkIcon />} isExternal>
          Abrir llms.txt
        </LinkButton>
      </Actions>
    </DocSection>
  );
};

export default LlmsSection;

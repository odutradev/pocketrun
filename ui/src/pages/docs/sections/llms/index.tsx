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
        O <Code>llms.txt</Code> explica para assistentes de IA como usar o KV, as páginas e os links: cada rota com o que mandar, o que volta e
        os erros, o <Code>pocketrun.kv</Code> das páginas, o acesso com PIN e a ativação. Quando for criar um cliente do KV ou uma página,
        mande este link para a IA junto com o pedido.
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

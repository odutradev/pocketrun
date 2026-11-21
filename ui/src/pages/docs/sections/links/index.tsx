import { Bullets, Code, Fields, Paragraph } from "../../styles";
import DocSection from "../../subcomponents/docSection";
import CopyField from "@components/copyField";
import useDocsPage from "../../hook";

const LinksSection = () => {
  const { linksUrl } = useDocsPage();

  return (
    <DocSection id="links">
      <Paragraph>
        Um link curto responde em <Code>{`${linksUrl}/{slug}`}</Code> com um redirecionamento <Code>302</Code> do servidor para o destino. É
        instantâneo e funciona com robôs e prévias de link.
      </Paragraph>
      <Bullets>
        <li>
          Os parâmetros do endereço vão junto para o destino: <Code>/promo?utm_source=insta</Code>. Um parâmetro com o mesmo nome de um do
          destino troca o valor dele.
        </li>
        <li>
          O slug aceita maiúsculas e barra no final (<Code>/Promo/</Code> abre <Code>promo</Code>). O destino não pode ser o próprio
          encurtador.
        </li>
        <li>
          A aba <strong>QR code</strong> gera o código do link curto em PNG (256 a 2048 px) ou SVG. Os acessos pelo QR code entram na análise.
        </li>
        <li>Links se organizam em grupos com nome, cor e ícone, e cada grupo tem a própria lista.</li>
      </Bullets>
      <Fields>
        <CopyField value={`${linksUrl}/{slug}`} label="Endereço do link" />
      </Fields>
    </DocSection>
  );
};

export default LinksSection;

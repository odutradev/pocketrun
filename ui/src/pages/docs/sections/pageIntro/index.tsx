import { Bullets, Code, Paragraph } from "../../styles";
import DocSection from "../../subcomponents/docSection";
import CodeBlock from "@components/codeBlock";
import useDocsPage from "../../hook";

const PageIntroSection = () => {
  const { linksUrl } = useDocsPage();

  return (
    <DocSection id="pages">
      <Paragraph>
        Uma página é um arquivo HTML publicado em <Code>{`${linksUrl}/{slug}`}</Code>. O estilo e o script vão dentro do próprio HTML, sem
        arquivos separados, com limite de 512 KB. Ela nasce de um modelo: <strong>Em branco</strong> ou <strong>CRUD com KV</strong>.
      </Paragraph>
      <Bullets>
        <li>
          O slug é único na instância inteira e dividido com os links: aceita só letras minúsculas, números e hífen. Ele pode ser sorteado ou
          escolhido, e a disponibilidade é conferida enquanto você digita.
        </li>
        <li>Um trecho solto de HTML ganha um esqueleto com charset, viewport e o título da página. A entrega nunca fica em cache.</li>
        <li>Páginas se organizam em grupos com nome, cor e ícone. Excluir o grupo deixa as páginas sem grupo.</li>
        <li>
          Toda página recebe o objeto <Code>window.pocketrun</Code>, injetado na entrega e nunca gravado no HTML.
        </li>
      </Bullets>
      <CodeBlock
        title="window.pocketrun"
        language="json"
        code={`{
  "apiVersion": 1,
  "page": { "slug": "promo", "title": "Promo", "version": "1.3", "isPreview": false },
  "access": { "isProtected": true, "role": "gerente" },
  "kv": { "role": "escrita", "rules": [] }
}`}
      />
    </DocSection>
  );
};

export default PageIntroSection;

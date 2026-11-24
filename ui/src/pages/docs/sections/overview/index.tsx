import { Bullets, Code, Fields, Paragraph } from "../../styles";
import DocSection from "../../subcomponents/docSection";
import CopyField from "@components/copyField";
import useDocsPage from "../../hook";

const OverviewSection = () => {
  const { apiUrl, linksUrl } = useDocsPage();

  return (
    <DocSection id="overview">
      <Paragraph>
        O PocketRun junta numa instância só, com um painel único, os serviços que um projeto pequeno precisa para ir ao ar sem escrever
        backend. Adicionar um projeto custa um clique no painel, nunca um servidor novo.
      </Paragraph>
      <Bullets>
        <li>
          <strong>KV</strong>: banco de documentos JSON por aplicação, acessado por token e protegido por cargos. Serve sites, apps, scripts e
          as páginas do próprio PocketRun.
        </li>
        <li>
          <strong>Páginas</strong>: HTML publicado num endereço curto, com versões, acesso por PIN e dados do KV sem token.
        </li>
        <li>
          <strong>Links</strong>: links curtos que redirecionam na hora, com QR code, grupos, limites e análise de acessos.
        </li>
      </Bullets>
      <Paragraph>
        Páginas e links dividem o mesmo endereço, <Code>{"/{slug}"}</Code>, e a mesma análise. Eles só abrem no domínio de links,
        e o mesmo slug no endereço da API responde 404. A API pública do KV fica na raiz da API, e o painel usa rotas
        próprias sob <Code>/admin</Code>, com o login do gestor.
      </Paragraph>
      <Fields>
        <CopyField value={apiUrl} label="URL da API" />
        <CopyField value={`${linksUrl}/{slug}`} label="Endereço de páginas e links" />
      </Fields>
    </DocSection>
  );
};

export default OverviewSection;

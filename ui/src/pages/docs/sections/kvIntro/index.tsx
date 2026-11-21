import { Bullets, Code, Fields, Paragraph } from "../../styles";
import DocSection from "../../subcomponents/docSection";
import CopyField from "@components/copyField";
import useDocsPage from "../../hook";

const KvIntroSection = () => {
  const { apiUrl } = useDocsPage();

  return (
    <DocSection id="kv">
      <Paragraph>
        O KV guarda documentos JSON livres, organizados em coleções. Não tem esquema: cada documento é o objeto que você mandar em{" "}
        <Code>data</Code>. Serve de backend para sites, apps, scripts e para as páginas do próprio PocketRun.
      </Paragraph>
      <Bullets>
        <li>
          <strong>Aplicação</strong>: o projeto dono dos dados. Tem um Project ID, tokens de acesso e uma lista de origens permitidas. Uma
          aplicação nunca enxerga os dados de outra.
        </li>
        <li>
          <strong>Coleção</strong>: um nome na rota, como <Code>/kv/pedidos/…</Code>. Ela passa a existir no primeiro documento gravado e
          some do explorador quando fica vazia.
        </li>
        <li>
          <strong>Documento</strong>: um objeto com <Code>id</Code>, <Code>data</Code>, <Code>createdAt</Code>, <Code>updatedAt</Code> e, se
          tiver validade, <Code>expiresAt</Code>.
        </li>
      </Bullets>
      <Fields>
        <CopyField value={apiUrl} label="URL da API" />
        <CopyField value={`${apiUrl}/kv/{colecao}/get-all`} label="Exemplo de rota" />
      </Fields>
    </DocSection>
  );
};

export default KvIntroSection;

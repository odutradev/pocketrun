import DocSection from "../../subcomponents/docSection";
import { Code, Paragraph } from "../../styles";
import DataTable from "@components/dataTable";
import { kvDocRoutes } from "@assets/data";
import { routeColumns } from "../../table";

const RoutesSection = () => (
  <DocSection id="routes" number="03" title="Rotas">
    <Paragraph>
      Troque <Code>{"{colecao}"}</Code> pelo nome da coleção e <Code>{"{id}"}</Code> pelo id do documento. Os nomes de coleção são livres,
      mas evite <Code>project</Code>: <Code>/kv/project/delete-all</Code> apaga os documentos de todas as coleções, não só os dessa.
    </Paragraph>
    <DataTable caption="Rotas da API pública do KV" columns={routeColumns} rows={kvDocRoutes} getRowKey={(route) => `${route.method} ${route.path}`} minWidth="720px" />
  </DocSection>
);

export default RoutesSection;

import DocSection from "../../subcomponents/docSection";
import { Code, Paragraph } from "../../styles";
import DataTable from "@components/dataTable";
import { kvDocRoutes } from "@assets/data";
import { routeColumns } from "../../table";

const RoutesSection = () => (
  <DocSection id="routes">
    <Paragraph>
      Troque <Code>{"{colecao}"}</Code> pelo nome da coleção e <Code>{"{id}"}</Code> pelo id do documento. O nome <Code>project</Code> é
      reservado para as rotas que valem para a aplicação inteira. Cada rota também passa pelo cargo do token (veja Cargos).
    </Paragraph>
    <DataTable caption="Rotas da API pública do KV" columns={routeColumns} rows={kvDocRoutes} getRowKey={(route) => `${route.method} ${route.path}`} minWidth="720px" />
  </DocSection>
);

export default RoutesSection;

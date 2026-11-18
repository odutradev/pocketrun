import { Code, CodeGrid, Paragraph } from "../../styles";
import DocSection from "../../subcomponents/docSection";
import CodeBlock from "@components/codeBlock";
import DataTable from "@components/dataTable";
import { kvDocErrors } from "@assets/data";
import { errorColumns } from "../../table";

const ErrorsSection = () => (
  <DocSection id="errors" number="08" title="Erros">
    <Paragraph>
      Os erros respondem com o status HTTP e um JSON com o código em <Code>error</Code>. Use o código, não o texto, para decidir o que mostrar
      a quem usa o seu app.
    </Paragraph>
    <DataTable caption="Códigos de erro da API pública do KV" columns={errorColumns} rows={kvDocErrors} getRowKey={(error) => error.code} minWidth="640px" />
    <CodeGrid>
      <CodeBlock title="Erro simples" language="json" code={`{ "error": "invalid_access_token" }`} />
      <CodeBlock title="Erro de validação" language="json" code={`{
  "error": "validation_failed",
  "fields": { "data": "required" }
}`} />
    </CodeGrid>
  </DocSection>
);

export default ErrorsSection;

import { Bullets, Code, Paragraph } from "../../styles";
import DocSection from "../../subcomponents/docSection";
import { pageConfigDocFields } from "@assets/data";
import { configFieldColumns } from "../../table";
import DataTable from "@components/dataTable";
import CodeBlock from "@components/codeBlock";
import Alert from "@components/alert";

const example = `{
  "version": 1,
  "access": {
    "isEnabled": true,
    "sessionHours": 24,
    "pins": [
      { "role": "", "pin": "604918", "kvRole": "leitor" },
      { "role": "equipe", "kvRole": "equipe" },
      { "role": "gerente", "kvRole": "admin" }
    ]
  },
  "kv": {
    "isEnabled": true,
    "publicRole": "",
    "roles": [
      { "name": "leitor", "description": "Só vê o cardápio", "rules": [{ "collection": "*", "operations": ["read"] }] },
      {
        "name": "equipe",
        "description": "Registra pedidos",
        "rules": [
          { "collection": "pedidos", "operations": ["read", "create", "update"], "maxDocuments": 5000 },
          { "collection": "cardapio", "operations": ["read"] }
        ]
      }
    ]
  }
}`;

const PageConfigSection = () => (
  <DocSection id="page-config">
    <Paragraph>
      Os PINs, a proteção, os dados e os cargos de uma página cabem num JSON só. Na aba <strong>Acesso e dados</strong> da página, troque para{" "}
      <strong>JSON</strong>, edite ou cole um JSON gerado por uma IA e clique em <strong>Aplicar</strong> (ou Ctrl+S). O editor confere os campos
      enquanto você digita.
    </Paragraph>
    <Bullets>
      <li>Cada bloco é opcional: o que ficar de fora não muda. As listas são completas: um PIN ou cargo que sair da lista é apagado.</li>
      <li>
        Os PINs nunca aparecem no JSON exportado. Um PIN sem <Code>pin</Code> mantém o atual, e um PIN novo sem <Code>pin</Code> ganha um
        sorteado, mostrado depois de aplicar.
      </li>
      <li>
        Cada PIN aponta para um cargo dos dados em <Code>kvRole</Code>, e quem abre sem PIN usa <Code>kv.publicRole</Code>. O valor é{" "}
        <Code>admin</Code> (acesso total), um cargo de <Code>kv.roles</Code> ou <Code>""</Code> para sem acesso aos dados.
      </li>
      <li>A configuração inteira é conferida antes de gravar. Se algo estiver errado, nada muda e o painel mostra o motivo.</li>
    </Bullets>
    <CodeBlock title="Exemplo: cardápio com equipe e gerente" code={example} language="json" isCopyable />
    <DataTable caption="Campos da configuração de acesso e dados" columns={configFieldColumns} rows={pageConfigDocFields} getRowKey={(field) => field.path} minWidth="720px" />
    <Alert tone="neutral" title="Para pedir a uma IA">
      Cole o link do llms.txt (seção llms.txt) e descreva quem abre a página e o que cada um pode fazer. A IA devolve o JSON pronto para colar no
      modo JSON.
    </Alert>
  </DocSection>
);

export default PageConfigSection;

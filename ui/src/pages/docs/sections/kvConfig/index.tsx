import { Bullets, Code, Paragraph } from "../../styles";
import DocSection from "../../subcomponents/docSection";
import { kvConfigDocFields } from "@assets/data";
import { configFieldColumns } from "../../table";
import DataTable from "@components/dataTable";
import CodeBlock from "@components/codeBlock";
import Alert from "@components/alert";

const example = `{
  "version": 1,
  "projectId": "loja",
  "name": "Loja",
  "description": "Pedidos e cardápio da loja",
  "allowedOrigins": ["https://loja.exemplo.com"],
  "allowNonBrowserRequests": false,
  "roles": [
    { "name": "vitrine", "description": "Só lê o cardápio", "rules": [{ "collection": "cardapio", "operations": ["read"] }] },
    {
      "name": "caixa",
      "rules": [
        { "collection": "cardapio", "operations": ["read"] },
        { "collection": "pedidos", "operations": ["read", "create", "update"], "maxDocuments": 10000 }
      ]
    }
  ],
  "tokens": [
    { "id": "3f9c2a1b8e7d6c5f", "name": "Site", "role": "vitrine" },
    { "id": "a1b2c3d4e5f60718", "name": "Caixa da loja", "role": "caixa" }
  ]
}`;

const KvConfigSection = () => (
  <DocSection id="kv-config">
    <Paragraph>
      O nome, as origens, os cargos e o cargo de cada token de uma aplicação cabem num JSON só. Na aplicação, abra a aba <strong>JSON</strong>,
      edite ou cole um JSON gerado por uma IA e clique em <strong>Aplicar</strong> (ou Ctrl+S). O editor confere os campos enquanto você digita.
    </Paragraph>
    <Bullets>
      <li>Cada campo é opcional: o que ficar de fora não muda. A lista de cargos é completa: um cargo que sair dela é apagado.</li>
      <li>
        <Code>tokens</Code> só troca o cargo dos tokens listados, pelo <Code>id</Code>. Criar e revogar tokens fica na aba Tokens, porque o
        token puro só aparece uma vez.
      </li>
      <li>
        Para apagar um cargo que um token usa, mova o token para outro cargo no mesmo JSON. <Code>projectId</Code> e o nome dos tokens são só
        informativos.
      </li>
      <li>A configuração inteira é conferida antes de gravar. Se algo estiver errado, nada muda e o painel mostra o motivo.</li>
    </Bullets>
    <CodeBlock title="Exemplo: loja com vitrine e caixa" code={example} language="json" isCopyable />
    <DataTable caption="Campos da configuração da aplicação" columns={configFieldColumns} rows={kvConfigDocFields} getRowKey={(field) => field.path} minWidth="720px" />
    <Alert tone="neutral" title="Para pedir a uma IA">
      Cole o link do llms.txt (seção llms.txt) e descreva quem usa a aplicação e o que cada um pode fazer. A IA devolve o JSON pronto para colar
      na aba JSON.
    </Alert>
  </DocSection>
);

export default KvConfigSection;

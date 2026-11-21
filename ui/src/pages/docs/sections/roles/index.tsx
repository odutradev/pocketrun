import { Bullets, Code, CodeGrid, Paragraph } from "../../styles";
import DocSection from "../../subcomponents/docSection";
import CodeBlock from "@components/codeBlock";

const RolesSection = () => (
  <DocSection id="roles">
    <Paragraph>
      Cada token tem um cargo, criado na aba <strong>Cargos</strong> da aplicação. O cargo lista as coleções que o token pode usar e, em cada
      uma, as operações: ler, criar, editar e apagar. O resto é recusado com <Code>403 forbidden_operation</Code>.
    </Paragraph>
    <Bullets>
      <li>
        <strong>admin</strong> é o cargo de acesso total e o dos tokens antigos. Só ele limpa coleções e usa as rotas de projeto.
      </li>
      <li>
        Ler cobre <Code>get-all</Code>, <Code>get</Code>, <Code>count</Code>, <Code>eval</Code> e <Code>export</Code> da coleção. Criar cobre{" "}
        <Code>create</Code> e <Code>import</Code>. Editar cobre <Code>update</Code> e <Code>replace</Code>.
      </li>
      <li>
        A regra <Code>*</Code> vale para as coleções sem regra própria. A regra com o nome da coleção sempre vence.
      </li>
      <li>O limite de documentos de uma regra barra gravações e importações que passariam do número.</li>
      <li>
        Com <strong>só os próprios documentos</strong>, o cargo lista, lê, edita e apaga só o que ele mesmo criou. Cada documento guarda o
        cargo que o criou em <Code>createdByRole</Code>.
      </li>
      <li>
        O <Code>/validate/control-access</Code> diz o cargo do token em <Code>role</Code>.
      </li>
    </Bullets>
    <CodeGrid>
      <CodeBlock
        title="Cargo caixa"
        language="json"
        code={`{
  "name": "caixa",
  "rules": [
    { "collection": "produtos", "operations": ["read"] },
    { "collection": "vendas", "operations": ["read", "create"], "maxDocuments": 10000 }
  ],
  "isOwnDocumentsOnly": false
}`}
      />
      <CodeBlock
        title="Fora do cargo"
        language="json"
        code={`DELETE /kv/produtos/delete/6afe…18f4

403 { "error": "forbidden_operation" }`}
      />
    </CodeGrid>
  </DocSection>
);

export default RolesSection;

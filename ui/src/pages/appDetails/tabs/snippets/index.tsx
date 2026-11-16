import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { Heading } from "@radix-ui/themes";

import { publicApiUrl } from "@assets/config";
import Button from "@components/button";
import Card from "@components/card";
import CodeBlock from "@components/codeBlock";
import useClipboard from "@hooks/useClipboard";

import { List, SnippetHeader } from "./styles";

const snippets = [
  {
    key: "curl",
    title: "Exemplo cURL",
    code: `curl -X POST "${publicApiUrl}/kv/pedidos/create" \\
  -H "Authorization: Bearer <SEU_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"data": {"cliente": "Maria", "valor": 150.00, "status": "pago"}}'`
  },
  {
    key: "js",
    title: "Exemplo JavaScript / Fetch",
    code: `const response = await fetch("${publicApiUrl}/kv/pedidos/create", {
  method: "POST",
  headers: {
    "Authorization": "Bearer <SEU_TOKEN>",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    data: { cliente: "Maria", valor: 150.0, status: "pago" }
  })
});
const document = await response.json();`
  }
];

const SnippetsTab: React.FC = () => {
  const { copy, isCopied } = useClipboard();

  return (
    <List>
      {snippets.map((snippet) => (
        <Card key={snippet.key} size="3">
          <SnippetHeader>
            <Heading size="3" weight="bold">
              {snippet.title}
            </Heading>
            <Button
              variant="soft"
              size="1"
              color={isCopied(snippet.key) ? "grass" : "gray"}
              onClick={() => copy(snippet.code, snippet.key)}
              leftIcon={isCopied(snippet.key) ? <CheckIcon /> : <CopyIcon />}
            >
              {isCopied(snippet.key) ? "Copiado" : "Copiar"}
            </Button>
          </SnippetHeader>
          <CodeBlock code={snippet.code} />
        </Card>
      ))}
    </List>
  );
};

export default SnippetsTab;

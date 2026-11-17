import Card from "@components/card";
import CodeBlock from "@components/codeBlock";
import CopyField from "@components/copyField";
import EmptyState from "@components/emptyState";
import ExpiryBadge from "@components/expiryBadge";
import { formatDateTime } from "@utils/functions";

import { Body, Details, Header, Mono, Title } from "./styles";
import type { DocumentPanelProps } from "./types";

const DocumentPanel = ({ document }: DocumentPanelProps) => (
  <Card as="section" padding="sm" aria-label="Documento aberto">
    {!document ? (
      <EmptyState isCompact title="Nenhum documento aberto" description="Escolha uma linha da tabela para ver o JSON completo." />
    ) : (
      <Body>
        <Header>
          <Title>Documento</Title>
        </Header>
        <CopyField value={document._id} label="id do documento" />
        <CodeBlock code={JSON.stringify(document.data, null, 2)} language="json" title="data" isCopyable maxHeight="420px" />
        <Details>
          <dt>Rota</dt>
          <dd>
            <Mono>
              GET /kv/{document.collectionName}/get/{document._id}
            </Mono>
          </dd>
          <dt>Criado em</dt>
          <dd>{formatDateTime(document.createdAt)}</dd>
          <dt>Atualizado</dt>
          <dd>{formatDateTime(document.updatedAt)}</dd>
          <dt>Validade</dt>
          <dd>
            <ExpiryBadge expiresAt={document.expiresAt} noneLabel="Sem validade" />
          </dd>
        </Details>
      </Body>
    )}
  </Card>
);

export default DocumentPanel;

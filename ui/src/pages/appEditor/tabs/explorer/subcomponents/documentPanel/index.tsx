import { Cross2Icon } from "@radix-ui/react-icons";

import { Aside, Body, Container, Details, Header, Mono, Title } from "./styles";
import { formatDateTime, shortenId } from "@utils/functions";
import ExpiryBadge from "@components/expiryBadge";
import IconButton from "@components/iconButton";
import CodeBlock from "@components/codeBlock";
import CopyField from "@components/copyField";

import type { DocumentPanelProps } from "./types";

const DocumentPanel = ({ document, onClose }: DocumentPanelProps) => (
  <Container aria-labelledby="document-title">
    <Header>
      <Title id="document-title">
        Documento <Mono>{shortenId(document._id)}</Mono>
      </Title>
      <IconButton size="sm" label="Fechar o documento" icon={<Cross2Icon />} onClick={onClose} />
    </Header>
    <Body>
      <CodeBlock code={JSON.stringify(document.data, null, 2)} language="json" title="data" isCopyable maxHeight="420px" />
      <Aside>
        <CopyField value={document._id} label="id do documento" />
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
      </Aside>
    </Body>
  </Container>
);

export default DocumentPanel;

import { Code, Dialog } from "@radix-ui/themes";

import Button from "@components/button";
import CodeBlock from "@components/codeBlock";

import { Footer } from "./styles";
import type { DocumentDialogProps } from "./types";

const DocumentDialog: React.FC<DocumentDialogProps> = ({ document, onClose }) => (
  <Dialog.Root open={Boolean(document)} onOpenChange={(isOpen) => !isOpen && onClose()}>
    <Dialog.Content maxWidth="600px">
      <Dialog.Title size="4" weight="bold" mb="2">
        Detalhes do Documento
      </Dialog.Title>
      <Dialog.Description size="1" color="gray" mb="3">
        ID: <Code size="1">{document?._id}</Code>
      </Dialog.Description>
      <CodeBlock code={JSON.stringify(document?.data, null, 2)} maxHeight="360px" />
      <Footer>
        <Button variant="soft" color="gray" size="2" onClick={onClose}>
          Fechar
        </Button>
      </Footer>
    </Dialog.Content>
  </Dialog.Root>
);

export default DocumentDialog;

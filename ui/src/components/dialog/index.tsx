import { Cross2Icon } from "@radix-ui/react-icons";
import { Dialog as RadixDialog } from "@radix-ui/themes";

import IconButton from "@components/iconButton";

import { Content, Description, Eyebrow, Footer, Header, Heading, Title } from "./styles";
import type { DialogProps } from "./types";

// Diálogo para confirmação e segredos de uma vez só. O fundo escurece a 66%.
const Dialog = ({
  isOpen,
  onClose,
  title,
  eyebrow,
  description,
  children,
  footer,
  maxWidth = "520px"
}: DialogProps) => (
  <RadixDialog.Root open={isOpen} onOpenChange={(isNextOpen) => !isNextOpen && onClose()}>
    {/* Sem descrição, o `aria-describedby` vazio avisa o Radix de que ela é dispensável. */}
    <Content maxWidth={maxWidth} {...(description ? {} : { "aria-describedby": undefined })}>
      <Header>
        <Heading>
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <Title>{title}</Title>
          {description && <Description>{description}</Description>}
        </Heading>
        <RadixDialog.Close>
          <IconButton size="sm" label="Fechar" icon={<Cross2Icon />} />
        </RadixDialog.Close>
      </Header>
      {children}
      {footer && <Footer>{footer}</Footer>}
    </Content>
  </RadixDialog.Root>
);

export default Dialog;

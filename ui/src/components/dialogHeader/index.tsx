import { Cross2Icon } from "@radix-ui/react-icons";
import { Badge, Dialog } from "@radix-ui/themes";

import { BadgeContent, CloseButton, Header } from "./styles";
import type { DialogHeaderProps } from "./types";

const DialogHeader: React.FC<DialogHeaderProps> = ({ icon, label, onClose }) => (
  <Header>
    <Badge size="1" variant="surface" color="mint" radius="full">
      <BadgeContent>
        {icon}
        {label}
      </BadgeContent>
    </Badge>
    <Dialog.Close>
      <CloseButton variant="ghost" color="gray" size="1" onClick={onClose} aria-label="Fechar">
        <Cross2Icon />
      </CloseButton>
    </Dialog.Close>
  </Header>
);

export default DialogHeader;

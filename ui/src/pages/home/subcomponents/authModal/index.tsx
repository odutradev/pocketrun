import { LockClosedIcon } from "@radix-ui/react-icons";
import { Dialog, VisuallyHidden } from "@radix-ui/themes";

import AuthPanel from "@components/authPanel";
import DialogHeader from "@components/dialogHeader";

import useHomePage from "../../hook";

const AuthModal: React.FC = () => {
  const { isAuthModalOpen, handleCloseAuth } = useHomePage();

  return (
    <Dialog.Root open={isAuthModalOpen} onOpenChange={(isOpen) => !isOpen && handleCloseAuth()}>
      <Dialog.Content maxWidth="460px">
        <VisuallyHidden>
          <Dialog.Title>Entrar no PocketRun</Dialog.Title>
        </VisuallyHidden>
        <DialogHeader icon={<LockClosedIcon />} label="Acesso do Gestor" onClose={handleCloseAuth} />
        <AuthPanel onSuccess={handleCloseAuth} />
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default AuthModal;

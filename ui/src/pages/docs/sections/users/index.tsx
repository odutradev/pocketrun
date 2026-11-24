import DocSection from "../../subcomponents/docSection";
import { Bullets } from "../../styles";

const UsersSection = () => (
  <DocSection id="users">
    <Bullets>
      <li>
        Não há cadastro público. O primeiro superadmin nasce no setup inicial, depois de informar o token de setup que a API mostra nos logs, e os outros usuários são criados em <strong>Usuários</strong>,
        com uma senha inicial.
      </li>
      <li>
        <strong>Gestor</strong> cria e gerencia aplicações, páginas e links. <strong>Superadmin</strong> também gerencia os usuários e o
        backup.
      </li>
      <li>O login vale 7 dias no navegador. Depois de algumas senhas erradas seguidas, o e-mail e o IP esperam antes de tentar de novo.</li>
      <li>
        No perfil, <strong>Sair de todos os dispositivos</strong> encerra todas as sessões. Trocar a senha ou o cargo de alguém também
        encerra as sessões dessa pessoa.
      </li>
    </Bullets>
  </DocSection>
);

export default UsersSection;

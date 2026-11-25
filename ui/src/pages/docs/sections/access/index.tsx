import DocSection from "../../subcomponents/docSection";
import { Bullets, Code } from "../../styles";
import Alert from "@components/alert";

const AccessSection = () => (
  <DocSection id="access">
    <Bullets>
      <li>
        A aba <strong>Acesso e dados</strong> protege a página com PINs de 6 números. Há um PIN geral opcional e PINs por cargo, como{" "}
        <Code>gerente</Code> ou <Code>caixa-1</Code>, até 20 no total.
      </li>
      <li>
        Com a proteção ligada, o endereço mostra uma tela de PIN e o HTML só sai do servidor depois do PIN certo. O acesso dura o tempo
        escolhido na aba, de 1 hora a 30 dias (1 dia por padrão).
      </li>
      <li>
        O cargo usado chega à página em <Code>pocketrun.access.role</Code> e decide o que ela pode fazer com os dados.
      </li>
      <li>
        Para um botão de sair, chame <Code>await pocketrun.access.logout()</Code> e recarregue a página: o acesso desse navegador acaba e a
        tela de PIN volta. Na prévia do editor, a chamada não faz nada.
      </li>
      <li>
        Trocar o PIN de um cargo encerra os acessos dele. Desligar a proteção ou <strong>Encerrar todos os acessos</strong> encerra todos.
      </li>
      <li>Erros de PIN são limitados por visitante e por página. Cada abertura com PIN entra no histórico, com o cargo usado.</li>
    </Bullets>
    <Alert tone="warning" title="PIN não é senha forte">
      Use o PIN para conteúdo de equipe, como cardápios, escalas e painéis internos. Não guarde dados sensíveis em páginas.
    </Alert>
  </DocSection>
);

export default AccessSection;

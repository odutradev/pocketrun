import { Hint, Mono, Rules } from "../../styles";
import { Body, Container, Summary } from "./styles";
import CodeBlock from "@components/codeBlock";

const usageExample = `const tarefas = pocketrun.kv.collection("tarefas");

const { data, totalPages } = await tarefas.list({ feita: false, page: 1, limit: 20 });
const nova = await tarefas.create({ titulo: "Comprar pão", feita: false });
await tarefas.update(nova.id, { feita: true });
await tarefas.remove(nova.id);

if (!pocketrun.kv.can("tarefas", "delete")) esconderBotaoApagar();
console.info(pocketrun.access.role);`;

const UsageGuide = () => (
  <Container>
    <Summary>Como usar no HTML e por que é seguro</Summary>
    <Body>
      <Hint>
        A página recebe <Mono>pocketrun.kv</Mono> pronto, sem token e sem URL da API. O cargo de quem abriu chega em{" "}
        <Mono>pocketrun.access.role</Mono>.
      </Hint>
      <CodeBlock title="JavaScript da página" code={usageExample} isCopyable />
      <Rules>
        <li>Nenhum token vai para o HTML. O cargo vem do PIN usado, num cookie que o JavaScript não lê.</li>
        <li>O HTML só sai do servidor depois do PIN certo. Depois de 5 PINs errados, quem errou espera 15 minutos.</li>
        <li>Só o próprio endereço da página é aceito: outros sites não usam a sessão de quem abriu.</li>
        <li>Trocar um PIN, encerrar os acessos, mudar os cargos ou desligar os dados vale no próximo pedido.</li>
        <li>Cada visitante faz até 120 pedidos por minuto, e a página toda até 1.200.</li>
        <li>6 números protegem bem conteúdo de equipe, mas não servem para dados sensíveis.</li>
      </Rules>
    </Body>
  </Container>
);

export default UsageGuide;

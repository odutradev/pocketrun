import DocSection from "../../subcomponents/docSection";
import { Bullets, Paragraph } from "../../styles";

const ActivationSection = () => (
  <DocSection id="activation">
    <Paragraph>Páginas e links têm as mesmas regras de ativação, escolhidas no formulário de cada um.</Paragraph>
    <Bullets>
      <li>
        <strong>Ativo</strong> e <strong>desativado</strong>: no ar ou fora do ar até alguém mudar.
      </li>
      <li>
        <strong>Por período</strong>: no ar até a data de fim, que é obrigatória. A data de início é opcional.
      </li>
      <li>
        <strong>Por acessos</strong>: no ar até atingir o limite. A contagem pode ser <strong>por clique</strong>, em que cada abertura conta,
        ou <strong>por visitante único</strong>, em que cada pessoa conta uma vez e quem volta não gasta o limite.
      </li>
      <li>Robôs, prévias de link (WhatsApp, Slack e afins) e pedidos HEAD nunca gastam o limite.</li>
      <li>Fora da regra, o endereço responde 404 com a tela de indisponível, e o slug continua reservado.</li>
    </Bullets>
  </DocSection>
);

export default ActivationSection;

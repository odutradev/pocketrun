import DocSection from "../../subcomponents/docSection";
import { Bullets, Code } from "../../styles";

const PanelSection = () => (
  <DocSection id="panel">
    <Bullets>
      <li>
        <strong>Geral</strong> abre primeiro: números de todo o ambiente, o gráfico de uso dos três serviços no período escolhido, os mais
        acessados e os pontos de atenção, como tokens vencendo e aplicações abertas a qualquer site. Exportar CSV baixa a série de uso.
      </li>
      <li>
        Em <strong>Serviços</strong>, cada ferramenta tem a sua cor: KV, Páginas e Links. As listas têm busca, filtros, ordenação, paginação e
        a escolha entre lista e cards, lembrada no navegador.
      </li>
      <li>
        Cada item abre num editor com abas. A aba aberta fica no endereço (<Code>?tab=</Code>), então dá para mandar o link direto para ela.
      </li>
      <li>
        Toda criação, edição e exclusão de página e de link entra no <strong>Histórico</strong>, com quem mudou, quando e o antes e depois de
        cada campo.
      </li>
      <li>
        O grupo <strong>Painel</strong> reúne o que é da instância: usuários e backup, para superadmins. O perfil, no rodapé do menu, troca
        nome, e-mail e senha.
      </li>
    </Bullets>
  </DocSection>
);

export default PanelSection;

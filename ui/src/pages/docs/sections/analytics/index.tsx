import DocSection from "../../subcomponents/docSection";
import { Bullets, Paragraph } from "../../styles";

const AnalyticsSection = () => (
  <DocSection id="analytics">
    <Paragraph>
      Cada abertura de página e de link grava a data, a origem (só o domínio), o dispositivo, o sistema, o navegador e um visitante anônimo.
      O IP nunca é guardado. Robôs e prévias de link ficam fora dos números, e os acessos são guardados por 12 meses.
    </Paragraph>
    <Bullets>
      <li>
        A aba <strong>Análise</strong> de cada item mostra cliques, visitantes únicos e média por dia comparados ao período anterior, o
        gráfico com as alterações marcadas, o mapa de calor por dia e hora, origens, dispositivos, sistemas e navegadores.
      </li>
      <li>
        O botão <strong>Análise</strong> das listas de páginas e de links soma todos os itens e mostra os mais acessados.
      </li>
      <li>Os períodos vão de 24 horas a Tudo, e cada painel exporta os dados em CSV.</li>
      <li>
        A página <strong>Geral</strong> junta numa linha do tempo os acessos às páginas, os cliques nos links e os pedidos ao KV.
      </li>
    </Bullets>
  </DocSection>
);

export default AnalyticsSection;

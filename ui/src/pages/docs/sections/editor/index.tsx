import DocSection from "../../subcomponents/docSection";
import { Bullets, Code } from "../../styles";

const EditorSection = () => (
  <DocSection id="editor">
    <Bullets>
      <li>O editor mostra o código e a prévia lado a lado. No celular, alterna entre os dois. A prévia roda isolada, sem acesso ao painel.</li>
      <li>
        <Code>Ctrl+S</Code> salva e <Code>Shift+Alt+F</Code> formata o HTML. O editor sublinha erros comuns, como tag aberta sem fechamento, e
        o rodapé leva ao próximo aviso.
      </li>
      <li>Enquanto há alterações não salvas, o rascunho fica guardado no navegador. Ao reabrir a página, dá para recuperar ou descartar.</li>
      <li>
        Cada vez que o HTML muda, uma versão nova é guardada (1.0, 1.1, 1.2…), com quem salvou e uma mensagem opcional de até 80 caracteres.
        Ficam as últimas 50.
      </li>
      <li>
        A aba <strong>Versões</strong> compara uma versão com a anterior, com outra ou com o editor, e restaura uma versão antiga. Ao salvar,
        ela vira uma versão nova.
      </li>
    </Bullets>
  </DocSection>
);

export default EditorSection;

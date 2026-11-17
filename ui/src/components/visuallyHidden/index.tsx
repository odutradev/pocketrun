import { Hidden } from "./styles";
import type { VisuallyHiddenProps } from "./types";

// Texto só para leitores de tela.
const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({ children }) => <Hidden>{children}</Hidden>;

export default VisuallyHidden;

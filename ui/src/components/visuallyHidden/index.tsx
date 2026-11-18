import { Hidden } from "./styles";

import type { VisuallyHiddenProps } from "./types";

const VisuallyHidden = ({ children, role }: VisuallyHiddenProps) => <Hidden role={role}>{children}</Hidden>;

export default VisuallyHidden;

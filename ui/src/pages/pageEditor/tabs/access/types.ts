import type { PageAccessKey } from "@utils/types/sitePage";

export type AccessConfirm = { kind: "remove"; key: PageAccessKey } | { kind: "revoke" };

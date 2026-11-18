export type KvDocMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface KvDocSection {
  id: string;
  label: string;
}

export interface KvDocRoute {
  method: KvDocMethod;
  path: string;
  description: string;
  response: string;
}

export interface KvDocError {
  status: number;
  code: string;
  description: string;
}

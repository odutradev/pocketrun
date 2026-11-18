import type { Application, CreatedApplication } from "@utils/types/application";

export interface AppFormProps {
  application: Application | null;
}

export type AppFormResult = CreatedApplication | null;

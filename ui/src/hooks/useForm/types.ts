import type { ChangeEvent, FormEvent } from "react";
import type { z } from "zod";

export type FormSchema = z.ZodType<Record<string, unknown>, Record<string, unknown>>;

export type FormErrors<TValues> = Partial<Record<keyof TValues, string>>;

export interface UseFormOptions<TSchema extends FormSchema> {
  schema: TSchema;
  initialValues: z.input<TSchema>;
  onSubmit: (values: z.output<TSchema>) => Promise<unknown> | unknown;
}

export interface UseFormReturn<TSchema extends FormSchema> {
  values: z.input<TSchema>;
  errors: FormErrors<z.input<TSchema>>;
  isSubmitting: boolean;
  setFieldValue: <TKey extends keyof z.input<TSchema>>(field: TKey, value: z.input<TSchema>[TKey]) => void;
  handleChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (event?: FormEvent) => Promise<void>;
  reset: () => void;
}

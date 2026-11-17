import { useCallback, useState } from "react";

import type { FormErrors, FormSchema, UseFormOptions, UseFormReturn } from "./types";
import type { ChangeEvent, FormEvent } from "react";
import type { z } from "zod";

const toFieldErrors = <TValues>(issues: z.core.$ZodIssue[]): FormErrors<TValues> =>
  issues.reduce<FormErrors<TValues>>((errors, issue) => {
    const field = String(issue.path[0] ?? "") as keyof TValues;
    return errors[field] ? errors : { ...errors, [field]: issue.message };
  }, {});

const useForm = <TSchema extends FormSchema>({
  schema,
  initialValues,
  onSubmit
}: UseFormOptions<TSchema>): UseFormReturn<TSchema> => {
  type Values = z.input<TSchema>;

  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<FormErrors<Values>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setFieldValue = useCallback(<TKey extends keyof Values>(field: TKey, value: Values[TKey]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }, []);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFieldValue(event.target.name as keyof Values, event.target.value as Values[keyof Values]),
    [setFieldValue]
  );

  const handleSubmit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      event?.stopPropagation();
      const result = schema.safeParse(values);
      if (!result.success) {
        setErrors(toFieldErrors<Values>(result.error.issues));
        return;
      }

      setErrors({});
      setIsSubmitting(true);
      try {
        await onSubmit(result.data);
      } finally {
        setIsSubmitting(false);
      }
    },
    [schema, values, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return { values, errors, isSubmitting, setFieldValue, handleChange, handleSubmit, reset };
};

export default useForm;

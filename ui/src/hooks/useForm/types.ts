import type { ChangeEvent, FormEvent } from 'react'

export type ValidationRules<T> = {
  [K in keyof T]?: (value: T[K], allValues: T) => string | undefined
}

export interface UseFormOptions<T> {
  initialValues: T
  validationRules?: ValidationRules<T>
  onSubmit: (values: T) => Promise<void> | void
}

export interface UseFormReturn<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  handleChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void
  handleBlur: (field: keyof T) => void
  handleSubmit: (event?: FormEvent) => Promise<void>
  resetForm: () => void
  setErrors: (errors: Partial<Record<keyof T, string>>) => void
}

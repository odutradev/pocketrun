import { useState, useCallback } from 'react'

import type { UseFormOptions, UseFormReturn } from './types'
import type { ChangeEvent, FormEvent } from 'react'

export const useForm = <T extends Record<string, unknown>>({
  initialValues,
  validationRules,
  onSubmit
}: UseFormOptions<T>): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const validateField = useCallback(
    <K extends keyof T>(field: K, value: T[K], allValues: T): string | undefined => {
      const rule = validationRules?.[field]
      if (!rule) return undefined
      return rule(value, allValues)
    },
    [validationRules]
  )

  const validateAll = useCallback(
    (currentValues: T): Partial<Record<keyof T, string>> => {
      if (!validationRules) return {}
      const newErrors: Partial<Record<keyof T, string>> = {}

      for (const key of Object.keys(validationRules) as Array<keyof T>) {
        const error = validateField(key, currentValues[key], currentValues)
        if (error) {
          newErrors[key] = error
        }
      }

      return newErrors
    },
    [validationRules, validateField]
  )

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = event.target
      const resolvedValue = type === 'checkbox' ? (event.target as HTMLInputElement).checked : value

      setValues((prev) => {
        const updated = { ...prev, [name]: resolvedValue }
        if (touched[name as keyof T]) {
          const fieldError = validateField(name as keyof T, resolvedValue as T[keyof T], updated)
          setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: fieldError
          }))
        }
        return updated
      })
    },
    [touched, validateField]
  )

  const setFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues((prev) => {
        const updated = { ...prev, [field]: value }
        if (touched[field]) {
          const fieldError = validateField(field, value, updated)
          setErrors((prevErrors) => ({
            ...prevErrors,
            [field]: fieldError
          }))
        }
        return updated
      })
    },
    [touched, validateField]
  )

  const handleBlur = useCallback(
    (field: keyof T) => {
      setTouched((prev) => ({ ...prev, [field]: true }))
      const fieldError = validateField(field, values[field], values)
      setErrors((prev) => ({
        ...prev,
        [field]: fieldError
      }))
    },
    [values, validateField]
  )

  const handleSubmit = useCallback(
    async (event?: FormEvent) => {
      if (event) {
        event.preventDefault()
      }

      const allTouched = Object.keys(values).reduce<Partial<Record<keyof T, boolean>>>(
        (acc, key) => {
          acc[key as keyof T] = true
          return acc
        },
        {}
      )
      setTouched(allTouched)

      const validationErrors = validateAll(values)
      setErrors(validationErrors)

      if (Object.keys(validationErrors).length > 0) {
        return
      }

      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } finally {
        setIsSubmitting(false)
      }
    },
    [values, validateAll, onSubmit]
  )

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    setFieldValue,
    handleBlur,
    handleSubmit,
    resetForm,
    setErrors
  }
}

export default useForm

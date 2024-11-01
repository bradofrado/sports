import { z } from 'zod'

const jsonSchema = z
  .string()
  .refine((value) => {
    try {
      JSON.parse(value)
      return true
    } catch {
      return false
    }
  })
  .transform((value) => JSON.parse(value))

export type SchemaMap = { [key: string]: z.ZodTypeAny }

export function createQuerySchema<T extends SchemaMap>(schemaMap: T) {
  return <K extends keyof T>(
    param: K,
    searchParams: Record<string, string> | undefined
  ): z.infer<T[K]> => {
    const schema = schemaMap[param]
    const value = searchParams?.[param as string]

    return schema.parse(value)
  }
}

export function createJsonSchema<T extends z.ZodTypeAny>(schema: T) {
  return jsonSchema.optional().pipe(schema)
}

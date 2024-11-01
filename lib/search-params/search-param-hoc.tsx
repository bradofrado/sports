import { z } from 'zod'
import { createQuerySchema, SchemaMap } from './utils'

export function withSearchParams<T extends SchemaMap>(
  Component: React.FunctionComponent<{ [key in keyof T]: z.infer<T[key]> }>,
  schemaMap: T
) {
  const parseSearchParams = createQuerySchema(schemaMap)
  return function SearchParamPage(props: {
    searchParams?: Record<string, string>
  }) {
    const searchParams = props.searchParams
    const parsedProps = Object.keys(schemaMap).reduce<{
      [key in keyof T]: z.infer<T[key]>
    }>((acc, key) => {
      acc[key as keyof T] = parseSearchParams(key, searchParams)
      return acc
    }, {} as { [key in keyof T]: z.infer<T[key]> })
    return <Component {...parsedProps} />
  }
}

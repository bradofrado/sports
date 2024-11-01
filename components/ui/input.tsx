import * as React from "react"

import { cn } from "@/lib/utils"

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> & {
  onChange: (value: string) => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onChange, ...props }, ref) => {
    const formattedChange =
      (onChange: (value: string) => void) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        onChange(value)
      }
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onChange={formattedChange(onChange)}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

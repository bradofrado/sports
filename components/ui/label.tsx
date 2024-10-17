'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cva, type VariantProps } from 'class-variance-authority'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants> & {
      tooltip?: React.ReactNode
    }
>(({ className, tooltip, ...props }, ref) => (
  <div className='flex items-center gap-2'>
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants(), className)}
      {...props}
    />
    {tooltip ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <QuestionMarkCircleIcon className='h-4 w-4' />
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    ) : null}
  </div>
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }

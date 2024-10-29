'use client'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
} from '@/components/ui/drawer'
import { useQueryState } from '@/hooks/query-state'

export const SimulateDrawer: React.FunctionComponent<{
  children?: React.ReactNode
}> = ({ children }) => {
  const [open, setOpen] = useQueryState<number | undefined>({ key: 'drawer' })
  return (
    <Drawer
      direction='right'
      open={Boolean(open)}
      onOpenChange={(open) => {
        if (!open) setOpen(undefined)
      }}
    >
      <DrawerContent className='h-screen top-0 right-0 left-auto !mt-0 max-w-[500px] w-auto lg:w-[500px] rounded-none overflow-auto'>
        {children}
        <DrawerFooter>
          <DrawerClose asChild>
            <Button className='w-full' variant='outline'>
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

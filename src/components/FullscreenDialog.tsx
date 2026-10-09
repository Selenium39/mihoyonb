'use client'

import { useState, useEffect } from 'react'
import { X, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface FullscreenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  showMinimize?: boolean
  onMinimize?: () => void
}

export function FullscreenDialog({ 
  open, 
  onOpenChange, 
  title, 
  children, 
  showMinimize = false,
  onMinimize 
}: FullscreenDialogProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (open) {
      setIsFullscreen(true)
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    } else {
      setIsFullscreen(false)
      // Restore body scroll
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleMinimize = () => {
    onMinimize?.()
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-screen h-screen max-w-none max-h-none p-0 border-none rounded-none"
      >
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-muted/50 flex-shrink-0">
            <h2 className="text-lg font-semibold text-foreground">
              {title}
            </h2>
            <div className="flex items-center gap-2">
              {showMinimize && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMinimize}
                  className="h-8 w-8"
                  title="最小化"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8"
                title="关闭"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FullscreenDialog
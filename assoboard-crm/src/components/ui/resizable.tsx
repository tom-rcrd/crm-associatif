"use client"

import * as React from "react"
import { GripVertical } from "lucide-react"

import { cn } from "@/lib/utils"

// Import dynamique pour éviter les problèmes de types
type PanelGroupProps = {
  className?: string
  direction?: "horizontal" | "vertical"
  children?: React.ReactNode
  [key: string]: any
}

type PanelProps = {
  className?: string
  defaultSize?: number
  minSize?: number
  maxSize?: number
  children?: React.ReactNode
  [key: string]: any
}

type PanelResizeHandleProps = {
  className?: string
  withHandle?: boolean
  [key: string]: any
}

const ResizablePanelGroup = React.forwardRef<HTMLDivElement, PanelGroupProps>(
  ({ className, ...props }, ref) => {
    const { PanelGroup } = require("react-resizable-panels")
    return (
      <PanelGroup
        ref={ref}
        className={cn(
          "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
          className
        )}
        {...props}
      />
    )
  }
)
ResizablePanelGroup.displayName = "ResizablePanelGroup"

const ResizablePanel = React.forwardRef<HTMLDivElement, PanelProps>(
  (props, ref) => {
    const { Panel } = require("react-resizable-panels")
    return <Panel ref={ref} {...props} />
  }
)
ResizablePanel.displayName = "ResizablePanel"

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: PanelResizeHandleProps) => {
  const { PanelResizeHandle } = require("react-resizable-panels")
  return (
    <PanelResizeHandle
      className={cn(
        "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
          <GripVertical className="h-2.5 w-2.5" />
        </div>
      )}
    </PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
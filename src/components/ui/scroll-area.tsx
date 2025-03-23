
import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
    viewportRef?: React.RefObject<HTMLDivElement>;
    type?: "auto" | "always" | "scroll" | "hover";
    orientation?: "vertical" | "horizontal" | "both";
  }
>(({ className, children, viewportRef, type = "auto", orientation = "vertical", ...props }, ref) => {
  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      type={type}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        className="h-full w-full rounded-[inherit]"
        style={{ 
          scrollbarGutter: 'stable',
          scrollbarWidth: 'thin'
        }}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar 
        orientation="vertical" 
        forceMount={type === "always"}
      />
      {(orientation === "horizontal" || orientation === "both") && (
        <ScrollBar 
          orientation="horizontal" 
          forceMount={type === "always"}
        />
      )}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
})
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", forceMount = false, ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-4 border-l border-l-transparent p-[2px]",
      orientation === "horizontal" &&
        "h-4 flex-col border-t border-t-transparent p-[2px]",
      className
    )}
    forceMount={forceMount}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb 
      className={cn(
        "relative rounded-full bg-border",
        orientation === "vertical" ? "w-2" : "h-2"
      )}
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }

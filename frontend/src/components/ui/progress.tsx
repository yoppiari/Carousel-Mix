import * as React from "react"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number
    max?: number
  }
>(({ className, value = 0, max = 100, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-gray-200",
      className
    )}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-blue-600 transition-all duration-300"
      style={{
        transform: `translateX(-${100 - (value || 0)}%)`,
      }}
    />
  </div>
))
Progress.displayName = "Progress"

export { Progress }
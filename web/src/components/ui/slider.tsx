import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  className?: string
  disabled?: boolean
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value = [0], onValueChange, min = 0, max = 100, step = 1, disabled = false }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value)
      onValueChange?.([newValue])
    }

    // Calculate percentage for gradient
    const percentage = ((value[0] - min) / (max - min)) * 100

    return (
      <div className={cn("relative w-full h-8 flex items-center", className)}>
        {/* Track background - gray */}
        <div className="absolute inset-x-0 h-2 bg-gray-200 dark:bg-gray-700 rounded-full pointer-events-none" />

        {/* Filled track - primary color */}
        <div
          className="absolute left-0 h-2 bg-primary rounded-full transition-all pointer-events-none"
          style={{ width: `${percentage}%` }}
        />

        {/* Range input */}
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "relative w-full h-2 bg-transparent appearance-none cursor-pointer",
            "focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary",
            "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white",
            "[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer",
            "[&::-webkit-slider-thumb]:transition-shadow",
            "focus:[&::-webkit-slider-thumb]:ring-4 focus:[&::-webkit-slider-thumb]:ring-primary/20",
            "[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5",
            "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary",
            "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white",
            "[&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer",
            "[&::-moz-range-thumb]:transition-shadow",
            "focus:[&::-moz-range-thumb]:ring-4 focus:[&::-moz-range-thumb]:ring-primary/20"
          )}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }

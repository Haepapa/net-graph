"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { RotateCcw, Settings } from "lucide-react"

interface SpacingControlsProps {
  nodeSpacing: number
  onSpacingChange: (spacing: number) => void
  onReorganize: () => void
}

// Updated spacing range: minimum 500px, maximum 4000px
const sliderValueToSpacing = (value: number): number => {
  return 4000 - (value / 100) * 3500 // Range: 4000px (left) to 500px (right)
}

const spacingToSliderValue = (spacing: number): number => {
  return Math.round(((4000 - spacing) / 3500) * 100)
}

export function SpacingControls({ nodeSpacing, onSpacingChange, onReorganize }: SpacingControlsProps) {
  const currentSliderValue = spacingToSliderValue(nodeSpacing)

  const handleSliderChange = (values: number[]) => {
    const sliderValue = values[0]
    const newSpacing = sliderValueToSpacing(sliderValue)
    onSpacingChange(newSpacing)
  }

  return (
    <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-card-foreground flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Node Spacing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/30 rounded-lg p-3">
          <Slider
            value={[currentSliderValue]}
            onValueChange={handleSliderChange}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        <Button onClick={onReorganize} variant="outline" size="sm" className="w-full">
          <RotateCcw className="w-3 h-3 mr-2" />
          Apply New Spacing
        </Button>
      </CardContent>
    </Card>
  )
}

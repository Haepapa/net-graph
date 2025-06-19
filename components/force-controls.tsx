"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Play, Pause, RotateCcw, Zap, Info, Settings } from "lucide-react"

interface ForceControlsProps {
  isSimulationRunning: boolean
  onToggleSimulation: () => void
  onRestartSimulation: () => void
  onConfigChange: (config: any) => void
  config: {
    repulsionStrength: number
    maxRepulsionDistance: number
    linkStrength: number
    linkDistance: number
    uniformSpacingStrength: number
    idealSpacing: number
    damping: number
  }
  averageDistance?: number
  idealSpacing?: number
}

export function ForceControls({
  isSimulationRunning,
  onToggleSimulation,
  onRestartSimulation,
  onConfigChange,
  config,
  averageDistance,
  idealSpacing,
}: ForceControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [customSpacing, setCustomSpacing] = useState(config.idealSpacing.toString())

  const handleCustomSpacingChange = (value: string) => {
    setCustomSpacing(value)
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue >= 50 && numValue <= 1000) {
      onConfigChange({ idealSpacing: numValue })
    }
  }

  const handleCustomSpacingBlur = () => {
    const numValue = Number.parseFloat(customSpacing)
    if (isNaN(numValue) || numValue < 50 || numValue > 1000) {
      // Reset to current config value if invalid
      setCustomSpacing(config.idealSpacing.toString())
    }
  }

  return (
    <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-card-foreground flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Force Simulation
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-xs">
            {isExpanded ? "Less" : "More"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button
            onClick={onToggleSimulation}
            variant={isSimulationRunning ? "destructive" : "default"}
            size="sm"
            className="flex-1"
          >
            {isSimulationRunning ? (
              <>
                <Pause className="w-3 h-3 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button onClick={onRestartSimulation} variant="outline" size="sm" className="flex-1">
            <RotateCcw className="w-3 h-3 mr-2" />
            Restart
          </Button>
        </div>

        {/* Target Spacing Control */}
        <div className="bg-muted/30 rounded-lg p-3 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Settings className="w-3 h-3" />
            Target Spacing
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={customSpacing}
                onChange={(e) => handleCustomSpacingChange(e.target.value)}
                onBlur={handleCustomSpacingBlur}
                min="50"
                max="1000"
                step="10"
                className="w-20 h-8 text-xs [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="400"
              />
              <div className="flex-1">
                <Slider
                  value={[config.idealSpacing]}
                  onValueChange={([value]) => {
                    onConfigChange({ idealSpacing: value })
                    setCustomSpacing(value.toString())
                  }}
                  min={50}
                  max={1000}
                  step={10}
                  className="w-full"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Enter custom target distance (50-1000)</p>
          </div>
        </div>

        {/* Spacing Info */}
        {(averageDistance !== undefined || idealSpacing !== undefined) && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Info className="w-3 h-3" />
              Spacing Analysis
            </div>
            {idealSpacing !== undefined && (
              <div className="text-xs">
                <span className="text-muted-foreground">Target Spacing:</span>{" "}
                <span className="font-mono text-foreground">{Math.round(idealSpacing)}px</span>
              </div>
            )}
            {averageDistance !== undefined && (
              <div className="text-xs">
                <span className="text-muted-foreground">Current Average:</span>{" "}
                <span className="font-mono text-foreground">{Math.round(averageDistance)}px</span>
              </div>
            )}
            {averageDistance !== undefined && idealSpacing !== undefined && (
              <div className="text-xs">
                <span className="text-muted-foreground">Difference:</span>{" "}
                <span
                  className={`font-mono ${Math.abs(averageDistance - idealSpacing) < 20 ? "text-green-600" : "text-amber-600"}`}
                >
                  {Math.round(Math.abs(averageDistance - idealSpacing))}px
                </span>
              </div>
            )}
          </div>
        )}

        {isExpanded && (
          <div className="space-y-4 pt-2 border-t border-border">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Repulsion Strength: {config.repulsionStrength}
              </label>
              <Slider
                value={[config.repulsionStrength]}
                onValueChange={([value]) => onConfigChange({ repulsionStrength: value })}
                min={100}
                max={1500}
                step={50}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">How strongly nodes push apart</p>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Max Repulsion Distance: {config.maxRepulsionDistance}px
              </label>
              <Slider
                value={[config.maxRepulsionDistance]}
                onValueChange={([value]) => onConfigChange({ maxRepulsionDistance: value })}
                min={50}
                max={300}
                step={10}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">Maximum distance for repulsion effect</p>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Uniform Spacing: {config.uniformSpacingStrength.toFixed(3)}
              </label>
              <Slider
                value={[config.uniformSpacingStrength * 1000]}
                onValueChange={([value]) => onConfigChange({ uniformSpacingStrength: value / 1000 })}
                min={10}
                max={200}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">Force to equalize node spacing</p>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Link Strength: {config.linkStrength.toFixed(2)}
              </label>
              <Slider
                value={[config.linkStrength * 100]}
                onValueChange={([value]) => onConfigChange({ linkStrength: value / 100 })}
                min={1}
                max={50}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">How strongly connected nodes attract</p>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Link Distance: {config.linkDistance}px
              </label>
              <Slider
                value={[config.linkDistance]}
                onValueChange={([value]) => onConfigChange({ linkDistance: value })}
                min={50}
                max={300}
                step={10}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">Preferred distance for connected nodes</p>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Damping: {config.damping.toFixed(2)}
              </label>
              <Slider
                value={[config.damping * 100]}
                onValueChange={([value]) => onConfigChange({ damping: value / 100 })}
                min={85}
                max={98}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">How quickly the simulation stabilizes</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

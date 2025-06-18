"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LegendInputProps {
  onLegendUpdate: (legend: any[]) => void
}

export function LegendInput({ onLegendUpdate }: LegendInputProps) {
  const [legendJson, setLegendJson] = useState("")

  const handleLegendSubmit = () => {
    try {
      const legend = JSON.parse(legendJson)
      onLegendUpdate(legend)
    } catch (error) {
      alert("Invalid JSON format for legend")
    }
  }

  const sampleLegend = `[
  {
    "shape": "circle",
    "color": "bg-green-100 border-green-400",
    "label": "Start/End Points"
  },
  {
    "shape": "rectangle", 
    "color": "bg-blue-100 border-blue-400",
    "label": "Process Steps"
  },
  {
    "shape": "triangle",
    "color": "border-l-transparent border-r-transparent border-b-yellow-400",
    "label": "Decision Points"
  }
]`

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Legend Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Legend JSON:</label>
          <Textarea
            placeholder={sampleLegend}
            value={legendJson}
            onChange={(e) => setLegendJson(e.target.value)}
            className="mt-2 h-40 font-mono text-sm"
          />
        </div>
        <Button onClick={handleLegendSubmit} className="w-full">
          Update Legend
        </Button>
      </CardContent>
    </Card>
  )
}

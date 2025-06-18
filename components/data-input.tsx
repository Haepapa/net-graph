"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DataInputProps {
  onNodesUpdate: (nodes: any[]) => void
  onLinksUpdate: (links: any[]) => void
  onLegendUpdate: (legend: any[]) => void
}

export function DataInput({ onNodesUpdate, onLinksUpdate, onLegendUpdate }: DataInputProps) {
  const [nodesJson, setNodesJson] = useState("")
  const [linksJson, setLinksJson] = useState("")
  const [legendJson, setLegendJson] = useState("")

  const handleNodesSubmit = () => {
    try {
      const nodes = JSON.parse(nodesJson)
      onNodesUpdate(nodes)
    } catch (error) {
      alert("Invalid JSON format for nodes")
    }
  }

  const handleLinksSubmit = () => {
    try {
      const links = JSON.parse(linksJson)
      onLinksUpdate(links)
    } catch (error) {
      alert("Invalid JSON format for links")
    }
  }

  const handleLegendSubmit = () => {
    try {
      const legend = JSON.parse(legendJson)
      onLegendUpdate(legend)
    } catch (error) {
      alert("Invalid JSON format for legend")
    }
  }

  const sampleNodes = `[
  {
    "id": "1",
    "label": "Start",
    "className": "node-success",
    "shape": "circle",
    "sizeX": 70,
    "sizeY": 70
  },
  {
    "id": "2",
    "label": "Process",
    "className": "node-primary",
    "shape": "rectangle",
    "sizeX": 100,
    "sizeY": 50
  }
]`

  const sampleLinks = `[
  {
    "label": "Next",
    "direction": "left-to-right",
    "leftNodeId": "1",
    "rightNodeId": "2",
    "className": "edge-primary"
  }
]`

  const sampleLegend = `[
  {
    "shape": "circle",
    "color": "bg-green-100 border-green-400",
    "label": "Start/End Points"
  }
]`

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>JSON Data Input</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="nodes">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nodes">Nodes</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="legend">Legend</TabsTrigger>
          </TabsList>

          <TabsContent value="nodes" className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nodes JSON:</label>
              <Textarea
                placeholder={sampleNodes}
                value={nodesJson}
                onChange={(e) => setNodesJson(e.target.value)}
                className="mt-2 h-40 font-mono text-sm"
              />
            </div>
            <Button onClick={handleNodesSubmit} className="w-full">
              Update Nodes
            </Button>
          </TabsContent>

          <TabsContent value="links" className="space-y-4">
            <div>
              <label className="text-sm font-medium">Links JSON:</label>
              <Textarea
                placeholder={sampleLinks}
                value={linksJson}
                onChange={(e) => setLinksJson(e.target.value)}
                className="mt-2 h-40 font-mono text-sm"
              />
            </div>
            <Button onClick={handleLinksSubmit} className="w-full">
              Update Links
            </Button>
          </TabsContent>

          <TabsContent value="legend" className="space-y-4">
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Filter } from "lucide-react"
import type { NodeData } from "@/lib/types"

interface NodeDetailsPopupProps {
  node: NodeData | null
  onClose: () => void
  onFilter: (nodeId: string) => void
}

export function NodeDetailsPopup({ node, onClose, onFilter }: NodeDetailsPopupProps) {
  if (!node) return null

  const handleFilter = () => {
    onFilter(node.id)
    onClose() // Close popup after filtering
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <Card className="w-96 max-w-[90vw] bg-card border-border shadow-xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg font-semibold text-card-foreground">Node Details</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Label</label>
            <p className="text-sm text-foreground mt-1">{node.label}</p>
          </div>

          {node.type && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Type</label>
              <p className="text-sm text-foreground mt-1">{node.type}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-muted-foreground">Style Class</label>
            <p className="text-sm text-foreground font-mono bg-muted px-2 py-1 rounded mt-1">
              {node.className || "node-default"}
            </p>
          </div>

          <div className="pt-2 border-t border-border">
            <Button onClick={handleFilter} className="w-full" size="sm">
              <Filter className="w-3 h-3 mr-2" />
              Filter Connected Nodes
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">Show only this node and its connections</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

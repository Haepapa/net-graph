"use client"

import type React from "react"
import { useState, useRef, useCallback, useMemo } from "react"
import { toPng } from "html-to-image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Maximize, Download, ChevronLeft, ChevronRight, RotateCcw, Sun, Moon } from "lucide-react"

import { useGraphData } from "@/hooks/use-graph-data"
import { useTheme } from "@/hooks/use-theme"
import { getNodeConnectionPoint, calculateAutoFit, reorganizeNodes } from "@/lib/graph-utils"
import type { NodeData, LinkData } from "@/lib/types"

// Node Components with optimized drag handling
const CircleNode = ({
  node,
  onDragStart,
  onDragMove,
  onDragEnd,
  isDragging,
}: {
  node: NodeData
  onDragStart: (id: string, startX: number, startY: number) => void
  onDragMove: (clientX: number, clientY: number) => void
  onDragEnd: () => void
  isDragging: boolean
}) => {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onDragStart(node.id, e.clientX, e.clientY)

      const handleMouseMove = (e: MouseEvent) => {
        onDragMove(e.clientX, e.clientY)
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        onDragEnd()
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [node.id, onDragStart, onDragMove, onDragEnd],
  )

  return (
    <div
      className={`absolute rounded-full border-2 flex items-center justify-center text-sm font-semibold cursor-move select-none transition-all duration-200 hover:scale-105 hover:shadow-lg ${
        node.className || "node-default"
      } ${isDragging ? "opacity-75 scale-105 shadow-xl z-50" : "shadow-md"}`}
      style={{
        left: node.x - (node.sizeX || 80) / 2,
        top: node.y - (node.sizeY || 80) / 2,
        width: node.sizeX || 80,
        height: node.sizeY || 80,
        pointerEvents: "all",
      }}
      onMouseDown={handleMouseDown}
    >
      {node.label}
    </div>
  )
}

const RectangleNode = ({
  node,
  onDragStart,
  onDragMove,
  onDragEnd,
  isDragging,
}: {
  node: NodeData
  onDragStart: (id: string, startX: number, startY: number) => void
  onDragMove: (clientX: number, clientY: number) => void
  onDragEnd: () => void
  isDragging: boolean
}) => {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onDragStart(node.id, e.clientX, e.clientY)

      const handleMouseMove = (e: MouseEvent) => {
        onDragMove(e.clientX, e.clientY)
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        onDragEnd()
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [node.id, onDragStart, onDragMove, onDragEnd],
  )

  return (
    <div
      className={`absolute rounded-xl border-2 flex items-center justify-center text-sm font-semibold cursor-move select-none transition-all duration-200 hover:scale-105 hover:shadow-lg ${
        node.className || "node-default"
      } ${isDragging ? "opacity-75 scale-105 shadow-xl z-50" : "shadow-md"}`}
      style={{
        left: node.x - (node.sizeX || 120) / 2,
        top: node.y - (node.sizeY || 60) / 2,
        width: node.sizeX || 120,
        height: node.sizeY || 60,
        pointerEvents: "all",
      }}
      onMouseDown={handleMouseDown}
    >
      {node.label}
    </div>
  )
}

const TriangleNode = ({
  node,
  onDragStart,
  onDragMove,
  onDragEnd,
  isDragging,
}: {
  node: NodeData
  onDragStart: (id: string, startX: number, startY: number) => void
  onDragMove: (clientX: number, clientY: number) => void
  onDragEnd: () => void
  isDragging: boolean
}) => {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onDragStart(node.id, e.clientX, e.clientY)

      const handleMouseMove = (e: MouseEvent) => {
        onDragMove(e.clientX, e.clientY)
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        onDragEnd()
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [node.id, onDragStart, onDragMove, onDragEnd],
  )

  const size = node.sizeX || 70
  const triangleSize = size * 0.6

  return (
    <div
      className={`absolute flex items-center justify-center cursor-move select-none transition-all duration-200 hover:scale-105 ${
        isDragging ? "opacity-75 scale-105 z-50" : ""
      }`}
      style={{
        left: node.x - size / 2,
        top: node.y - size / 2,
        width: size,
        height: size,
        pointerEvents: "all",
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="relative">
        <svg width={triangleSize} height={triangleSize} className="drop-shadow-md">
          <polygon
            points={`${triangleSize / 2},5 ${triangleSize - 5},${triangleSize - 5} 5,${triangleSize - 5}`}
            className={node.className || "node-default"}
            stroke="currentColor"
            strokeWidth="2"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold mt-2">
          {node.label}
        </span>
      </div>
    </div>
  )
}

// SVG Link Component
const SVGLink = ({ link, nodes }: { link: LinkData; nodes: NodeData[] }) => {
  const sourceNode = nodes.find((n) => n.id === link.leftNodeId)
  const targetNode = nodes.find((n) => n.id === link.rightNodeId)

  if (!sourceNode || !targetNode) return null

  const sourcePoint = getNodeConnectionPoint(sourceNode, targetNode.x, targetNode.y)
  const targetPoint = getNodeConnectionPoint(targetNode, sourceNode.x, sourceNode.y)

  const x1 = sourcePoint.x
  const y1 = sourcePoint.y
  const x2 = targetPoint.x
  const y2 = targetPoint.y

  const dx = x2 - x1
  const dy = y2 - y1
  const distance = Math.sqrt(dx * dx + dy * dy)
  const curvature = Math.min(distance * 0.3, 100)

  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2

  const controlX1 = x1 + (dx > 0 ? curvature : -curvature)
  const controlY1 = y1
  const controlX2 = x2 - (dx > 0 ? curvature : -curvature)
  const controlY2 = y2

  const pathData = `M ${x1} ${y1} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${x2} ${y2}`

  const labelX = midX
  const labelY = midY - 8

  return (
    <g className={`link ${link.className || "link-default"}`}>
      <path
        d={pathData}
        fill="none"
        className="link-path"
        strokeWidth="3"
        markerEnd={link.direction !== "right-to-left" ? `url(#arrowhead-${link.className || "default"})` : undefined}
        markerStart={
          link.direction === "right-to-left" || link.direction === "two-way"
            ? `url(#arrowhead-${link.className || "default"})`
            : undefined
        }
      />
      <rect
        x={labelX - link.label.length * 4}
        y={labelY - 8}
        width={link.label.length * 8}
        height={16}
        rx="8"
        className="link-label-bg"
      />
      <text x={labelX} y={labelY + 1} textAnchor="middle" className="link-label-text">
        {link.label}
      </text>
    </g>
  )
}

// Zoom Controls Component
const ZoomControls = ({
  onZoomIn,
  onZoomOut,
  onAutoFit,
}: { onZoomIn: () => void; onZoomOut: () => void; onAutoFit: () => void }) => {
  return (
    <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 bg-background/90 backdrop-blur-sm rounded-lg p-1 shadow-md border border-border">
      <button
        onClick={onZoomIn}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        title="Zoom In"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>
      <button
        onClick={onZoomOut}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        title="Zoom Out"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>
      <button
        onClick={onAutoFit}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        title="Fit to Screen"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      </button>
    </div>
  )
}

export default function NetworkGraph() {
  const { nodes, links, legendData, isLoading, error, setNodes } = useGraphData()
  const { theme, toggleTheme } = useTheme()
  const [isPanelMinimized, setIsPanelMinimized] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [draggingNode, setDraggingNode] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Optimized node drag handlers
  const handleNodeDragStart = useCallback(
    (nodeId: string, startX: number, startY: number) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      setDraggingNode(nodeId)

      // Calculate offset between mouse and node center
      const containerX = startX - rect.left
      const containerY = startY - rect.top
      const nodeScreenX = node.x * zoom + pan.x
      const nodeScreenY = node.y * zoom + pan.y

      setDragOffset({
        x: containerX - nodeScreenX,
        y: containerY - nodeScreenY,
      })
    },
    [nodes, zoom, pan],
  )

  const handleNodeDragMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!draggingNode) return

      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      // Convert screen coordinates to graph coordinates with offset
      const containerX = clientX - rect.left - dragOffset.x
      const containerY = clientY - rect.top - dragOffset.y
      const graphX = (containerX - pan.x) / zoom
      const graphY = (containerY - pan.y) / zoom

      setNodes((prev) => prev.map((node) => (node.id === draggingNode ? { ...node, x: graphX, y: graphY } : node)))
    },
    [draggingNode, dragOffset, pan, zoom, setNodes],
  )

  const handleNodeDragEnd = useCallback(() => {
    setDraggingNode(null)
    setDragOffset({ x: 0, y: 0 })
  }, [])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
      const newZoom = Math.max(0.1, Math.min(3, zoom * zoomFactor))

      const newPan = {
        x: mouseX - (mouseX - pan.x) * (newZoom / zoom),
        y: mouseY - (mouseY - pan.y) * (newZoom / zoom),
      }

      setZoom(newZoom)
      setPan(newPan)
    },
    [zoom, pan],
  )

  // Fixed canvas panning with proper event handling
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only start panning if we're not clicking on a node
      if (draggingNode) return

      const target = e.target as HTMLElement

      // Check if we clicked on a node or its children
      if (target.closest("[data-node-id]") || target.style.pointerEvents === "all") {
        return
      }

      e.preventDefault()
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    },
    [draggingNode],
  )

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning && !draggingNode) {
        e.preventDefault()
        const deltaX = e.clientX - lastPanPoint.x
        const deltaY = e.clientY - lastPanPoint.y
        setPan((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }))
        setLastPanPoint({ x: e.clientX, y: e.clientY })
      }
    },
    [isPanning, lastPanPoint, draggingNode],
  )

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const handleAutoFit = useCallback(() => {
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    const result = calculateAutoFit(nodes, containerRect.width, containerRect.height)
    if (result) {
      setZoom(result.zoom)
      setPan(result.pan)
    }
  }, [nodes])

  const handleZoomIn = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const newZoom = Math.min(3, zoom * 1.2)

    const newPan = {
      x: centerX - (centerX - pan.x) * (newZoom / zoom),
      y: centerY - (centerY - pan.y) * (newZoom / zoom),
    }

    setZoom(newZoom)
    setPan(newPan)
  }, [zoom, pan])

  const handleZoomOut = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const newZoom = Math.max(0.1, zoom * 0.8)

    const newPan = {
      x: centerX - (centerX - pan.x) * (newZoom / zoom),
      y: centerY - (centerY - pan.y) * (newZoom / zoom),
    }

    setZoom(newZoom)
    setPan(newPan)
  }, [zoom, pan])

  const handleResetAndReorganize = useCallback(() => {
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    const resetNodes = reorganizeNodes(nodes, containerRect.width, containerRect.height)
    setNodes(resetNodes)
    setTimeout(handleAutoFit, 100)
  }, [nodes, setNodes, handleAutoFit])

  const handleExportPNG = useCallback(() => {
    if (containerRef.current) {
      toPng(containerRef.current, {
        backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
        width: 1200,
        height: 800,
      }).then((dataUrl) => {
        const link = document.createElement("a")
        link.download = "network-graph.png"
        link.href = dataUrl
        link.click()
      })
    }
  }, [theme])

  // Memoize rendered nodes for performance
  const renderedNodes = useMemo(() => {
    return nodes.map((node) => {
      const nodeProps = {
        node,
        onDragStart: handleNodeDragStart,
        onDragMove: handleNodeDragMove,
        onDragEnd: handleNodeDragEnd,
        isDragging: draggingNode === node.id,
      }

      if (node.shape === "circle") {
        return <CircleNode key={node.id} {...nodeProps} />
      } else if (node.shape === "rectangle") {
        return <RectangleNode key={node.id} {...nodeProps} />
      } else if (node.shape === "triangle") {
        return <TriangleNode key={node.id} {...nodeProps} />
      }
      return null
    })
  }, [nodes, draggingNode, handleNodeDragStart, handleNodeDragMove, handleNodeDragEnd])

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-background to-muted items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading network graph data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-background to-muted items-center justify-center">
        <div className="text-center">
          <div className="text-destructive mb-4">⚠️</div>
          <p className="text-foreground font-medium">Error loading graph data</p>
          <p className="text-muted-foreground text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-background to-muted">
      {/* Control Panel */}
      <div
        className={`${
          isPanelMinimized ? "w-12" : "w-64"
        } bg-card/80 backdrop-blur-sm border-r border-border transition-all duration-300 ease-in-out flex-shrink-0 shadow-sm`}
      >
        <div className={isPanelMinimized ? "p-2" : "p-4"}>
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => setIsPanelMinimized(!isPanelMinimized)}
              variant="ghost"
              size="sm"
              className={`rounded-lg hover:bg-accent transition-colors ${isPanelMinimized ? "px-2 w-full" : ""}`}
            >
              {isPanelMinimized ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              {!isPanelMinimized && <span className="ml-2 font-medium">Minimize</span>}
            </Button>

            {!isPanelMinimized && (
              <Button
                onClick={toggleTheme}
                variant="ghost"
                size="sm"
                className="rounded-lg hover:bg-accent transition-colors"
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
            )}
          </div>

          {isPanelMinimized ? (
            <div className="space-y-2">
              <Button
                onClick={toggleTheme}
                variant="ghost"
                size="sm"
                className="w-full p-2 rounded-lg hover:bg-accent transition-colors"
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
              <Button
                onClick={handleAutoFit}
                variant="ghost"
                size="sm"
                className="w-full p-2 rounded-lg hover:bg-accent transition-colors"
                title="Auto Fit"
              >
                <Maximize className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleResetAndReorganize}
                variant="ghost"
                size="sm"
                className="w-full p-2 rounded-lg hover:bg-accent transition-colors"
                title="Reorganize"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleExportPNG}
                variant="ghost"
                size="sm"
                className="w-full p-2 rounded-lg hover:bg-accent transition-colors"
                title="Export PNG"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-card-foreground">Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={handleAutoFit}
                    variant="outline"
                    size="sm"
                    className="w-full rounded-lg border-border hover:bg-accent transition-colors"
                  >
                    <Maximize className="w-3 h-3 mr-2" />
                    Auto Fit
                  </Button>
                  <Button
                    onClick={handleResetAndReorganize}
                    variant="outline"
                    size="sm"
                    className="w-full rounded-lg border-border hover:bg-accent transition-colors"
                  >
                    <RotateCcw className="w-3 h-3 mr-2" />
                    Reorganize
                  </Button>
                  <Button
                    onClick={handleExportPNG}
                    size="sm"
                    className="w-full rounded-lg bg-primary hover:bg-primary/90 transition-colors"
                  >
                    <Download className="w-3 h-3 mr-2" />
                    Export PNG
                  </Button>
                </CardContent>
              </Card>

              <Card className="mt-4 border-0 shadow-sm bg-card/60 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-card-foreground">Legend</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {legendData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {item.shape === "circle" && (
                        <div className={`w-4 h-4 rounded-full ${item.color} shadow-sm`}></div>
                      )}
                      {item.shape === "rectangle" && <div className={`w-5 h-3 rounded ${item.color} shadow-sm`}></div>}
                      {item.shape === "triangle" && (
                        <div className="w-4 h-4 flex items-center justify-center">
                          <svg width="14" height="14">
                            <polygon points="7,1 13,11 1,11" className={`${item.color} shadow-sm`} />
                          </svg>
                        </div>
                      )}
                      <span className="text-muted-foreground font-medium">{item.label}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 relative overflow-hidden bg-card rounded-tl-2xl shadow-inner" ref={containerRef}>
        <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onAutoFit={handleAutoFit} />

        <div
          className="graph-container absolute inset-0 cursor-grab active:cursor-grabbing"
          onWheel={handleWheel}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        >
          <svg
            className="absolute pointer-events-none"
            style={{
              left: -5000,
              top: -5000,
              width: 10000,
              height: 10000,
              zIndex: 1,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "5000px 5000px",
            }}
          >
            <defs>
              <marker id="arrowhead-link-primary" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
                <polygon points="0 0, 12 4, 0 8" className="fill-blue-500" />
              </marker>
              <marker id="arrowhead-link-success" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
                <polygon points="0 0, 12 4, 0 8" className="fill-emerald-500" />
              </marker>
              <marker id="arrowhead-link-warning" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
                <polygon points="0 0, 12 4, 0 8" className="fill-amber-500" />
              </marker>
              <marker id="arrowhead-link-danger" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
                <polygon points="0 0, 12 4, 0 8" className="fill-rose-500" />
              </marker>
              <marker id="arrowhead-link-info" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
                <polygon points="0 0, 12 4, 0 8" className="fill-cyan-500" />
              </marker>
              <marker id="arrowhead-default" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
                <polygon points="0 0, 12 4, 0 8" className="fill-slate-400" />
              </marker>
            </defs>
            <g transform="translate(5000, 5000)">
              {links.map((link) => (
                <SVGLink key={link.id} link={link} nodes={nodes} />
              ))}
            </g>
          </svg>

          <div
            className="absolute inset-0"
            style={{
              zIndex: 2,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
              pointerEvents: "none",
            }}
          >
            {renderedNodes}
          </div>

          <div
            className="absolute inset-0 opacity-30"
            style={{
              zIndex: 0,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
              pointerEvents: "none",
            }}
          >
            <svg className="w-full h-full">
              <defs>
                <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path
                    d="M 24 0 L 0 0 0 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className={theme === "dark" ? "grid-pattern" : ""}
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        <div className="absolute bottom-3 left-3 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
          <div>Drag to pan • Mouse wheel to zoom • Drag nodes to move</div>
        </div>
      </div>
    </div>
  )
}

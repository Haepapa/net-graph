"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { toPng } from "html-to-image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Maximize, Download, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"

import { useGraphData } from "@/hooks/use-graph-data"
import { getNodeConnectionPoint, calculateAutoFit, reorganizeNodes } from "@/lib/graph-utils"
import type { NodeData, LinkData } from "@/lib/types"

// Node Components
const CircleNode = ({
  node,
  onDrag,
  isDragging,
}: { node: NodeData; onDrag: (id: string, x: number, y: number) => void; isDragging: boolean }) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX - node.x
    const startY = e.clientY - node.y

    const handleMouseMove = (e: MouseEvent) => {
      onDrag(node.id, e.clientX - startX, e.clientY - startY)
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  return (
    <div
      className={`absolute rounded-full border-2 flex items-center justify-center text-sm font-semibold cursor-move select-none transition-all duration-200 hover:scale-105 hover:shadow-lg ${
        node.className || "node-default"
      } ${isDragging ? "opacity-75 scale-105 shadow-xl" : "shadow-md"}`}
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
  onDrag,
  isDragging,
}: { node: NodeData; onDrag: (id: string, x: number, y: number) => void; isDragging: boolean }) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX - node.x
    const startY = e.clientY - node.y

    const handleMouseMove = (e: MouseEvent) => {
      onDrag(node.id, e.clientX - startX, e.clientY - startY)
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  return (
    <div
      className={`absolute rounded-xl border-2 flex items-center justify-center text-sm font-semibold cursor-move select-none transition-all duration-200 hover:scale-105 hover:shadow-lg ${
        node.className || "node-default"
      } ${isDragging ? "opacity-75 scale-105 shadow-xl" : "shadow-md"}`}
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
  onDrag,
  isDragging,
}: { node: NodeData; onDrag: (id: string, x: number, y: number) => void; isDragging: boolean }) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX - node.x
    const startY = e.clientY - node.y

    const handleMouseMove = (e: MouseEvent) => {
      onDrag(node.id, e.clientX - startX, e.clientY - startY)
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const size = node.sizeX || 70
  const triangleSize = size * 0.6

  return (
    <div
      className={`absolute flex items-center justify-center cursor-move select-none transition-all duration-200 hover:scale-105 ${
        isDragging ? "opacity-75 scale-105" : ""
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
const ZoomControls = ({ onAutoFit }: { onAutoFit: () => void }) => {
  return (
    <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-md border border-slate-200/60">
      <button
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-800"
        title="Zoom In (Mouse Wheel)"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>
      <button
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-800"
        title="Zoom Out (Mouse Wheel)"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>
      <button
        onClick={onAutoFit}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-800"
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
  const [isPanelMinimized, setIsPanelMinimized] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [draggingNode, setDraggingNode] = useState<string | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleNodeDrag = useCallback(
    (nodeId: string, x: number, y: number) => {
      setDraggingNode(nodeId)
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                x: (x - pan.x) / zoom,
                y: (y - pan.y) / zoom,
              }
            : node,
        ),
      )
    },
    [zoom, pan, setNodes],
  )

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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement

    if (target.style.pointerEvents === "all" || target.closest('[style*="pointer-events: all"]')) {
      return
    }

    if (target.closest(".absolute") && target.closest('[class*="node-"]')) {
      return
    }

    e.preventDefault()
    setIsPanning(true)
    setLastPanPoint({ x: e.clientX, y: e.clientY })
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        e.preventDefault()
        const deltaX = e.clientX - lastPanPoint.x
        const deltaY = e.clientY - lastPanPoint.y
        setPan((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }))
        setLastPanPoint({ x: e.clientX, y: e.clientY })
      }
    },
    [isPanning, lastPanPoint],
  )

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
    setDraggingNode(null)
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

  const handleResetAndReorganize = useCallback(() => {
    const resetNodes = reorganizeNodes(nodes)
    setNodes(resetNodes)
    setTimeout(handleAutoFit, 100)
  }, [nodes, setNodes, handleAutoFit])

  const handleExportPNG = useCallback(() => {
    if (containerRef.current) {
      toPng(containerRef.current, {
        backgroundColor: "#ffffff",
        width: 1200,
        height: 800,
      }).then((dataUrl) => {
        const link = document.createElement("a")
        link.download = "network-graph.png"
        link.href = dataUrl
        link.click()
      })
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading network graph data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-slate-600 font-medium">Error loading graph data</p>
          <p className="text-slate-500 text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Control Panel */}
      <div
        className={`${
          isPanelMinimized ? "w-12" : "w-64"
        } bg-white/80 backdrop-blur-sm border-r border-slate-200/60 transition-all duration-300 ease-in-out flex-shrink-0 shadow-sm`}
      >
        <div className={isPanelMinimized ? "p-2" : "p-4"}>
          <Button
            onClick={() => setIsPanelMinimized(!isPanelMinimized)}
            variant="ghost"
            size="sm"
            className={`mb-4 w-full rounded-lg hover:bg-slate-100/80 transition-colors ${
              isPanelMinimized ? "px-2" : ""
            }`}
          >
            {isPanelMinimized ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!isPanelMinimized && <span className="ml-2 font-medium">Minimize</span>}
          </Button>

          {isPanelMinimized ? (
            <div className="space-y-2">
              <Button
                onClick={handleAutoFit}
                variant="ghost"
                size="sm"
                className="w-full p-2 rounded-lg hover:bg-slate-100/80 transition-colors"
                title="Auto Fit"
              >
                <Maximize className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleResetAndReorganize}
                variant="ghost"
                size="sm"
                className="w-full p-2 rounded-lg hover:bg-slate-100/80 transition-colors"
                title="Reorganize"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleExportPNG}
                variant="ghost"
                size="sm"
                className="w-full p-2 rounded-lg hover:bg-slate-100/80 transition-colors"
                title="Export PNG"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-slate-800">Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={handleAutoFit}
                    variant="outline"
                    size="sm"
                    className="w-full rounded-lg border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <Maximize className="w-3 h-3 mr-2" />
                    Auto Fit
                  </Button>
                  <Button
                    onClick={handleResetAndReorganize}
                    variant="outline"
                    size="sm"
                    className="w-full rounded-lg border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3 mr-2" />
                    Reorganize
                  </Button>
                  <Button
                    onClick={handleExportPNG}
                    size="sm"
                    className="w-full rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    <Download className="w-3 h-3 mr-2" />
                    Export PNG
                  </Button>
                </CardContent>
              </Card>

              <Card className="mt-4 border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-800">Legend</CardTitle>
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
                      <span className="text-slate-600 font-medium">{item.label}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 relative overflow-hidden bg-white rounded-tl-2xl shadow-inner" ref={containerRef}>
        <ZoomControls onAutoFit={handleAutoFit} />

        <div
          className="graph-container absolute inset-0 cursor-grab active:cursor-grabbing"
          style={{ pointerEvents: "all" }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
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
            {nodes.map((node) => {
              if (node.shape === "circle") {
                return (
                  <CircleNode key={node.id} node={node} onDrag={handleNodeDrag} isDragging={draggingNode === node.id} />
                )
              } else if (node.shape === "rectangle") {
                return (
                  <RectangleNode
                    key={node.id}
                    node={node}
                    onDrag={handleNodeDrag}
                    isDragging={draggingNode === node.id}
                  />
                )
              } else if (node.shape === "triangle") {
                return (
                  <TriangleNode
                    key={node.id}
                    node={node}
                    onDrag={handleNodeDrag}
                    isDragging={draggingNode === node.id}
                  />
                )
              }
              return null
            })}
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
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        <div className="absolute bottom-3 left-3 text-xs text-slate-500 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
          <div>Drag to pan • Mouse wheel to zoom • Drag nodes to move</div>
        </div>
      </div>
    </div>
  )
}

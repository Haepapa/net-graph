"use client"

import React from "react"
import { useState, useRef, useCallback, useMemo, useEffect } from "react"
import { toPng } from "html-to-image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Maximize, Download, ChevronLeft, ChevronRight, RotateCcw, Sun, Moon, FilterX } from "lucide-react"

import { useGraphData } from "@/hooks/use-graph-data"
import { useTheme } from "@/hooks/use-theme"
import { getNodeConnectionPoint, calculateAutoFit, reorganizeNodes } from "@/lib/graph-utils"
import { NodeDetailsPopup } from "./node-details-popup"
import { SearchBox } from "./search-box"
import { SpacingControls } from "./spacing-controls"
import type { NodeData, LinkData } from "@/lib/types"

// Helper function to truncate labels with space stripping
const truncateLabel = (label: string, maxLength = 12): string => {
  const trimmedLabel = label.trim() // Strip leading and trailing spaces
  if (trimmedLabel.length <= maxLength) return trimmedLabel
  return "..." + trimmedLabel.slice(-(maxLength - 3))
}

// Optimized Node Components with performance improvements and zoom scaling
const CircleNode = React.memo(
  ({
    node,
    onNodeMouseDown,
    onClick,
    isDragging,
    zoom,
    pan,
    isSearchHighlighted,
    isFiltered,
  }: {
    node: NodeData
    onNodeMouseDown: (nodeId: string, e: React.MouseEvent) => void
    onClick: (node: NodeData) => void
    isDragging: boolean
    zoom: number
    pan: { x: number; y: number }
    isSearchHighlighted: boolean
    isFiltered: boolean
  }) => {
    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onNodeMouseDown(node.id, e)
      },
      [node.id, onNodeMouseDown],
    )

    // Scale node size with zoom level
    const scaledSizeX = (node.sizeX || 80) * zoom
    const scaledSizeY = (node.sizeY || 80) * zoom

    const style = useMemo(
      () => ({
        left: node.x * zoom + pan.x - scaledSizeX / 2,
        top: node.y * zoom + pan.y - scaledSizeY / 2,
        width: scaledSizeX,
        height: scaledSizeY,
        fontSize: Math.max(10, 14 * zoom), // Scale font size with zoom
        willChange: isDragging ? "transform" : "auto",
      }),
      [node.x, node.y, scaledSizeX, scaledSizeY, zoom, pan.x, pan.y, isDragging],
    )

    return (
      <div
        className={`absolute rounded-full border-2 flex items-center justify-center font-semibold cursor-move select-none transition-all duration-200 hover:scale-105 hover:shadow-lg ${
          node.className || "node-default"
        } ${isDragging ? "opacity-75 scale-105 shadow-xl z-50" : "shadow-md"} ${
          isSearchHighlighted ? "node-search-highlight" : ""
        } ${isFiltered ? "node-filtered-out" : ""}`}
        style={style}
        onMouseDown={handleMouseDown}
        data-node-id={node.id}
      >
        {truncateLabel(node.label)}
      </div>
    )
  },
)

const RectangleNode = React.memo(
  ({
    node,
    onNodeMouseDown,
    onClick,
    isDragging,
    zoom,
    pan,
    isSearchHighlighted,
    isFiltered,
  }: {
    node: NodeData
    onNodeMouseDown: (nodeId: string, e: React.MouseEvent) => void
    onClick: (node: NodeData) => void
    isDragging: boolean
    zoom: number
    pan: { x: number; y: number }
    isSearchHighlighted: boolean
    isFiltered: boolean
  }) => {
    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onNodeMouseDown(node.id, e)
      },
      [node.id, onNodeMouseDown],
    )

    // Scale node size with zoom level
    const scaledSizeX = (node.sizeX || 120) * zoom
    const scaledSizeY = (node.sizeY || 60) * zoom

    const style = useMemo(
      () => ({
        left: node.x * zoom + pan.x - scaledSizeX / 2,
        top: node.y * zoom + pan.y - scaledSizeY / 2,
        width: scaledSizeX,
        height: scaledSizeY,
        fontSize: Math.max(10, 14 * zoom), // Scale font size with zoom
        willChange: isDragging ? "transform" : "auto",
      }),
      [node.x, node.y, scaledSizeX, scaledSizeY, zoom, pan.x, pan.y, isDragging],
    )

    return (
      <div
        className={`absolute rounded-xl border-2 flex items-center justify-center font-semibold cursor-move select-none transition-all duration-200 hover:scale-105 hover:shadow-lg ${
          node.className || "node-default"
        } ${isDragging ? "opacity-75 scale-105 shadow-xl z-50" : "shadow-md"} ${
          isSearchHighlighted ? "node-search-highlight" : ""
        } ${isFiltered ? "node-filtered-out" : ""}`}
        style={style}
        onMouseDown={handleMouseDown}
        data-node-id={node.id}
      >
        {truncateLabel(node.label)}
      </div>
    )
  },
)

const TriangleNode = React.memo(
  ({
    node,
    onNodeMouseDown,
    onClick,
    isDragging,
    zoom,
    pan,
    isSearchHighlighted,
    isFiltered,
  }: {
    node: NodeData
    onNodeMouseDown: (nodeId: string, e: React.MouseEvent) => void
    onClick: (node: NodeData) => void
    isDragging: boolean
    zoom: number
    pan: { x: number; y: number }
    isSearchHighlighted: boolean
    isFiltered: boolean
  }) => {
    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onNodeMouseDown(node.id, e)
      },
      [node.id, onNodeMouseDown],
    )

    // Scale node size with zoom level
    const scaledSize = (node.sizeX || 70) * zoom
    const triangleSize = scaledSize * 0.6

    const style = useMemo(
      () => ({
        left: node.x * zoom + pan.x - scaledSize / 2,
        top: node.y * zoom + pan.y - scaledSize / 2,
        width: scaledSize,
        height: scaledSize,
        fontSize: Math.max(8, 12 * zoom), // Scale font size with zoom
        willChange: isDragging ? "transform" : "auto",
      }),
      [node.x, node.y, scaledSize, zoom, pan.x, pan.y, isDragging],
    )

    return (
      <div
        className={`absolute flex items-center justify-center cursor-move select-none transition-all duration-200 hover:scale-105 ${
          isDragging ? "opacity-75 scale-105 z-50" : ""
        } ${isSearchHighlighted ? "node-search-highlight" : ""} ${isFiltered ? "node-filtered-out" : ""}`}
        style={style}
        onMouseDown={handleMouseDown}
        data-node-id={node.id}
      >
        <div className="relative">
          <svg width={triangleSize} height={triangleSize} className="drop-shadow-md">
            <polygon
              points={`${triangleSize / 2},5 ${triangleSize - 5},${triangleSize - 5} 5,${triangleSize - 5}`}
              className={node.className || "node-default"}
              stroke="currentColor"
              strokeWidth={Math.max(1, 2 * zoom)} // Scale stroke width with zoom
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-semibold mt-2">
            {truncateLabel(node.label)}
          </span>
        </div>
      </div>
    )
  },
)

// Optimized SVG Link Component with zoom scaling and max width limit
const SVGLink = React.memo(
  ({ link, nodes, isFiltered, zoom }: { link: LinkData; nodes: NodeData[]; isFiltered: boolean; zoom: number }) => {
    const sourceNode = nodes.find((n) => n.id === link.leftNodeId)
    const targetNode = nodes.find((n) => n.id === link.rightNodeId)

    const pathData = useMemo(() => {
      if (!sourceNode || !targetNode) return ""

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

      const controlX1 = x1 + (dx > 0 ? curvature : -curvature)
      const controlY1 = y1
      const controlX2 = x2 - (dx > 0 ? curvature : -curvature)
      const controlY2 = y2

      return `M ${x1} ${y1} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${x2} ${y2}`
    }, [sourceNode, targetNode])

    const labelPosition = useMemo(() => {
      if (!sourceNode || !targetNode) return { x: 0, y: 0 }
      return {
        x: (sourceNode.x + targetNode.x) / 2,
        y: (sourceNode.y + targetNode.y) / 2 - 8,
      }
    }, [sourceNode, targetNode])

    if (!sourceNode || !targetNode) return null

    // Remove zoom scaling from stroke width - keep lines consistent thickness
    const baseStrokeWidth = 2
    const strokeWidth = baseStrokeWidth // Fixed width, no zoom scaling
    const scaledFontSize = Math.max(8, 11 * zoom)

    return (
      <g className={`link ${link.className || "link-default"} ${isFiltered ? "link-filtered-out" : ""}`}>
        <path
          d={pathData}
          fill="none"
          className="link-path"
          strokeWidth={strokeWidth}
          markerEnd={link.direction !== "right-to-left" ? `url(#arrowhead-${link.className || "default"})` : undefined}
          markerStart={
            link.direction === "right-to-left" || link.direction === "two-way"
              ? `url(#arrowhead-${link.className || "default"})`
              : undefined
          }
        />
        <rect
          x={labelPosition.x - (link.label.length * scaledFontSize) / 2.5}
          y={labelPosition.y - scaledFontSize / 2}
          width={(link.label.length * scaledFontSize) / 1.25}
          height={scaledFontSize * 1.5}
          rx={scaledFontSize / 2}
          className="link-label-bg"
        />
        <text
          x={labelPosition.x}
          y={labelPosition.y + scaledFontSize / 4}
          textAnchor="middle"
          className="link-label-text"
          fontSize={scaledFontSize}
        >
          {link.label}
        </text>
      </g>
    )
  },
)

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
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [nodeSpacing, setNodeSpacing] = useState(1500) // Default to middle range

  // Search and Filter states
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [filteredNodeIds, setFilteredNodeIds] = useState<string[]>([])
  const [filteredLinkIds, setFilteredLinkIds] = useState<string[]>([])
  const [isFiltered, setIsFiltered] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  // Search functionality
  const handleSearch = useCallback(
    (query: string) => {
      const results = nodes
        .filter((node) => node.label.toLowerCase().includes(query.toLowerCase()))
        .map((node) => node.id)
      setSearchResults(results)
    },
    [nodes],
  )

  const handleClearSearch = useCallback(() => {
    setSearchResults([])
  }, [])

  // Filter functionality
  const handleFilter = useCallback(
    (nodeId: string) => {
      // Find all links connected to this node
      const connectedLinks = links.filter((link) => link.leftNodeId === nodeId || link.rightNodeId === nodeId)

      // Find all nodes connected to these links
      const connectedNodeIds = new Set<string>()
      connectedNodeIds.add(nodeId) // Include the original node

      connectedLinks.forEach((link) => {
        connectedNodeIds.add(link.leftNodeId)
        connectedNodeIds.add(link.rightNodeId)
      })

      // Find all links between the connected nodes
      const relevantLinks = links.filter(
        (link) => connectedNodeIds.has(link.leftNodeId) && connectedNodeIds.has(link.rightNodeId),
      )

      setFilteredNodeIds(Array.from(connectedNodeIds))
      setFilteredLinkIds(relevantLinks.map((link) => link.id))
      setIsFiltered(true)
    },
    [links],
  )

  const handleClearFilter = useCallback(() => {
    setFilteredNodeIds([])
    setFilteredLinkIds([])
    setIsFiltered(false)
  }, [])

  // Node click handler
  const handleNodeClick = useCallback((node: NodeData) => {
    setSelectedNode(node)
  }, [])

  // Close popup handler
  const handleClosePopup = useCallback(() => {
    setSelectedNode(null)
  }, [])

  // Node spacing change handler
  const handleSpacingChange = useCallback((spacing: number) => {
    setNodeSpacing(spacing)
  }, [])

  // Drag system for node movement
  const handleNodeMouseDown = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      let hasMoved = false
      const startX = e.clientX
      const startY = e.clientY

      setDraggingNode(nodeId)

      // Calculate initial offset between mouse and node center
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const nodeScreenX = node.x * zoom + pan.x
      const nodeScreenY = node.y * zoom + pan.y

      setDragOffset({
        x: mouseX - nodeScreenX,
        y: mouseY - nodeScreenY,
      })

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = Math.abs(e.clientX - startX)
        const deltaY = Math.abs(e.clientY - startY)

        if (deltaX > 3 || deltaY > 3) {
          hasMoved = true
        }

        if (!containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        // Calculate new node position
        const nodeScreenX = mouseX - dragOffset.x
        const nodeScreenY = mouseY - dragOffset.y

        // Convert to graph coordinates
        const graphX = (nodeScreenX - pan.x) / zoom
        const graphY = (nodeScreenY - pan.y) / zoom

        // Direct position update
        setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, x: graphX, y: graphY } : n)))
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        setDraggingNode(null)
        setDragOffset({ x: 0, y: 0 })

        // Only trigger click if we didn't drag
        if (!hasMoved) {
          handleNodeClick(node)
        }
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [nodes, zoom, pan, dragOffset, setNodes, handleNodeClick],
  )

  // Optimized wheel handler
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

  // Optimized canvas panning
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (draggingNode) return

      const target = e.target as HTMLElement
      if (target.closest("[data-node-id]")) return

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

    // Use organic positioning with current node spacing
    const resetNodes = reorganizeNodes(nodes, links, containerRect.width, containerRect.height, nodeSpacing)
    setNodes(resetNodes)
    setTimeout(handleAutoFit, 100)
  }, [nodes, links, setNodes, handleAutoFit, nodeSpacing])

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

  // Auto-initialize on first load
  useEffect(() => {
    if (!isLoading && !error && nodes.length > 0 && !hasInitialized && containerRef.current) {
      setTimeout(() => {
        handleResetAndReorganize()
        setHasInitialized(true)
      }, 100)
    }
  }, [isLoading, error, nodes.length, hasInitialized, handleResetAndReorganize])

  // Memoize rendered nodes for performance
  const renderedNodes = useMemo(() => {
    return nodes.map((node) => {
      const isSearchHighlighted = searchResults.includes(node.id)
      const isNodeFiltered = isFiltered && !filteredNodeIds.includes(node.id)

      const nodeProps = {
        node,
        onNodeMouseDown: handleNodeMouseDown,
        onClick: handleNodeClick,
        isDragging: draggingNode === node.id,
        zoom,
        pan,
        isSearchHighlighted,
        isFiltered: isNodeFiltered,
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
  }, [nodes, draggingNode, handleNodeMouseDown, handleNodeClick, zoom, pan, searchResults, isFiltered, filteredNodeIds])

  // Memoize rendered links for performance
  const renderedLinks = useMemo(() => {
    return links.map((link) => {
      const isLinkFiltered = isFiltered && !filteredLinkIds.includes(link.id)
      return <SVGLink key={link.id} link={link} nodes={nodes} isFiltered={isLinkFiltered} zoom={zoom} />
    })
  }, [links, nodes, isFiltered, filteredLinkIds, zoom])

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
              {isFiltered && (
                <Button
                  onClick={handleClearFilter}
                  variant="ghost"
                  size="sm"
                  className="w-full p-2 rounded-lg hover:bg-accent transition-colors"
                  title="Clear Filter"
                >
                  <FilterX className="w-4 h-4" />
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Search Box */}
              <SearchBox onSearch={handleSearch} onClear={handleClearSearch} hasResults={searchResults.length > 0} />

              {/* Node Spacing Controls */}
              <div className="mt-4">
                <SpacingControls
                  nodeSpacing={nodeSpacing}
                  onSpacingChange={handleSpacingChange}
                  onReorganize={handleResetAndReorganize}
                />
              </div>

              <Card className="mt-4 border-0 shadow-sm bg-card/60 backdrop-blur-sm">
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
                    Reorganize Layout
                  </Button>
                  <Button
                    onClick={handleExportPNG}
                    size="sm"
                    className="w-full rounded-lg bg-primary hover:bg-primary/90 transition-colors"
                  >
                    <Download className="w-3 h-3 mr-2" />
                    Export PNG
                  </Button>
                  {isFiltered && (
                    <Button
                      onClick={handleClearFilter}
                      variant="destructive"
                      size="sm"
                      className="w-full rounded-lg transition-colors"
                    >
                      <FilterX className="w-3 h-3 mr-2" />
                      Clear Filter
                    </Button>
                  )}
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
              <marker
                id="arrowhead-link-primary"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon points="0 0, 8 3, 0 6" className="fill-blue-500" />
              </marker>
              <marker
                id="arrowhead-link-success"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon points="0 0, 8 3, 0 6" className="fill-emerald-500" />
              </marker>
              <marker
                id="arrowhead-link-warning"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon points="0 0, 8 3, 0 6" className="fill-amber-500" />
              </marker>
              <marker
                id="arrowhead-link-danger"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon points="0 0, 8 3, 0 6" className="fill-rose-500" />
              </marker>
              <marker
                id="arrowhead-link-info"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon points="0 0, 8 3, 0 6" className="fill-cyan-500" />
              </marker>
              <marker
                id="arrowhead-default"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon points="0 0, 8 3, 0 6" className="fill-slate-400" />
              </marker>
            </defs>
            <g transform="translate(5000, 5000)">{renderedLinks}</g>
          </svg>

          <div className="absolute inset-0" style={{ zIndex: 2 }}>
            {renderedNodes}
          </div>
        </div>

        <div className="absolute bottom-3 left-3 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
          <div>Drag to pan • Mouse wheel to zoom • Drag nodes to move • Click nodes for details</div>
        </div>
      </div>

      {/* Node Details Popup */}
      <NodeDetailsPopup node={selectedNode} onClose={handleClosePopup} onFilter={handleFilter} />
    </div>
  )
}

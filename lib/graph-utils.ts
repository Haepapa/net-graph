import type { NodeData } from "./types"

// Helper function to calculate connection points on node edges
export function getNodeConnectionPoint(node: NodeData, targetX: number, targetY: number) {
  const nodeX = node.x
  const nodeY = node.y
  const sizeX = node.sizeX || (node.shape === "circle" ? 80 : node.shape === "rectangle" ? 120 : 70)
  const sizeY = node.sizeY || (node.shape === "circle" ? 80 : node.shape === "rectangle" ? 60 : 70)

  // Calculate angle from node center to target
  const angle = Math.atan2(targetY - nodeY, targetX - nodeX)

  let connectionX: number, connectionY: number

  if (node.shape === "circle") {
    const radius = Math.min(sizeX, sizeY) / 2
    connectionX = nodeX + Math.cos(angle) * radius
    connectionY = nodeY + Math.sin(angle) * radius
  } else if (node.shape === "rectangle") {
    const halfWidth = sizeX / 2
    const halfHeight = sizeY / 2

    // Calculate intersection with rectangle edge
    const dx = Math.abs(Math.cos(angle))
    const dy = Math.abs(Math.sin(angle))

    if (halfHeight * dx > halfWidth * dy) {
      // Intersects with left or right edge
      connectionX = nodeX + (Math.cos(angle) > 0 ? halfWidth : -halfWidth)
      connectionY = nodeY + Math.tan(angle) * (Math.cos(angle) > 0 ? halfWidth : -halfWidth)
    } else {
      // Intersects with top or bottom edge
      connectionX = nodeX + (Math.sin(angle) > 0 ? halfHeight : -halfHeight) / Math.tan(angle)
      connectionY = nodeY + (Math.sin(angle) > 0 ? halfHeight : -halfHeight)
    }
  } else if (node.shape === "triangle") {
    // For triangle, use a circular approximation
    const radius = Math.min(sizeX, sizeY) / 2.5
    connectionX = nodeX + Math.cos(angle) * radius
    connectionY = nodeY + Math.sin(angle) * radius
  } else {
    // Fallback to node center
    connectionX = nodeX
    connectionY = nodeY
  }

  return { x: connectionX, y: connectionY }
}

// Auto-fit calculation
export function calculateAutoFit(nodes: NodeData[], containerWidth: number, containerHeight: number, padding = 100) {
  if (nodes.length === 0) return null

  const minX = Math.min(...nodes.map((n) => n.x)) - padding
  const maxX = Math.max(...nodes.map((n) => n.x)) + padding
  const minY = Math.min(...nodes.map((n) => n.y)) - padding
  const maxY = Math.max(...nodes.map((n) => n.y)) + padding

  const contentWidth = maxX - minX
  const contentHeight = maxY - minY

  const scaleX = containerWidth / contentWidth
  const scaleY = containerHeight / contentHeight
  const zoom = Math.min(scaleX, scaleY, 1)

  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2

  const pan = {
    x: containerWidth / 2 - centerX * zoom,
    y: containerHeight / 2 - centerY * zoom,
  }

  return { zoom, pan }
}

// Reorganize nodes in a grid
export function reorganizeNodes(nodes: NodeData[], columns = 3): NodeData[] {
  return nodes.map((node, index) => {
    const row = Math.floor(index / columns)
    const col = index % columns
    return {
      ...node,
      x: col * 250 + 200,
      y: row * 200 + 200,
    }
  })
}

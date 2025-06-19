import type { NodeData, LinkData } from "./types"

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

// Enhanced organic network-based node positioning prioritizing canvas spread
export function reorganizeNodes(
  nodes: NodeData[],
  links: LinkData[],
  containerWidth: number,
  containerHeight: number,
  nodeSpacing = 1500, // Updated default
): NodeData[] {
  if (nodes.length === 0) return nodes

  // Create a copy of nodes with initial positions spread across canvas
  const workingNodes = nodes.map((node, index) => {
    // Start with more spread out initial positions
    const angle = (index / nodes.length) * 2 * Math.PI
    const radius = Math.min(containerWidth, containerHeight) * 0.3
    const centerX = containerWidth / 2
    const centerY = containerHeight / 2

    return {
      ...node,
      x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 200,
      y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 200,
      vx: 0,
      vy: 0,
    }
  })

  // Enhanced force simulation prioritizing spread across canvas
  const iterations = 600 // More iterations for better spreading
  const repulsionStrength = nodeSpacing * 10 // Much stronger repulsion
  const attractionStrength = 0.1 // Weaker attraction to prevent over-clustering
  const linkDistance = nodeSpacing * 0.4 // Shorter link distance for tight connected groups
  const damping = 0.8 // Lower damping for more movement
  const spreadingForce = 0.02 // New: force to spread nodes toward edges

  for (let iter = 0; iter < iterations; iter++) {
    // Reset forces
    workingNodes.forEach((node) => {
      node.vx = 0
      node.vy = 0
    })

    // Apply very strong repulsion between all nodes (prioritize spreading)
    for (let i = 0; i < workingNodes.length; i++) {
      for (let j = i + 1; j < workingNodes.length; j++) {
        const nodeA = workingNodes[i]
        const nodeB = workingNodes[j]

        const dx = nodeB.x - nodeA.x
        const dy = nodeB.y - nodeA.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Check if nodes are connected
        const areConnected = links.some(
          (link) =>
            (link.leftNodeId === nodeA.id && link.rightNodeId === nodeB.id) ||
            (link.leftNodeId === nodeB.id && link.rightNodeId === nodeA.id),
        )

        // Much stronger repulsion for unconnected nodes to prioritize spreading
        const repulsionMultiplier = areConnected ? 1 : 4 // 4x stronger for unconnected nodes
        const maxRepulsionRange = nodeSpacing * (areConnected ? 1.0 : 3.0) // Much larger range for unconnected

        if (distance > 0 && distance < maxRepulsionRange) {
          const force = (repulsionStrength * repulsionMultiplier) / (distance * distance + 1) // +1 to prevent division by zero
          const fx = (dx / distance) * force
          const fy = (dy / distance) * force

          nodeA.vx -= fx
          nodeA.vy -= fy
          nodeB.vx += fx
          nodeB.vy += fy
        }
      }
    }

    // Apply attraction ONLY for directly linked nodes
    links.forEach((link) => {
      const sourceNode = workingNodes.find((n) => n.id === link.leftNodeId)
      const targetNode = workingNodes.find((n) => n.id === link.rightNodeId)

      if (sourceNode && targetNode) {
        const dx = targetNode.x - sourceNode.x
        const dy = targetNode.y - sourceNode.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 0) {
          const force = (distance - linkDistance) * attractionStrength
          const fx = (dx / distance) * force
          const fy = (dy / distance) * force

          sourceNode.vx += fx
          sourceNode.vy += fy
          targetNode.vx -= fx
          targetNode.vy -= fy
        }
      }
    })

    // Apply spreading force to push nodes toward canvas edges
    const centerX = containerWidth / 2
    const centerY = containerHeight / 2

    workingNodes.forEach((node) => {
      // Calculate distance from center
      const dx = node.x - centerX
      const dy = node.y - centerY
      const distanceFromCenter = Math.sqrt(dx * dx + dy * dy)

      if (distanceFromCenter > 0) {
        // Push nodes away from center (toward edges)
        const spreadFx = (dx / distanceFromCenter) * spreadingForce * nodeSpacing
        const spreadFy = (dy / distanceFromCenter) * spreadingForce * nodeSpacing

        node.vx += spreadFx
        node.vy += spreadFy
      }
    })

    // Update positions with damping
    workingNodes.forEach((node) => {
      node.vx *= damping
      node.vy *= damping

      // Limit velocity
      const maxVelocity = 6 // Higher max velocity for better spreading
      const velocity = Math.sqrt(node.vx * node.vx + node.vy * node.vy)
      if (velocity > maxVelocity) {
        node.vx = (node.vx / velocity) * maxVelocity
        node.vy = (node.vy / velocity) * maxVelocity
      }

      node.x += node.vx
      node.y += node.vy

      // Keep nodes within bounds with smaller margins to allow more spread
      const margin = Math.min(nodeSpacing * 0.2, 100)
      node.x = Math.max(margin, Math.min(containerWidth - margin, node.x))
      node.y = Math.max(margin, Math.min(containerHeight - margin, node.y))
    })
  }

  // Return nodes without velocity properties
  return workingNodes.map(({ vx, vy, ...node }) => node)
}

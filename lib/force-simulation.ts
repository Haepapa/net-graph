import type { NodeData, LinkData } from "./types"

export interface SimulationNode extends NodeData {
  vx: number // velocity x
  vy: number // velocity y
  fx?: number // fixed x position
  fy?: number // fixed y position
}

export interface ForceSimulationConfig {
  repulsionStrength: number
  maxRepulsionDistance: number
  linkStrength: number
  linkDistance: number
  uniformSpacingStrength: number
  idealSpacing: number
  damping: number
  collisionRadius: number
}

export class ForceSimulation {
  private nodes: SimulationNode[] = []
  private links: LinkData[] = []
  private config: ForceSimulationConfig
  private animationId: number | null = null
  private isRunning = false
  private containerWidth = 800
  private containerHeight = 600
  private onUpdate?: (nodes: SimulationNode[]) => void

  constructor(config: Partial<ForceSimulationConfig> = {}) {
    this.config = {
      repulsionStrength: 500,
      maxRepulsionDistance: 150,
      linkStrength: 0.1,
      linkDistance: 100,
      uniformSpacingStrength: 0.05,
      idealSpacing: 400, // Increased default to 400px
      damping: 0.92,
      collisionRadius: 50,
      ...config,
    }
  }

  setNodes(nodes: NodeData[]): void {
    this.nodes = nodes.map((node) => ({
      ...node,
      vx: 0,
      vy: 0,
    }))
  }

  setLinks(links: LinkData[]): void {
    this.links = links
  }

  setContainerSize(width: number, height: number): void {
    this.containerWidth = width
    this.containerHeight = height

    // Auto-adjust ideal spacing based on container size and node count
    if (this.nodes.length > 0) {
      const area = width * height
      const nodeArea = area / this.nodes.length
      const autoIdealSpacing = Math.sqrt(nodeArea) * 0.8
      // Use the larger of auto-calculated or current setting, with reasonable bounds
      this.config.idealSpacing = Math.max(200, Math.min(600, Math.max(autoIdealSpacing, this.config.idealSpacing)))
    }
  }

  setOnUpdate(callback: (nodes: SimulationNode[]) => void): void {
    this.onUpdate = callback
  }

  updateConfig(config: Partial<ForceSimulationConfig>): void {
    this.config = { ...this.config, ...config }
  }

  private applyRepulsionForce(): void {
    const { repulsionStrength, maxRepulsionDistance } = this.config

    for (let i = 0; i < this.nodes.length; i++) {
      const nodeA = this.nodes[i]
      if (nodeA.fx !== undefined && nodeA.fy !== undefined) continue

      for (let j = i + 1; j < this.nodes.length; j++) {
        const nodeB = this.nodes[j]

        const dx = nodeB.x - nodeA.x
        const dy = nodeB.y - nodeA.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Only apply repulsion if nodes are within max repulsion distance
        if (distance === 0 || distance > maxRepulsionDistance) continue

        // Stronger repulsion when nodes are closer
        const force = repulsionStrength / (distance * distance)
        const fx = (dx / distance) * force
        const fy = (dy / distance) * force

        if (nodeA.fx === undefined && nodeA.fy === undefined) {
          nodeA.vx -= fx
          nodeA.vy -= fy
        }

        if (nodeB.fx === undefined && nodeB.fy === undefined) {
          nodeB.vx += fx
          nodeB.vy += fy
        }
      }
    }
  }

  private applyLinkForce(): void {
    const { linkStrength, linkDistance } = this.config

    for (const link of this.links) {
      const source = this.nodes.find((n) => n.id === link.leftNodeId)
      const target = this.nodes.find((n) => n.id === link.rightNodeId)

      if (!source || !target) continue

      const dx = target.x - source.x
      const dy = target.y - source.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance === 0) continue

      // Spring force to maintain link distance
      const force = (distance - linkDistance) * linkStrength
      const fx = (dx / distance) * force
      const fy = (dy / distance) * force

      if (source.fx === undefined && source.fy === undefined) {
        source.vx += fx
        source.vy += fy
      }

      if (target.fx === undefined && target.fy === undefined) {
        target.vx -= fx
        target.vy -= fy
      }
    }
  }

  private applyUniformSpacingForce(): void {
    const { uniformSpacingStrength, idealSpacing } = this.config

    for (let i = 0; i < this.nodes.length; i++) {
      const nodeA = this.nodes[i]
      if (nodeA.fx !== undefined && nodeA.fy !== undefined) continue

      let totalForceX = 0
      let totalForceY = 0
      let neighborCount = 0

      // Find nearby nodes and calculate spacing forces
      for (let j = 0; j < this.nodes.length; j++) {
        if (i === j) continue

        const nodeB = this.nodes[j]
        const dx = nodeB.x - nodeA.x
        const dy = nodeB.y - nodeA.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance === 0) continue

        // Only consider nodes within a reasonable range for spacing
        const maxSpacingRange = idealSpacing * 2
        if (distance > maxSpacingRange) continue

        neighborCount++

        // Calculate force to achieve ideal spacing
        const spacingError = distance - idealSpacing
        const force = spacingError * uniformSpacingStrength

        // Apply force in direction away from or toward the neighbor
        const fx = (dx / distance) * force
        const fy = (dy / distance) * force

        totalForceX += fx
        totalForceY += fy
      }

      // Average the forces from all neighbors
      if (neighborCount > 0) {
        nodeA.vx += totalForceX / neighborCount
        nodeA.vy += totalForceY / neighborCount
      }
    }
  }

  private applyBoundaryForce(): void {
    const margin = 100
    const boundaryStrength = 0.1

    for (const node of this.nodes) {
      if (node.fx !== undefined && node.fy !== undefined) continue

      // Left boundary
      if (node.x < margin) {
        node.vx += (margin - node.x) * boundaryStrength
      }
      // Right boundary
      if (node.x > this.containerWidth - margin) {
        node.vx -= (node.x - (this.containerWidth - margin)) * boundaryStrength
      }
      // Top boundary
      if (node.y < margin) {
        node.vy += (margin - node.y) * boundaryStrength
      }
      // Bottom boundary
      if (node.y > this.containerHeight - margin) {
        node.vy -= (node.y - (this.containerHeight - margin)) * boundaryStrength
      }
    }
  }

  private applyCollisionForce(): void {
    const { collisionRadius } = this.config

    for (let i = 0; i < this.nodes.length; i++) {
      const nodeA = this.nodes[i]

      for (let j = i + 1; j < this.nodes.length; j++) {
        const nodeB = this.nodes[j]

        const dx = nodeB.x - nodeA.x
        const dy = nodeB.y - nodeA.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const minDistance = collisionRadius

        if (distance < minDistance && distance > 0) {
          const overlap = minDistance - distance
          const fx = (dx / distance) * overlap * 0.5
          const fy = (dy / distance) * overlap * 0.5

          if (nodeA.fx === undefined && nodeA.fy === undefined) {
            nodeA.x -= fx
            nodeA.y -= fy
          }

          if (nodeB.fx === undefined && nodeB.fy === undefined) {
            nodeB.x += fx
            nodeB.y += fy
          }
        }
      }
    }
  }

  private calculateAverageDistance(): number {
    if (this.nodes.length < 2) return 0

    let totalDistance = 0
    let pairCount = 0

    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const dx = this.nodes[j].x - this.nodes[i].x
        const dy = this.nodes[j].y - this.nodes[i].y
        const distance = Math.sqrt(dx * dx + dy * dy)
        totalDistance += distance
        pairCount++
      }
    }

    return pairCount > 0 ? totalDistance / pairCount : 0
  }

  private tick(): void {
    const { damping } = this.config

    // Apply all forces
    this.applyRepulsionForce()
    this.applyLinkForce()
    this.applyUniformSpacingForce()
    this.applyBoundaryForce()

    // Update positions and apply damping
    for (const node of this.nodes) {
      if (node.fx !== undefined && node.fy !== undefined) {
        // For fixed nodes (being dragged), set position directly and reset velocity
        node.x = node.fx
        node.y = node.fy
        node.vx = 0
        node.vy = 0
        continue
      }

      // Apply damping
      node.vx *= damping
      node.vy *= damping

      // Limit maximum velocity to prevent instability
      const maxVelocity = 10
      const velocity = Math.sqrt(node.vx * node.vx + node.vy * node.vy)
      if (velocity > maxVelocity) {
        node.vx = (node.vx / velocity) * maxVelocity
        node.vy = (node.vy / velocity) * maxVelocity
      }

      // Update position
      node.x += node.vx
      node.y += node.vy
    }

    // Apply collision detection after position update
    this.applyCollisionForce()

    // Notify update
    if (this.onUpdate) {
      this.onUpdate([...this.nodes])
    }

    // Continue animation if running
    if (this.isRunning) {
      this.animationId = requestAnimationFrame(() => this.tick())
    }
  }

  start(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.tick()
  }

  stop(): void {
    this.isRunning = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  restart(): void {
    this.stop()
    // Reset velocities
    for (const node of this.nodes) {
      node.vx = 0
      node.vy = 0
    }
    this.start()
  }

  fixNode(nodeId: string, x?: number, y?: number): void {
    const node = this.nodes.find((n) => n.id === nodeId)
    if (node) {
      node.fx = x
      node.fy = y
      // Immediately update position and reset velocity for instant response
      if (x !== undefined && y !== undefined) {
        node.x = x
        node.y = y
        node.vx = 0
        node.vy = 0
      }
    }
  }

  unfixNode(nodeId: string): void {
    const node = this.nodes.find((n) => n.id === nodeId)
    if (node) {
      node.fx = undefined
      node.fy = undefined
    }
  }

  getNodes(): SimulationNode[] {
    return [...this.nodes]
  }

  isStable(): boolean {
    const threshold = 0.1
    return this.nodes.every((node) => Math.abs(node.vx) < threshold && Math.abs(node.vy) < threshold)
  }

  getAverageDistance(): number {
    return this.calculateAverageDistance()
  }

  getIdealSpacing(): number {
    return this.config.idealSpacing
  }
}

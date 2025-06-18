export interface NodeData {
  id: string
  label: string
  className?: string
  shape: "circle" | "rectangle" | "triangle"
  sizeX?: number
  sizeY?: number
  x: number
  y: number
}

export interface LinkData {
  id: string
  label: string
  direction: "left-to-right" | "right-to-left" | "two-way"
  leftNodeId: string
  rightNodeId: string
  className?: string
}

export interface LegendData {
  shape: string
  color: string
  label: string
}

export interface GraphData {
  nodes: NodeData[]
  links: LinkData[]
  legend: LegendData[]
}

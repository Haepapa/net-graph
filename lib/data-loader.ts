import type { NodeData, LinkData, LegendData, GraphData } from "./types"

// Default fallback data
const DEFAULT_NODES: NodeData[] = [
  {
    id: "1",
    label: "Start",
    className: "node-success",
    shape: "circle",
    sizeX: 80,
    sizeY: 80,
    x: 150,
    y: 150,
  },
  {
    id: "2",
    label: "Process A",
    className: "node-primary",
    shape: "rectangle",
    sizeX: 120,
    sizeY: 60,
    x: 350,
    y: 150,
  },
  {
    id: "3",
    label: "Decision",
    className: "node-warning",
    shape: "triangle",
    sizeX: 70,
    sizeY: 70,
    x: 550,
    y: 150,
  },
  {
    id: "4",
    label: "Process B",
    className: "node-secondary",
    shape: "rectangle",
    sizeX: 120,
    sizeY: 60,
    x: 350,
    y: 300,
  },
  {
    id: "5",
    label: "End",
    className: "node-danger",
    shape: "circle",
    sizeX: 80,
    sizeY: 80,
    x: 550,
    y: 300,
  },
]

const DEFAULT_LINKS: LinkData[] = [
  {
    id: "link1",
    label: "Next",
    direction: "left-to-right",
    leftNodeId: "1",
    rightNodeId: "2",
    className: "link-primary",
  },
  {
    id: "link2",
    label: "Evaluate",
    direction: "left-to-right",
    leftNodeId: "2",
    rightNodeId: "3",
    className: "link-info",
  },
  {
    id: "link3",
    label: "Yes",
    direction: "left-to-right",
    leftNodeId: "3",
    rightNodeId: "4",
    className: "link-success",
  },
  {
    id: "link4",
    label: "Complete",
    direction: "left-to-right",
    leftNodeId: "4",
    rightNodeId: "5",
    className: "link-warning",
  },
  {
    id: "link5",
    label: "No",
    direction: "two-way",
    leftNodeId: "3",
    rightNodeId: "2",
    className: "link-danger",
  },
]

const DEFAULT_LEGEND: LegendData[] = [
  { shape: "circle", color: "node-success", label: "Start/End Points" },
  { shape: "rectangle", color: "node-primary", label: "Process Steps" },
  { shape: "triangle", color: "node-warning", label: "Decision Points" },
]

// Utility function to safely fetch and parse JSON
async function fetchJSON<T>(url: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(url, {
      cache: "no-store", // Ensure fresh data in development
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data as T
  } catch (error) {
    console.warn(`Failed to load ${url}:`, error)
    return fallback
  }
}

// Main data loading function
export async function loadGraphData(): Promise<GraphData> {
  try {
    // Load all data files in parallel
    const [nodes, links, legend] = await Promise.all([
      fetchJSON<NodeData[]>("/data/nodes.json", DEFAULT_NODES),
      fetchJSON<LinkData[]>("/data/links.json", DEFAULT_LINKS),
      fetchJSON<LegendData[]>("/data/legend.json", DEFAULT_LEGEND),
    ])

    return {
      nodes,
      links,
      legend,
    }
  } catch (error) {
    console.error("Error loading graph data:", error)
    // Return default data if everything fails
    return {
      nodes: DEFAULT_NODES,
      links: DEFAULT_LINKS,
      legend: DEFAULT_LEGEND,
    }
  }
}

// Validation functions
export function validateNodeData(data: any): data is NodeData[] {
  if (!Array.isArray(data)) return false

  return data.every(
    (node) =>
      typeof node.id === "string" &&
      typeof node.label === "string" &&
      ["circle", "rectangle", "triangle"].includes(node.shape) &&
      typeof node.x === "number" &&
      typeof node.y === "number",
  )
}

export function validateLinkData(data: any): data is LinkData[] {
  if (!Array.isArray(data)) return false

  return data.every(
    (link) =>
      typeof link.id === "string" &&
      typeof link.label === "string" &&
      ["left-to-right", "right-to-left", "two-way"].includes(link.direction) &&
      typeof link.leftNodeId === "string" &&
      typeof link.rightNodeId === "string",
  )
}

export function validateLegendData(data: any): data is LegendData[] {
  if (!Array.isArray(data)) return false

  return data.every(
    (item) => typeof item.shape === "string" && typeof item.color === "string" && typeof item.label === "string",
  )
}

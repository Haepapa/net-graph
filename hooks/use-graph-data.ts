"use client"

import { useState, useEffect } from "react"
import { loadGraphData } from "@/lib/data-loader"
import type { NodeData, LinkData, LegendData } from "@/lib/types"

export function useGraphData() {
  const [nodes, setNodes] = useState<NodeData[]>([])
  const [links, setLinks] = useState<LinkData[]>([])
  const [legendData, setLegendData] = useState<LegendData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await loadGraphData()

        if (isMounted) {
          setNodes(data.nodes)
          setLinks(data.links)
          setLegendData(data.legend)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load graph data")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    nodes,
    links,
    legendData,
    isLoading,
    error,
    setNodes,
    setLinks,
    setLegendData,
  }
}

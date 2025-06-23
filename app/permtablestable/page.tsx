"use client";
import dynamic from "next/dynamic";
import { useRef, useEffect, useState } from "react";
import type { GraphCanvasRef, GraphNode, GraphEdge } from "reagraph";
import { useSelection } from "reagraph";
import { darkTheme } from "reagraph";

const GraphCanvas = dynamic(
  () => import("reagraph").then((mod) => mod.GraphCanvas),
  { ssr: false }
);

export default function PermTablesTable() {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);

  useEffect(() => {
    fetch("/data/nodes.json")
      .then((res) => res.json())
      .then((data) => {
        setNodes(data);
      });
    fetch("/data/edges.json")
      .then((res) => res.json())
      .then((data) => {
        setEdges(data);
      });
  }, []);

  // Filter nodes as before
  const filteredNodes = nodes.filter((node) => node.fill === "#fff194");

  // Get the set of filtered node IDs
  const nodeIds = new Set(filteredNodes.map((node) => node.id));

  // Filter edges where source or target is in filtered node IDs
  const filteredEdges = edges.filter(
    (edge) => nodeIds.has(edge.source) || nodeIds.has(edge.target)
  );

  // Collect all node IDs from filteredEdges' source and target
  const edgeNodeIds = new Set<string>();
  filteredEdges.forEach((edge) => {
    if (edge.source) edgeNodeIds.add(edge.source);
    if (edge.target) edgeNodeIds.add(edge.target);
  });

  // Filter nodes to only those present in edgeNodeIds
  const finalNodes = nodes.filter((node) => edgeNodeIds.has(node.id));

  const {
    selections,
    actives,
    onNodeClick,
    onCanvasClick,
    onNodePointerOver,
    onNodePointerOut,
  } = useSelection({
    ref: graphRef,
    nodes,
    edges,
    pathSelectionType: "all",
    pathHoverType: "in",
  });
  return (
    <GraphCanvas
      theme={darkTheme}
      ref={graphRef}
      nodes={finalNodes}
      edges={filteredEdges}
      selections={selections}
      actives={actives}
      onCanvasClick={onCanvasClick}
      onNodePointerOver={onNodePointerOver}
      onNodePointerOut={onNodePointerOut}
      onNodeClick={onNodeClick}
      onNodeDoubleClick={(node) => alert(node.name)}
    />
  );
}

"use client";
import dynamic from "next/dynamic";
import { useRef, useEffect, useState } from "react";
import type { GraphCanvasRef, GraphNode, GraphEdge } from "reagraph";
import { useSelection } from "reagraph";
const GraphCanvas = dynamic(
  () => import("reagraph").then((mod) => mod.GraphCanvas),
  { ssr: false }
);

export default function Home() {
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

  const { selections, actives, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes,
    edges,
    pathSelectionType: "all",
  });
  return (
    <GraphCanvas
      ref={graphRef}
      nodes={nodes}
      edges={edges}
      selections={selections}
      actives={actives}
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
      onNodeDoubleClick={(node) => alert(node.name)}
    />
  );
}

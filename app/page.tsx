"use client";
import dynamic from "next/dynamic";
import { useRef } from "react";
import type { GraphCanvasRef, GraphNode, GraphEdge } from "reagraph";
import { useSelection } from "reagraph";
const GraphCanvas = dynamic(
  () => import("reagraph").then((mod) => mod.GraphCanvas),
  { ssr: false }
);

export default function Home() {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const nodes: GraphNode[] = [
    {
      id: "n-1",
      label: "...meri lis file upload.egp",
      fill: "#e66557",
      type: "SAS Enterprise Guide",
      name: "data/get/Data meri lis file upload.egp",
      size: 10,
    },
    {
      id: "n-2",
      label: "2",
      size: 3,
    },
    {
      id: "n-3",
      label: "3",
      size: 20,
    },
    {
      id: "n-4",
      label: "4",

      size: 12,
    },
  ];

  const edges: GraphEdge[] = [
    {
      id: "1->2",
      source: "n-1",
      target: "n-2",
      label: "Edge 1-2",
    },
    {
      id: "2->3",
      source: "n-2",
      target: "n-3",
      label: "Edge 2-3",
    },
    {
      id: "2->4",
      source: "n-2",
      target: "n-4",
      label: "Edge 2-4",
    },
  ];

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

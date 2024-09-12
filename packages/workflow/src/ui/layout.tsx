import { useMemo, useEffect } from 'react';
import Dagre from '@dagrejs/dagre';
import { Node, Edge, Rect } from '@xyflow/react';
import { TriggerProps, WorkflowProps, type Direction } from './Editor';
import { KeyOfFromMappedResult } from '@sinclair/typebox';
import { useProvider } from './Provider';

type LayoutArgs = {
  nodes: Node[];
  edges: Edge[];
  width: number;
  height: number;
  direction: Direction;

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  nodesInitialized: boolean;
}


export const useLayout = (args: LayoutArgs): Rect => {
  const { workflow, trigger } = useProvider();

  const { width, height, direction, setNodes, setEdges, nodesInitialized } = args;
  let { nodes, edges } = args;

  // Force a redraw any time the actions or edges change.
  const parsed = parseWorkflow({ workflow, trigger });
  if (parsed.nodes.length > nodes.length) {
    nodes = parsed.nodes;
    edges = parsed.edges;
  }

  return useMemo(() => {
    if (!nodesInitialized) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    const { nodes: newNodes, edges: newEdges, rect } = getLayoutedElements(nodes, edges, direction)

    setNodes(newNodes);
    setEdges(newEdges);

    return rect;
  }, [JSON.stringify(nodes), JSON.stringify(edges), width, height, direction, nodesInitialized]);
}

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction: Direction): { nodes: Node[], edges: Edge[], rect: Rect } => {
  const g = new Dagre.graphlib.Graph({ directed: true }).setDefaultEdgeLabel(() => ({}));

  let nodePadding = 60 // TODO: Make this configurable.
  if (direction === "right") {
    nodePadding += 50;
  }

  g.setGraph({
    nodesep: 100, // TODO: Make this configurable. xpad
    ranksep: nodePadding, // TODO: Make this configurable.  ypad
    rankdir: direction === "down" ? "TB" : "LR"
  });

  // Add all nodes to the graph to compute the ideal layout
  nodes.forEach((node) =>
    g.setNode(node.id, {
      width: node.measured?.width ?? 0,
      height: node.measured?.height ?? 0,
      node,
    }),
  );

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));

  Dagre.layout(g);

  // Calculate the bounding rects of the graph.
  const layout = g.nodes().map((nodeID) => {
    const dagreNode = g.node(nodeID);
    const node = (dagreNode as any).node as Node;
  
    const x = dagreNode.x - (node.measured?.width ?? 0) / 2;
    const y = dagreNode.y - (node.measured?.height ?? 0) / 2;
  
    return { ...node, position: { x, y } };
  });

  const minX = Math.min(...layout.map((node) => node.position.x));
  const minY = Math.min(...layout.map((node) => node.position.y));
  const maxX = Math.max(...layout.map((node) => node.position.x + (node.measured?.width ?? 0)));
  const maxY = Math.max(...layout.map((node) => node.position.y + (node.measured?.height ?? 0)));

  return {
    nodes: layout,
    edges,
    rect: {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    }
  };

};

type parseWorkflowProps = WorkflowProps & TriggerProps & { blankNodeParent?: Node }

export const parseWorkflow = ({ workflow, trigger, blankNodeParent }: parseWorkflowProps): { nodes: Node[], edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Add trigger node
  nodes.push({
    id: '$source',
    type: 'trigger',
    position: { x: 0, y: 0 },
    data: { trigger }
  });

  // Always handle the blank node case.
  if (blankNodeParent) {
    nodes.push({
      id: '$blank',
      type: 'blank',
      position: { x: 0, y: 0 },
      data: { parent: blankNodeParent }
    });
    edges.push({
      id: `blank-node-edge`,
      source: blankNodeParent.id,
      target: '$blank',
    });
  }

  if (!workflow) {
    return { nodes, edges };
  }

  (workflow.actions || []).forEach((action, index) => {
    nodes.push({
      id: action.id,
      type: 'action',
      position: { x: 0, y: 0 },
      data: { action }
    });
  });

  (workflow.edges || []).forEach((edge) => {
    edges.push({
      id: `${edge.from}-${edge.to}`,
      source: edge.from,
      target: edge.to,
    });
  });

  // TODO: Always add an end node to every sink.
  return { nodes, edges };
};
